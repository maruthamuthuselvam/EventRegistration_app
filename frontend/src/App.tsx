import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, PlusCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---
const Navbar = () => (
  <nav className="glass-panel" style={{ margin: '1rem', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Calendar className="gradient-text" size={32} />
      <span>Event<span className="gradient-text">Flow</span></span>
    </Link>
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Link to="/" className="nav-link">Events</Link>
      <Link to="/upload" className="nav-link">Import CSV</Link>
      <Link to="/report" className="nav-link">Analytics</Link>
      <Link to="/events/new" className="btn btn-primary">
        <PlusCircle size={18} />
        <span>Create Event</span>
      </Link>
    </div>
  </nav>
);

// --- PAGES ---
import EventsList from './pages/EventsList.tsx';
import EventForm from './pages/EventForm.tsx';
import EventView from './pages/EventView.tsx';
import Attendees from './pages/Attendees.tsx';
import Report from './pages/Report.tsx';
import Upload from './pages/Upload.tsx';

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <main style={{ padding: '2rem 1rem' }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<EventsList />} />
              <Route path="/events/new" element={<EventForm />} />
              <Route path="/events/:id" element={<EventView />} />
              <Route path="/events/:id/edit" element={<EventForm />} />
              <Route path="/events/:id/attendees" element={<Attendees />} />
              <Route path="/report" element={<Report />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
