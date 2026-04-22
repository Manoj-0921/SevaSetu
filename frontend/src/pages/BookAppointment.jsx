import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Clipboard, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const BookAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [doctor, setDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        symptoms: '',
        patientContact: user?.phone || ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`/doctors/${id}`);
                setDoctor(res.data.doctor);
            } catch (err) {
                setStatus({ type: 'error', msg: 'Could not fetch doctor details.' });
            }
        };
        fetchDoctor();
    }, [id]);

    useEffect(() => {
        const generateTimeSlots = (startStr, endStr) => {
            if (!startStr || !endStr) return [];

            const parseTime = (timeStr) => {
                let hours, minutes;
                if (timeStr.includes(':')) {
                    [hours, minutes] = timeStr.split(':');
                    if (timeStr.includes('PM') || timeStr.includes('AM')) {
                        let split = timeStr.split(' ');
                        hours = split[0].split(':')[0];
                        minutes = split[0].split(':')[1];
                        if (split[1] === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
                        if (split[1] === 'AM' && hours === '12') hours = 0;
                    }
                } else return null;

                const d = new Date();
                d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                return d;
            };

            const start = parseTime(startStr);
            const end = parseTime(endStr);
            if (!start || !end) return [];

            const slots = [];
            let current = start;

            while (current < end) {
                let hrs = current.getHours();
                let mins = current.getMinutes();
                const ampm = hrs >= 12 ? 'PM' : 'AM';
                hrs = hrs % 12;
                hrs = hrs ? hrs : 12; // 0 becomes 12
                const minsStr = mins < 10 ? '0' + mins : mins;
                slots.push(`${hrs < 10 ? '0' + hrs : hrs}:${minsStr} ${ampm}`);
                current.setMinutes(current.getMinutes() + 30);
            }
            return slots;
        };

        if (doctor && doctor.availableTimeStart && doctor.availableTimeEnd) {
            setAvailableSlots(generateTimeSlots(doctor.availableTimeStart, doctor.availableTimeEnd));
        }
    }, [doctor]);

    useEffect(() => {
        if (bookingData.date) {
            api.get(`/appointments/booked-slots/${id}?date=${bookingData.date}`)
                .then(res => setBookedSlots(res.data.bookedSlots))
                .catch(err => console.error(err));
        } else {
            setBookedSlots([]);
        }
    }, [bookingData.date, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });
        setIsSubmitting(true);

        try {
            await api.post('/appointments', {
                doctorId: id,
                ...bookingData
            });
            setStatus({ type: 'success', msg: 'Appointment booked successfully!' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.msg || 'Booking failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!doctor && !status.msg) return <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

    return (
        <div className="page-container" style={{ maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>Book with <span className="text-gradient">{doctor?.name}</span></h2>

                {status.msg && (
                    <div style={{
                        background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: status.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)',
                        padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Preferred Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                type="date"
                                className="input-base"
                                style={{ paddingLeft: '2.5rem' }}
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingData.date}
                                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Time Slot</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                            {availableSlots.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)' }}>No slots available.</p>
                            ) : (
                                availableSlots.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    const isSelected = bookingData.time === slot;
                                    return (
                                        <button
                                            type="button"
                                            key={slot}
                                            disabled={isBooked}
                                            onClick={() => setBookingData({ ...bookingData, time: slot })}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                                background: isBooked ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                color: isBooked ? 'var(--color-error)' : isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                opacity: isBooked ? 0.5 : 1,
                                                fontWeight: isSelected ? 'bold' : 'normal'
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Describe Symptoms / Reason</label>
                        <div style={{ position: 'relative' }}>
                            <Clipboard size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
                            <textarea
                                className="input-base"
                                placeholder="I have been feeling..."
                                style={{ paddingLeft: '2.5rem', minHeight: '100px', paddingTop: '10px' }}
                                value={bookingData.symptoms}
                                onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={isSubmitting || !bookingData.time}>
                        {isSubmitting ? 'Processing...' : <><Send size={18} /> Confirm Booking</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
