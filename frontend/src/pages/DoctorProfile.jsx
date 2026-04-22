import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Award, BookOpen, CalendarCheck, ChevronLeft } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { formatTime } from '../utils/formatters';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`/doctors/${id}`);
                setDoctor(res.data.doctor);
            } catch (err) {
                setError('Doctor not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    const handleBook = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate(`/book/${id}`);
        }
    };

    if (loading) return <div className="page-container" style={{ textAlign: 'center', marginTop: '6rem' }}><p style={{ color: 'var(--color-text-muted)' }}>Loading doctor profile...</p></div>;
    if (error) return <div className="page-container" style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--color-error)' }}><p>{error}</p></div>;

    return (
        <div className="page-container" style={{ maxWidth: '900px', paddingTop: '3rem' }}>
            <button onClick={() => navigate('/doctors')} className="btn btn-outline" style={{ marginBottom: '2rem', gap: '0.5rem' }}>
                <ChevronLeft size={18} /> Back to Doctors
            </button>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(16,185,129,0.1))',
                    padding: '2.5rem',
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    <img
                        src={doctor.profileImage || 'https://via.placeholder.com/160x160?text=Doctor'}
                        alt={doctor.name}
                        style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{doctor.name}</h2>
                        <p style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{doctor.specialization}</p>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{doctor.qualification}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: '600' }}>
                                <Star size={18} fill="currentColor" /> {doctor.rating} Rating
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)' }}>
                                <MapPin size={16} /> {doctor.experience} Yrs Experience
                            </span>
                            <span style={{
                                padding: '0.25rem 1rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem',
                                background: doctor.isAvailable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                                color: doctor.isAvailable ? 'var(--color-secondary)' : 'var(--color-error)',
                            }}>
                                {doctor.isAvailable ? '● Available' : '● Busy'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* About */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={20} color="var(--color-primary)" /> About</h3>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.8' }}>{doctor.bio || 'No bio available.'}</p>
                    </div>

                    {/* Availability */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} color="var(--color-primary)" /> Working Hours</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>{formatTime(doctor.availableTimeStart)} – {formatTime(doctor.availableTimeEnd)}</p>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            {doctor.availableDays?.join(', ') || 'Not specified'}
                        </p>
                    </div>

                    {/* Consultation Fee */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={20} color="var(--color-primary)" /> Consultation Fee</h3>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-secondary)' }}>₹{doctor.consultationFee}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Per visit (paid at clinic)</p>
                    </div>

                    {/* CTA */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleBook}
                            disabled={!doctor.isAvailable}
                            style={{ padding: '1rem 3rem', fontSize: '1rem', width: '100%' }}
                        >
                            <CalendarCheck size={20} />
                            {doctor.isAvailable ? 'Book Appointment' : 'Doctor Currently Unavailable'}
                        </button>
                        {!user && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>You need to <a href="/login">log in</a> to book an appointment.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
