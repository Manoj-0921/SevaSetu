import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Create Account</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Join HealthBlock AppointAI today.
                </p>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: formData.role === 'patient' ? 'var(--color-primary)' : 'transparent', color: formData.role === 'patient' ? 'white' : 'var(--color-text)' }}>
                            <input type="radio" name="role" value="patient" checked={formData.role === 'patient'} onChange={handleChange} style={{ display: 'none' }} />
                            Patient
                        </label>
                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: formData.role === 'doctor' ? 'var(--color-secondary)' : 'transparent', color: formData.role === 'doctor' ? 'white' : 'var(--color-text)' }}>
                            <input type="radio" name="role" value="doctor" checked={formData.role === 'doctor'} onChange={handleChange} style={{ display: 'none' }} />
                            Doctor
                        </label>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            name="name"
                            className="input-base"
                            placeholder="Full Name"
                            style={{ paddingLeft: '3rem' }}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="email"
                            name="email"
                            className="input-base"
                            placeholder="Email address"
                            style={{ paddingLeft: '3rem' }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="password"
                            name="password"
                            className="input-base"
                            placeholder="Password (min 6 chars)"
                            style={{ paddingLeft: '3rem' }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
