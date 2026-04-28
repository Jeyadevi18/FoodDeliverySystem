import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = '1024138367516-9p7g6efbcqhtcjrno5etllmleid1f895.apps.googleusercontent.com';

const Login = () => {
    const { login, updateUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const redirectToDashboard = (userRole) => {
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'delivery') navigate('/delivery');
        else navigate('/customer');
    };

    // Load Google Identity Services script
    useEffect(() => {
        const existingScript = document.getElementById('google-gsi');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'google-gsi';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initGoogle();
            document.body.appendChild(script);
        } else {
            initGoogle();
        }
    }, []);

    const initGoogle = () => {
        if (!window.google) { setTimeout(initGoogle, 500); return; }
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });
        const btn = document.getElementById('google-btn-login');
        if (btn) {
            window.google.accounts.id.renderButton(btn, {
                theme: 'filled_black', size: 'large', width: '100%',
                text: 'signin_with', shape: 'rectangular',
            });
        }
    };

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/google', { credential: response.credential });
            localStorage.setItem('fds_token', data.token);
            localStorage.setItem('fds_user', JSON.stringify(data.user));
            updateUser(data.user);
            toast.success(`Welcome${data.user.name ? ', ' + data.user.name.split(' ')[0] : ''}! 🎉`);
            redirectToDashboard(data.user.role);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
            redirectToDashboard(user.role);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#0f0c29,#302b63,#1a0a2e)',
            padding: '100px 24px 40px',
        }}>
            {/* Background orbs */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {['rgba(255,107,53,0.15)', 'rgba(78,205,196,0.12)', 'rgba(102,126,234,0.1)'].map((c, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '50%', width: 300 + i * 80, height: 300 + i * 80,
                        background: `radial-gradient(circle, ${c}, transparent 70%)`,
                        top: `${[20, 60, 40][i]}%`, left: `${[80, 10, 50][i]}%`,
                        transform: 'translate(-50%,-50%)',
                        animation: `float ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`,
                    }} />
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
                <div className="glass-card animate-fadeInUp" style={{ padding: 40 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 20, margin: '0 auto 14px',
                            background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', boxShadow: '0 8px 30px rgba(255,107,53,0.4)',
                        }}>🍕</div>
                        <h2 style={{ marginBottom: 4 }}>Welcome Back!</h2>
                        <p style={{ fontSize: '0.9rem' }}>Sign in to your FoodDeliver account</p>
                    </div>

                    {/* Info chips */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                        {[
                            { icon: '⚙️', label: 'Admin', color: '#667eea' },
                            { icon: '🚴', label: 'Delivery Agent', color: '#4ecdc4' },
                            { icon: '🧑‍💼', label: 'Customer', color: '#ff6b35' },
                        ].map(r => (
                            <div key={r.label} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px', borderRadius: 100,
                                background: `${r.color}18`, border: `1px solid ${r.color}44`,
                                fontSize: '0.78rem', fontWeight: 600, color: r.color,
                            }}>
                                {r.icon} {r.label}
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                        Your role is determined automatically based on your account.
                    </p>

                    {/* Google Sign-In Button */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
                            Sign in with Google
                        </div>
                        <div id="google-btn-login" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or sign in with email</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">📧 Email</label>
                            <input type="email" className="form-control" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🔑 Password</label>
                            <input type="password" className="form-control" placeholder="Enter your password"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? '⏳ Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    {/* Hint box */}
                    <div style={{
                        marginTop: 20, padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6,
                    }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>ℹ️ Default Passwords</strong><br />
                        Admin: <code style={{ color: '#667eea' }}>Admin@1234</code><br />
                        Delivery agents: <code style={{ color: '#4ecdc4' }}>Delivery@1234</code><br />
                        Customers: register below or use Google ↓
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        New customer?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
