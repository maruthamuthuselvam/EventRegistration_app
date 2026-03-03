import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, MapPin, Users, Ticket, UserPlus } from 'lucide-react';

import { API_BASE } from '../api';

const EventView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/events/${id}`);
            setEvent(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_BASE}/events/${id}`);
                navigate('/');
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><div className="spinner"></div></div>;
    if (!event) return <div>Event not found.</div>;

    const progress = (event.tickets_sold / (event.capacity || 1)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ overflow: 'hidden' }}
        >
            {/* Hero Header */}
            <div style={{ padding: '4rem 3rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <span style={{ background: 'var(--accent-gradient)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{event.title}</h1>
                        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={20} />
                                <span>{event.location || 'Remote'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Ticket size={20} />
                                <span>{event.capacity} Capacity</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to={`/events/${id}/edit`} className="btn btn-secondary">
                            <Edit3 size={18} />
                            Edit
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger">
                            <Trash2 size={18} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', padding: '3rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>About this Event</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                        {event.description || 'No description provided for this event.'}
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={20} className="gradient-text" />
                        Registration Status
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--text-dim)' }}>Tickets Sold</span>
                            <span style={{ fontWeight: 600 }}>{event.tickets_sold} / {event.capacity}</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8 }}
                                style={{ height: '100%', background: 'var(--accent-gradient)' }}
                            ></motion.div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to={`/events/${id}/attendees`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <UserPlus size={18} />
                            Register Attendee
                        </Link>
                        <Link to={`/events/${id}/attendees`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Users size={18} />
                            Manage Guest List
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EventView;
