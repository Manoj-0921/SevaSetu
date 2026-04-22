import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Mail, Clock, Calendar, CheckCircle, XCircle, Activity, Upload, Camera, BookOpen, Award, Edit3 } from 'lucide-react';

const SPECIALIZATIONS = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Psychiatrist',
    'Orthopedic Surgeon',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Dentist'
];

const QUALIFICATIONS = [
    'MBBS',
    'MBBS, MD',
    'MBBS, MS',
    'MBBS, DNB',
    'BDS',
    'MDS',
    'BAMS',
    'BHMS',
    'PhD'
];

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [profileData, setProfileData] = useState({
        consultationFee: user?.consultationFee || 0,
        availableTimeStart: user?.availableTimeStart || '',
        availableTimeEnd: user?.availableTimeEnd || '',
        specialization: user?.specialization || '',
        qualification: user?.qualification || '',
        experience: user?.experience || '',
        bio: user?.bio || '',
        profileImage: user?.profileImage || '',
        availableDays: user?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
    const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        try {
            const aptRes = await api.get('/appointments/doctor');
            setAppointments(aptRes.data.appointments);

            const profileRes = await api.get('/auth/me');
            setIsAvailable(profileRes.data.isAvailable);
            setProfileData({
                consultationFee: profileRes.data.consultationFee,
                availableTimeStart: profileRes.data.availableTimeStart,
                availableTimeEnd: profileRes.data.availableTimeEnd,
                specialization: profileRes.data.specialization,
                qualification: profileRes.data.qualification,
                experience: profileRes.data.experience,
                bio: profileRes.data.bio,
                profileImage: profileRes.data.profileImage,
                availableDays: profileRes.data.availableDays || [],
            });
            setImagePreview(profileRes.data.profileImage);
        } catch (err) {
            console.error('Error fetching doctor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleAvailability = async () => {
        try {
            const res = await api.put(`/doctors/${user._id}/availability`, { isAvailable: !isAvailable });
            setIsAvailable(res.data.isAvailable);
        } catch (err) {
            alert('Failed to update availability');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return profileData.profileImage;
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.imageUrl;
        } catch (err) {
            console.error('Image upload failed');
            return profileData.profileImage;
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const uploadedImageUrl = await uploadImage();
            const updatedData = { ...profileData, profileImage: uploadedImageUrl };
            await api.put('/doctors/profile', updatedData);
            alert('Settings updated successfully!');
            setIsEditing(false);
            fetchData();
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form data to original values
        fetchData();
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(profileData.profileImage);
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>Dr. <span className="text-gradient">{user?.name}</span></h2>
                    <p style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{profileData.specialization || 'General Physician'} Dashboard — Practice Portal</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Calendar color="var(--color-primary)" size={28} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{appointments.length}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Bookings</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <CheckCircle color="var(--color-secondary)" size={28} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{appointments.filter(a => a.status === 'confirmed').length}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Confirmed</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={toggleAvailability}>
                    <Activity color={isAvailable ? 'var(--color-secondary)' : 'var(--color-error)'} size={28} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.2rem', margin: '0.2rem 0', color: isAvailable ? 'var(--color-secondary)' : 'var(--color-error)' }}>
                        {isAvailable ? 'Available' : 'Busy'}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Click to toggle status</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Manage Practice</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        // Read-only Profile View
                        <div>
                            {/* Profile Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.05))',
                                padding: '2rem',
                                margin: '-2rem -2rem 2rem -2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                            }}>
                                <img
                                    src={imagePreview || 'https://via.placeholder.com/120'}
                                    alt="Profile"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', marginBottom: '1rem' }}
                                />
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{user?.name}</h3>
                                <p style={{ color: 'var(--color-primary)', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{profileData.specialization || 'General Physician'}</p>
                                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>{profileData.qualification || 'Not specified'}</p>
                                {profileData.experience && (
                                    <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                                        {profileData.experience} Years Experience
                                    </p>
                                )}
                            </div>

                            {/* Profile Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                {/* About Section */}
                                {profileData.bio && (
                                    <div>
                                        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--color-primary)' }}>
                                            <BookOpen size={18} /> About
                                        </h4>
                                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', margin: 0 }}>{profileData.bio}</p>
                                    </div>
                                )}

                                {/* Working Hours */}
                                <div>
                                    <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--color-primary)' }}>
                                        <Clock size={18} /> Working Hours
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                                            {profileData.availableTimeStart && profileData.availableTimeEnd
                                                ? `${profileData.availableTimeStart} - ${profileData.availableTimeEnd}`
                                                : 'Not set'
                                            }
                                        </p>
                                        {profileData.availableDays && profileData.availableDays.length > 0 && (
                                            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                                                {profileData.availableDays.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Consultation Fee */}
                                <div>
                                    <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--color-primary)' }}>
                                        <Award size={18} /> Consultation Fee
                                    </h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-secondary)', margin: 0 }}>
                                        ₹{profileData.consultationFee || 0}
                                    </p>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                                        Per visit (paid at clinic)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit Form
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={imagePreview || 'https://via.placeholder.com/150'}
                                        alt="Profile"
                                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        style={{
                                            position: 'absolute',
                                            bottom: '5px',
                                            right: '5px',
                                            background: 'var(--color-primary)',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <Camera size={18} color="white" />
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Specialization</label>
                                    <select
                                        className="input-base"
                                        value={profileData.specialization}
                                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                    >
                                        <option value="">Select Specialization</option>
                                        {SPECIALIZATIONS.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Qualification</label>
                                    <select
                                        className="input-base"
                                        value={profileData.qualification}
                                        onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                    >
                                        <option value="">Select Qualification</option>
                                        {QUALIFICATIONS.map(qual => (
                                            <option key={qual} value={qual}>{qual}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Experience (Years)</label>
                                    <input
                                        type="number"
                                        className="input-base"
                                        placeholder="e.g. 7"
                                        value={profileData.experience}
                                        onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>About / Bio</label>
                                    <textarea
                                        className="input-base"
                                        placeholder="Brief description of your expertise..."
                                        style={{ minHeight: '80px', paddingTop: '10px' }}
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Available Days</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button
                                                type="button"
                                                key={day}
                                                onClick={() => {
                                                    const current = profileData.availableDays || [];
                                                    const updated = current.includes(day)
                                                        ? current.filter(d => d !== day)
                                                        : [...current, day];
                                                    setProfileData({ ...profileData, availableDays: updated });
                                                }}
                                                style={{
                                                    padding: '0.3rem 0.75rem',
                                                    borderRadius: '15px',
                                                    fontSize: '0.75rem',
                                                    border: '1px solid var(--color-border)',
                                                    background: (profileData.availableDays || []).includes(day) ? 'var(--color-primary)' : 'transparent',
                                                    color: (profileData.availableDays || []).includes(day) ? 'white' : 'var(--color-text)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {day.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Start Time</label>
                                        <input
                                            type="time"
                                            className="input-base"
                                            value={profileData.availableTimeStart}
                                            onChange={(e) => setProfileData({ ...profileData, availableTimeStart: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>End Time</label>
                                        <input
                                            type="time"
                                            className="input-base"
                                            value={profileData.availableTimeEnd}
                                            onChange={(e) => setProfileData({ ...profileData, availableTimeEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        className="input-base"
                                        value={profileData.consultationFee}
                                        onChange={(e) => setProfileData({ ...profileData, consultationFee: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isUpdating}>
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ flex: 1 }} disabled={isUpdating}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                <div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Appointments</h3>
                    {appointments.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)' }}>No appointments scheduled.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {appointments.map(apt => (
                                <div key={apt._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ background: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '100px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{apt.time}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{apt.date}</div>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0' }}>{apt.patient?.name}</h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {apt.patient?.phone}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {apt.patient?.email}</span>
                                            </div>
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}><strong>Symptoms:</strong> {apt.symptoms}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {apt.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction(apt._id, 'confirmed')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}><CheckCircle size={18} /> Confirm</button>
                                                <button onClick={() => handleAction(apt._id, 'cancelled')} className="btn btn-outline" style={{ padding: '0.5rem 1rem', color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.2)' }}><XCircle size={18} /> Decline</button>
                                            </>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <span style={{ color: 'var(--color-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Confirmed</span>
                                        )}
                                        {apt.status === 'cancelled' && (
                                            <span style={{ color: 'var(--color-error)', fontWeight: '600' }}>Cancelled</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
