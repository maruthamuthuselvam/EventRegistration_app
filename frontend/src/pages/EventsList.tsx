import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, ArrowRight, PlusCircle } from 'lucide-react';

import { API_BASE } from '../api';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async (q = '') => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/events?q=${q}`);
            setEvents(res.data.events);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEvents(searchTerm);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Discover <span className="gradient-text">Events</span></h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Manage and track your premium event experiences.</p>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '400px', width: '100%' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>Search</button>
                </form>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <div className="spinner"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Calendar size={40} style={{ color: 'var(--text-dim)' }} />
                    </div>
                    <h3>No events found</h3>
                    <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0 2rem' }}>Ready to host something amazing?</p>
                    <Link to="/events/new" className="btn btn-primary">
                        <PlusCircle size={18} />
                        Create Your First Event
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {events.map((event: any) => (
                        <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="glass-panel"
                            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Premium Card Header / Visual */}
                            <div style={{ height: '8px', background: 'var(--accent-gradient)' }}></div>

                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div style={{ color: event.tickets_left > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {event.tickets_left} slots left
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.8rem' }}>
                                    {event.description || 'No description provided.'}
                                </p>

                                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={16} />
                                        <span>{event.location || 'Remote'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)' }}>
                                    <Users size={16} />
                                    <span style={{ fontSize: '0.85rem' }}>{event.tickets_sold} Registered</span>
                                </div>
                                <Link to={`/events/${event.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    View Details
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default EventsList;
