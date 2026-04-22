import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, User, MessageCircle, XCircle } from 'lucide-react';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/my');
            setAppointments(res.data.appointments);
        } catch (err) {
            console.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments(); // refresh
        } catch (err) {
            alert('Cancellation failed.');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Welcome, <span className="text-gradient">{user?.name}</span></h2>

            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>My Appointments</h3>

            {appointments.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>You have no appointments yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {appointments.map(apt => (
                        <div key={apt._id} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    background: apt.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.1)',
                                    color: apt.status === 'confirmed' ? 'var(--color-secondary)' : 'var(--color-primary)'
                                }}>
                                    {apt.status.toUpperCase()}
                                </span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>ID: {apt._id.slice(-6)}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <img src={apt.doctor?.profileImage} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                <div>
                                    <h4 style={{ margin: 0 }}>{apt.doctor?.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{apt.doctor?.specialization}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                    <Calendar size={16} color="var(--color-text-muted)" /> {apt.date}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                    <Clock size={16} color="var(--color-text-muted)" /> {apt.time}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem' }}>
                                    <MessageCircle size={16} color="var(--color-text-muted)" style={{ marginTop: '2px' }} />
                                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>"{apt.symptoms}"</span>
                                </div>
                            </div>

                            {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                <button
                                    onClick={() => handleCancel(apt._id)}
                                    className="btn btn-outline"
                                    style={{ width: '100%', color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                    <XCircle size={18} /> Cancel Appointment
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
