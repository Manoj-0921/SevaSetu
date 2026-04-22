import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Please enter your details to sign in.
                </p>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="email"
                            className="input-base"
                            placeholder="Email address"
                            style={{ paddingLeft: '3rem' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="password"
                            className="input-base"
                            placeholder="Password"
                            style={{ paddingLeft: '3rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Sign up</Link>
                </p>
            </div>

            <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>

            </div>
        </div>
    );
};

export default Login;
