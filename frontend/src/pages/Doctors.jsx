import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Star, Clock, MapPin, CalendarPlus } from 'lucide-react';
import { formatTime } from '../utils/formatters';

const Doctors = () => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/doctors');
                setDoctors(res.data.doctors);
            } catch (err) {
                setError('Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    if (loading) return <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Doctors...</h2></div>;
    if (error) return <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-error)' }}><h2>{error}</h2></div>;

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Meet Our <span className="text-gradient">Specialists</span></h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Book an appointment with our highly acclaimed doctors today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {doctors.map(doctor => (
                    <div key={doctor._id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                            <img
                                src={doctor.profileImage || 'https://via.placeholder.com/300x200?text=Doctor'}
                                alt={doctor.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute', top: '10px', right: '10px',
                                background: doctor.isAvailable ? 'var(--color-secondary)' : 'var(--color-error)',
                                color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                                {doctor.isAvailable ? 'Available' : 'Busy'}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{doctor.name}</h3>
                                    <p style={{ color: 'var(--color-primary)', fontWeight: '500', fontSize: '0.9rem' }}>{doctor.specialization}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <Star size={16} fill="currentColor" />
                                    {doctor.rating}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <MapPin size={16} /> {doctor.experience} Years Experience
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <Clock size={16} /> {formatTime(doctor.availableTimeStart)} - {formatTime(doctor.availableTimeEnd)}
                                </div>
                            </div>

                            {(!user || user.role === 'patient') && (
                                <Link to={`/doctor/${doctor._id}`} style={{ width: '100%', marginTop: 'auto' }}>
                                    <button className="btn btn-primary" style={{ width: '100%' }} disabled={!doctor.isAvailable}>
                                        <CalendarPlus size={18} />
                                        Book Consult (₹{doctor.consultationFee})
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doctors;
