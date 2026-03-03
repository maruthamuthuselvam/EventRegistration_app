import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Calendar, Ticket, TrendingUp, Award, Clock } from 'lucide-react';

import { API_BASE } from '../api';

const Report = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE}/report`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><div className="spinner"></div></div>;

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: `rgba(${color}, 0.1)`, padding: '1.25rem', borderRadius: '16px', color: `rgb(${color})` }}>
                <Icon size={32} />
            </div>
            <div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: '2rem' }}>{value}</h3>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Analytics <span className="gradient-text">Dashboard</span></h1>
                <p style={{ color: 'var(--text-dim)' }}>Real-time overview of your event platform performance.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <StatCard
                    title="Total Events"
                    value={stats.total_events}
                    icon={Calendar}
                    color="139, 92, 246"
                />
                <StatCard
                    title="Total Attendees"
                    value={stats.total_attendees}
                    icon={Users}
                    color="217, 70, 239"
                />
                <StatCard
                    title="Tickets Sold"
                    value={stats.total_tickets_sold}
                    icon={Ticket}
                    color="16, 185, 129"
                />
            </div>

            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp size={24} className="gradient-text" />
                        Performance Insights
                    </h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)', borderRadius: '20px', color: 'var(--text-dim)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>Historical trends will appear here as more data is collected.</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <Award size={18} className="gradient-text" />
                                <span style={{ fontWeight: 600 }}>Platinum Plan</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>You are currently using the premium management suite.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Report;
