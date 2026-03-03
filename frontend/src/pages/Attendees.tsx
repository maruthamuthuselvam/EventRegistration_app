import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Mail, User, ArrowLeft } from 'lucide-react';

import { API_BASE } from '../api';

const Attendees = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        fetchAttendees();
    }, [id]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/events/${id}/attendees`);
            setEvent(res.data.event);
            setAttendees(res.data.attendees);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/events/${id}/attendees`, formData);
            setFormData({ name: '', email: '' });
            fetchAttendees();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    const handleDelete = async (attId: number) => {
        if (window.confirm('Remove this attendee?')) {
            try {
                await axios.delete(`${API_BASE}/attendees/${attId}`);
                fetchAttendees();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading && !event) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><div className="spinner"></div></div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container"
            style={{ maxWidth: '1000px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>Guest List</h2>
                    <p style={{ color: 'var(--text-dim)' }}>{event?.title}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
                {/* Registration Form */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '7rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} className="gradient-text" />
                        Quick Register
                    </h3>
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                required
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                required
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Add to Guest List
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                            <span>Available Slots</span>
                            <span style={{ color: event?.tickets_left > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                {event?.tickets_left}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Attendees List */}
                <div className="glass-panel" style={{ minHeight: '500px' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Confirmed Attendees</h3>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{attendees.length} total</span>
                    </div>

                    <div style={{ padding: '1rem' }}>
                        {attendees.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                <User size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No attendees registered yet.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '1rem' }}>Guest</th>
                                        <th style={{ padding: '1rem' }}>Registered At</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {attendees.map((att: any) => (
                                            <motion.tr
                                                key={att.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                style={{ borderBottom: '1px solid var(--glass-border)' }}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{att.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Mail size={12} /> {att.email}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                                    {new Date(att.registered_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleDelete(att.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Attendees;
