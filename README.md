 # Event Manager (Flask + React)

Simple event management app for the Stanch Solutions hiring test.

## 🚀 Deployment

This project is configured to be deployed as a unified application where the Flask backend serves the compiled React frontend.

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### Local Production Build
1. **Installation**:
   ```bash
   npm run install:all
   ```
2. **Build Frontend**:
   ```bash
   npm run build:frontend
   ```
3. **Run Production Server**:
   ```bash
   # Set environment variables (optional)
   export PORT=5001
   export SECRET_KEY=your-secret-key
   
   npm start
   ```

### Docker Deployment
The included `Dockerfile` performs a multi-stage build:
```bash
docker build -t event-management .
docker run -p 5001:5001 -e PORT=5001 event-management
```

### Platforms
- **Render/Heroku**: Connect your repository, and it will automatically detect the `Procfile`. Set the Environment Variables (`DATABASE_URL`, `SECRET_KEY`).
- **Cloud Run/Docker**: Use the provided `Dockerfile`.

## Features
- Create / Read / Update / Delete events
- Register attendees (increments tickets sold)
- CSV import (Event Title, Description, Date, Location, Capacity)
- Search events by title or date
- Simple report page

## Setup (quick)
1. Create virtual env:
   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS / Linux
   venv\Scripts\activate      # Windows
