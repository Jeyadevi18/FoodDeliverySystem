import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = '1024138367516-9p7g6efbcqhtcjrno5etllmleid1f895.apps.googleusercontent.com';

const ROLES = [
    { id: 'customer', icon: '🧑', label: 'Customer', desc: 'Order food & track delivery', color: '#ff6b35' },
    { id: 'delivery', icon: '🚴', label: 'Delivery Agent', desc: 'Accept & deliver orders', color: '#4ecdc4' },
    { id: 'admin', icon: '⚙️', label: 'Admin', desc: 'Manage the platform', color: '#667eea' },
];

const Register = () => {
    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('customer');
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const redirectToDashboard = (userRole) => {
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'delivery') navigate('/delivery');
        else navigate('/customer');
    };

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
            if (window.google) initGoogle();
        }
    }, [role]);

    const initGoogle = () => {
        if (!window.google) return;
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
            document.getElementById('google-btn-register'),
            { theme: 'filled_black', size: 'large', width: '100%', text: 'signup_with', shape: 'rectangular' }
        );
    };

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/google', { credential: response.credential, role });
            localStorage.setItem('fds_token', data.token);
            localStorage.setItem('fds_user', JSON.stringify(data.user));
            updateUser(data.user);
            toast.success(`Account created! Welcome, ${data.user.name?.split(' ')[0]} 🎉`);
            console.log('✅ Google register success:', data.user);
            redirectToDashboard(data.user.role);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-up failed');
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { ...form, role });
            localStorage.setItem('fds_token', data.token);
            localStorage.setItem('fds_user', JSON.stringify(data.user));
            updateUser(data.user);
            toast.success(`Welcome to FoodDeliver, ${data.user.name.split(' ')[0]}! 🎉`);
            redirectToDashboard(data.user.role);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const selectedRole = ROLES.find(r => r.id === role);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#0f0c29,#302b63,#1a0a2e)',
            padding: '100px 24px 40px',
        }}>
            {/* Background orbs */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {['rgba(78,205,196,0.12)', 'rgba(255,107,53,0.1)', 'rgba(102,126,234,0.08)'].map((c, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '50%', width: 280 + i * 100, height: 280 + i * 100,
                        background: `radial-gradient(circle, ${c}, transparent 70%)`,
                        top: `${[30, 70, 50][i]}%`, left: `${[20, 80, 50][i]}%`,
                        transform: 'translate(-50%,-50%)', animation: `float ${4 + i}s ease-in-out infinite`,
                    }} />
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
                <div className="glass-card animate-fadeInUp" style={{ padding: 40 }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 12px', background: 'linear-gradient(135deg,#4ecdc4,#44a08d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 30px rgba(78,205,196,0.4)' }}>
                            ✨
                        </div>
                        <h2 style={{ marginBottom: 4 }}>Create Account</h2>
                        <p>Join FoodDeliver as a <strong style={{ color: selectedRole.color }}>{selectedRole.label}</strong></p>
                    </div>

                    {/* Role selector cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
                        {ROLES.map(r => (
                            <button key={r.id} onClick={() => setRole(r.id)} style={{
                                padding: '12px 8px', border: `2px solid ${role === r.id ? r.color : 'transparent'}`,
                                borderRadius: 14, cursor: 'pointer', background: role === r.id ? `${r.color}15` : 'rgba(255,255,255,0.04)',
                                transition: 'all 0.3s', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{r.icon}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: role === r.id ? r.color : 'var(--text-muted)', fontFamily: 'Outfit' }}>{r.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Google Sign-Up */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
                            ⚡ Quick sign-up with Google as <strong style={{ color: selectedRole.color }}>{selectedRole.label}</strong>
                        </div>
                        <div id="google-btn-register" style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or register with email</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">👤 Full Name</label>
                                <input className="form-control" placeholder="Your full name"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="form-label">📧 Email</label>
                                <input type="email" className="form-control" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">🔑 Password</label>
                                <input type="password" className="form-control" placeholder="Min 6 chars"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">📞 Phone</label>
                                <input className="form-control" placeholder="10-digit number"
                                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
                            {loading ? '⏳ Creating account...' : `Create ${selectedRole.label} Account →`}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
