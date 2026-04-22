import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, UserPlus, Calendar, Activity, Database, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data.users);
        } catch (err) {
            console.error('Admin fetch error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div className="page-container">Loading Admin Panel...</div>;

    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Admin <span className="text-gradient">Control Center</span></h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Users color="var(--color-primary)" size={32} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats?.totalPatients}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Total Patients</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Activity color="var(--color-secondary)" size={32} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats?.totalDoctors}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Active Doctors</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Calendar color="#fbbf24" size={32} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats?.totalAppointments}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Appointments</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Database color="var(--color-text)" size={32} style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{stats?.pendingAppointments}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Pending Requests</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Users List */}
                <div className="glass-card" style={{ padding: '2rem', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Management: Users & Staff</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: '1rem' }}>NAME</th>
                                <th style={{ padding: '1rem' }}>EMAIL / ROLE</th>
                                <th style={{ padding: '1rem' }}>JOINED</th>
                                <th style={{ padding: '1rem' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem' }}>{u.email}</div>
                                        <div style={{ color: u.role === 'admin' ? '#ef4444' : u.role === 'doctor' ? 'var(--color-primary)' : 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {u.role.toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleDelete(u._id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }} title="Delete User">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Doctor Quick Action */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={22} color="var(--color-primary)" /> Add Doctor
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Manual creation of specialized staff accounts.</p>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Create Doctor Profile</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
