import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUp, Info, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { UPLOAD_URL } from '../api';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Note: We're using the existing /upload route but it might need to return JSON
            // Let's modify app.py later if needed, but for now we'll try to handle it.
            // Actually let's assume we might need a JSON version of upload.
            await axios.post(UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json' // We should update app.py to handle this
                }
            });
            setMessage({ type: 'success', text: 'Import successful!' });
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to process CSV file.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
        >
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <FileUp size={40} className="gradient-text" />
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Import <span className="gradient-text">Events</span></h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Upload a CSV file to bulk import events into your dashboard.</p>

                <form onSubmit={handleUpload}>
                    <div
                        style={{
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '20px',
                            padding: '3rem 2rem',
                            marginBottom: '2rem',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        {file ? (
                            <div>
                                <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                                <p style={{ fontWeight: 600 }}>{file.name}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Click to select or drag and drop</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Only .csv files are supported</p>
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)', textAlign: 'left', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
                        <Info size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                            Ensure your CSV has columns: <strong>title, date, description, location, capacity</strong>.
                        </p>
                    </div>

                    {message && (
                        <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '2rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={!file || loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                        {loading ? <div className="spinner"></div> : <FileUp size={18} />}
                        Process Import
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default Upload;
