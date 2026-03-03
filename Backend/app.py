from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from dateutil import parser as dateparser
import csv
import io
import os
from datetime import datetime
from flask_cors import CORS
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Deployment configuration: Flask will serve the React frontend from the 'frontend/dist' folder
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), 'frontend', 'dist')

app = Flask(__name__, 
            static_folder=FRONTEND_DIR, 
            template_folder=FRONTEND_DIR,
            static_url_path='/')

CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(BASE_DIR, 'database.db'))
# Handle Postgres prefix if using Render/Heroku (postgres:// -> postgresql://)
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

db = SQLAlchemy(app)

# Models
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(200), nullable=True)
    capacity = db.Column(db.Integer, nullable=False, default=0)
    tickets_sold = db.Column(db.Integer, nullable=False, default=0)

    attendees = db.relationship('Attendee', backref='event', cascade="all, delete-orphan")

    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def tickets_left(self):
        return max(0, (self.capacity or 0) - (self.tickets_sold or 0))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'location': self.location,
            'capacity': self.capacity,
            'tickets_sold': self.tickets_sold,
            'tickets_left': self.tickets_left()
        }

class Attendee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'event_id': self.event_id,
            'registered_at': self.registered_at.isoformat()
        }

# Initialize DB
@app.cli.command('initdb')
def initdb_command():
    db.create_all()
    print("Initialized the database.")

# Serve React Frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        # Check if the file exists in FRONTEND_DIR, if not, serve index.html for client-side routing
        return render_template("index.html")

# Routes (deprecated in favor of React API)
@app.route('/api/legacy-home')
def home():
    return redirect(url_for('list_events'))
def list_events():
    q = request.args.get('q', '').strip()
    date_filter = request.args.get('date', '').strip()
    query = Event.query
    if q:
        query = query.filter(Event.title.ilike(f'%{q}%'))
    if date_filter:
        try:
            dt = dateparser.parse(date_filter).date()
            query = query.filter(Event.date == dt)
        except Exception:
            flash('Invalid date format for search. Use YYYY-MM-DD or natural language.', 'warning')
    events = query.order_by(Event.date.asc()).all()
    return render_template('events.html', events=events, q=q, date_filter=date_filter)

@app.route('/api/events/new', methods=['GET', 'POST'])
def create_event():
    if request.method == 'POST':
        title = request.form['title'].strip()
        description = request.form.get('description', '').strip()
        date_str = request.form['date'].strip()
        location = request.form.get('location', '').strip()
        capacity = int(request.form.get('capacity') or 0)
        try:
            date_obj = dateparser.parse(date_str).date()
        except Exception:
            flash('Invalid date. Use YYYY-MM-DD or similar.', 'danger')
            return redirect(url_for('create_event'))
        ev = Event(title=title, description=description, date=date_obj, location=location, capacity=capacity)
        db.session.add(ev)
        db.session.commit()
        flash('Event created.', 'success')
        return redirect(url_for('list_events'))
    return render_template('event_form.html', action="Create", event=None)

@app.route('/api/events/<int:event_id>/edit', methods=['GET', 'POST'])
def edit_event(event_id):
    event = Event.query.get_or_404(event_id)
    if request.method == 'POST':
        event.title = request.form['title'].strip()
        event.description = request.form.get('description', '').strip()
        date_str = request.form['date'].strip()
        event.location = request.form.get('location', '').strip()
        try:
            event.capacity = int(request.form.get('capacity') or 0)
            event.date = dateparser.parse(date_str).date()
        except Exception:
            flash('Invalid input. Check date and capacity.', 'danger')
            return redirect(url_for('edit_event', event_id=event_id))
        db.session.commit()
        flash('Event updated.', 'success')
        return redirect(url_for('list_events'))
    return render_template('event_form.html', action="Edit", event=event)

@app.route('/api/events/<int:event_id>/delete', methods=['POST'])
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    flash('Event deleted.', 'success')
    return redirect(url_for('list_events'))

@app.route('/api/events/<int:event_id>')
def view_event(event_id):
    event = Event.query.get_or_404(event_id)
    return render_template('event_view.html', event=event)

# Attendees
@app.route('/api/events/<int:event_id>/attendees', methods=['GET', 'POST'])
def manage_attendees(event_id):
    event = Event.query.get_or_404(event_id)
    if request.method == 'POST':
        name = request.form['name'].strip()
        email = request.form.get('email', '').strip()
        if event.tickets_left() <= 0:
            flash('Cannot register — event is full.', 'danger')
            return redirect(url_for('manage_attendees', event_id=event_id))
        attendee = Attendee(name=name, email=email, event=event)
        event.tickets_sold = (event.tickets_sold or 0) + 1
        db.session.add(attendee)
        db.session.commit()
        flash('Registered successfully.', 'success')
        return redirect(url_for('manage_attendees', event_id=event_id))
    attendees = Attendee.query.filter_by(event_id=event_id).order_by(Attendee.registered_at.desc()).all()
    return render_template('attendees.html', event=event, attendees=attendees)

@app.route('/api/attendees/<int:att_id>/delete', methods=['POST'])
def delete_attendee(att_id):
    att = Attendee.query.get_or_404(att_id)
    event = att.event
    db.session.delete(att)
    if event.tickets_sold and event.tickets_sold > 0:
        event.tickets_sold -= 1
    db.session.commit()
    flash('Attendee removed and ticket freed.', 'success')
    return redirect(url_for('manage_attendees', event_id=event.id))

# API CSV Upload
@app.route('/api/upload', methods=['GET', 'POST'])
def upload_csv():
    if request.method == 'POST':
        uploaded = request.files.get('file')
        if not uploaded:
            if request.headers.get('Accept') == 'application/json' or request.is_json:
                return {"error": "No file selected"}, 400
            flash('No file selected.', 'warning')
            return redirect(url_for('upload_csv'))
        try:
            stream = io.StringIO(uploaded.stream.read().decode('utf-8'))
            reader = csv.DictReader(stream)
            inserted = 0
            for row in reader:
                title = (row.get('Event Title') or row.get('title') or '').strip()
                if not title:
                    continue
                description = (row.get('Description') or row.get('description') or '').strip()
                date_str = (row.get('Date') or row.get('date') or '').strip()
                location = (row.get('Location') or row.get('location') or '').strip()
                capacity = int(row.get('Capacity') or row.get('capacity') or 0)
                try:
                    date_obj = dateparser.parse(date_str).date()
                except Exception:
                    # skip rows with invalid date
                    continue
                ev = Event(title=title, description=description, date=date_obj, location=location, capacity=capacity)
                db.session.add(ev)
                inserted += 1
            db.session.commit()
            
            if request.headers.get('Accept') == 'application/json' or request.is_json:
                return {"message": f"CSV import complete. Inserted {inserted} events.", "inserted": inserted}
                
            flash(f'CSV import complete. Inserted {inserted} events.', 'success')
            return redirect(url_for('list_events'))
        except Exception as e:
            if request.headers.get('Accept') == 'application/json' or request.is_json:
                return {"error": str(e)}, 400
            flash(f'Error processing CSV: {str(e)}', 'danger')
            return redirect(url_for('upload_csv'))
    return render_template('upload.html')

# Simple report (for potential legacy or direct access)
@app.route('/api/legacy-report')
def report():
    total_events = Event.query.count()
    total_attendees = Attendee.query.count()
    total_tickets_sold = db.session.query(db.func.sum(Event.tickets_sold)).scalar() or 0
    # For revenue: placeholder assuming fixed price? We'll show tickets sold only. You can extend with price field.
    return render_template('report.html',
                           total_events=total_events,
                           total_attendees=total_attendees,
                           total_tickets_sold=total_tickets_sold)

# API Routes
@app.route('/api/events')
def api_list_events():
    q = request.args.get('q', '').strip()
    date_filter = request.args.get('date', '').strip()
    query = Event.query
    if q:
        query = query.filter(Event.title.ilike(f'%{q}%'))
    if date_filter:
        try:
            dt = dateparser.parse(date_filter).date()
            query = query.filter(Event.date == dt)
        except Exception:
            pass
    events = query.order_by(Event.date.asc()).all()
    return {"events": [e.to_dict() for e in events]}

@app.route('/api/events', methods=['POST'])
def api_create_event():
    data = request.json
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    date_str = data.get('date', '').strip()
    location = data.get('location', '').strip()
    capacity = int(data.get('capacity') or 0)
    
    if not title or not date_str:
        return {"error": "Title and date are required"}, 400
        
    try:
        date_obj = dateparser.parse(date_str).date()
    except Exception:
        return {"error": "Invalid date format"}, 400
        
    ev = Event(title=title, description=description, date=date_obj, location=location, capacity=capacity)
    db.session.add(ev)
    db.session.commit()
    return ev.to_dict(), 201

@app.route('/api/events/<int:event_id>', methods=['GET'])
def api_view_event(event_id):
    event = Event.query.get_or_404(event_id)
    return event.to_dict()

@app.route('/api/events/<int:event_id>', methods=['PUT'])
def api_edit_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.json
    
    event.title = data.get('title', event.title).strip()
    event.description = data.get('description', event.description).strip()
    date_str = data.get('date', '').strip()
    event.location = data.get('location', event.location).strip()
    event.capacity = int(data.get('capacity', event.capacity))

    if date_str:
        try:
            event.date = dateparser.parse(date_str).date()
        except Exception:
            return {"error": "Invalid date format"}, 400
            
    db.session.commit()
    return event.to_dict()

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def api_delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return {"message": "Event deleted"}

@app.route('/api/events/<int:event_id>/attendees', methods=['GET'])
def api_list_attendees(event_id):
    event = Event.query.get_or_404(event_id)
    attendees = Attendee.query.filter_by(event_id=event_id).order_by(Attendee.registered_at.desc()).all()
    return {
        "event": event.to_dict(),
        "attendees": [a.to_dict() for a in attendees]
    }

@app.route('/api/events/<int:event_id>/attendees', methods=['POST'])
def api_register_attendee(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.json
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    
    if not name:
        return {"error": "Name is required"}, 400
        
    if event.tickets_left() <= 0:
        return {"error": "Event is full"}, 400
        
    attendee = Attendee(name=name, email=email, event=event)
    event.tickets_sold = (event.tickets_sold or 0) + 1
    db.session.add(attendee)
    db.session.commit()
    return attendee.to_dict(), 201

@app.route('/api/attendees/<int:att_id>', methods=['DELETE'])
def api_delete_attendee(att_id):
    att = Attendee.query.get_or_404(att_id)
    event = att.event
    db.session.delete(att)
    if event.tickets_sold and event.tickets_sold > 0:
        event.tickets_sold -= 1
    db.session.commit()
    return {"message": "Attendee removed"}

@app.route('/api/report')
def api_report():
    total_events = Event.query.count()
    total_attendees = Attendee.query.count()
    total_tickets_sold = db.session.query(db.func.sum(Event.tickets_sold)).scalar() or 0
    return {
        "total_events": total_events,
        "total_attendees": total_attendees,
        "total_tickets_sold": total_tickets_sold
    }

if __name__ == '__main__':
    # Auto-create DB if missing
    if not os.path.exists(os.path.join(BASE_DIR, 'database.db')):
        with app.app_context():
            db.create_all()
            print("Created database.db")
    
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
