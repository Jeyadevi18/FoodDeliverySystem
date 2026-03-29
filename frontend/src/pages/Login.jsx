import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = '1024138367516-9p7g6efbcqhtcjrno5etllmleid1f895.apps.googleusercontent.com';

const ROLE_CONFIG = {
    customer: { icon: '🧑‍💼', label: 'Customer', color: '#ff6b35' },
    delivery: { icon: '🚴', label: 'Delivery Agent', color: '#4ecdc4' },
    admin: { icon: '⚙️', label: 'Admin', color: '#667eea' },
};

const Login = () => {
    const { login, updateUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [role, setRole] = useState('customer');
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
        return () => { };
    }, [role]);

    const initGoogle = () => {
        if (!window.google) return;
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
            document.getElementById('google-btn-login'),
            {
                theme: 'filled_black',
                size: 'large',
                width: '100%',
                text: 'signin_with',
                shape: 'rectangular',
            }
        );
    };

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/google', {
                credential: response.credential,
                role: role,
            });
            localStorage.setItem('fds_token', data.token);
            localStorage.setItem('fds_user', JSON.stringify(data.user));
            updateUser(data.user);
            toast.success(`Welcome${data.user.name ? ', ' + data.user.name.split(' ')[0] : ''}! 🎉`);
            console.log('✅ Google login success:', data.user);
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
                        animation: `float ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`
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
                            fontSize: '2rem', boxShadow: '0 8px 30px rgba(255,107,53,0.4)'
                        }}>🍕</div>
                        <h2 style={{ marginBottom: 4 }}>Welcome Back!</h2>
                        <p style={{ fontSize: '0.9rem' }}>Sign in to your FoodDeliver account</p>
                    </div>

                    {/* Role selector */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
                        {Object.entries(ROLE_CONFIG).map(([r, cfg]) => (
                            <button key={r} onClick={() => setRole(r)} style={{
                                flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
                                borderRadius: 10, fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 600,
                                transition: 'all 0.3s',
                                background: role === r ? `${cfg.color}22` : 'transparent',
                                color: role === r ? cfg.color : 'var(--text-muted)',
                            }}>
                                {cfg.icon} {cfg.label}
                            </button>
                        ))}
                    </div>

                    {/* Google Sign-In Button */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
                            Sign in as <strong style={{ color: ROLE_CONFIG[role].color }}>{ROLE_CONFIG[role].label}</strong> with Google
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
                            {loading ? '⏳ Signing in...' : `Sign in as ${ROLE_CONFIG[role].label} →`}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
