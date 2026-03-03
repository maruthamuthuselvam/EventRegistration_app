import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Calendar, MapPin, AlignLeft, Users } from 'lucide-react';

import { API_BASE } from '../api';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: 0
    });

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`${API_BASE}/events/${id}`);
            setFormData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await axios.put(`${API_BASE}/events/${id}`, formData);
            } else {
                await axios.post(`${API_BASE}/events`, formData);
            }
            navigate('/');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                    {id ? 'Edit' : 'Create'} <span className="gradient-text">Event</span>
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label"><AlignLeft size={16} /> Event Title</label>
                        <input
                            required
                            className="input-field"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Premium Tech Gala 2026"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label className="input-label"><Calendar size={16} /> Date</label>
                            <input
                                required
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label"><Users size={16} /> Capacity</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label"><MapPin size={16} /> Location</label>
                        <input
                            className="input-field"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Grand Plaza, London"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input-field"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell us more about the event..."
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? <div className="spinner"></div> : <Save size={18} />}
                            {id ? 'Update Event' : 'Create Event'}
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EventForm;
