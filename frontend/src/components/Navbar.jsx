import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const navLinks = {
        customer: [
            { to: '/customer', label: '🏠 Home' },
            { to: '/customer/menu', label: '🍽️ Menu' },
            { to: '/customer/orders', label: '📦 My Orders' },
        ],
        admin: [
            { to: '/admin', label: '📊 Dashboard' },
            { to: '/admin/foods', label: '🍕 Foods' },
            { to: '/admin/orders', label: '📦 Orders' },
            { to: '/admin/users', label: '👥 Users' },
        ],
        delivery: [
            { to: '/delivery', label: '🚀 Dashboard' },
        ],
    };

    const links = user ? (navLinks[user.role] || []) : [];

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: 'rgba(13,13,20,0.85)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '0 24px', height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <span style={{
                    width: 40, height: 40, borderRadius: '12px',
                    background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
                }}>🍕</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#f0f0ff' }}>
                    Food<span style={{ color: '#ff6b35' }}>Deliver</span>
                </span>
            </Link>

            {/* Desktop Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-mobile">
                {links.map(l => (
                    <Link key={l.to} to={l.to} style={{
                        padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 500,
                        color: location.pathname === l.to ? '#ff6b35' : 'rgba(240,240,255,0.7)',
                        background: location.pathname === l.to ? 'rgba(255,107,53,0.12)' : 'transparent',
                        textDecoration: 'none', transition: 'all 0.2s',
                    }}>{l.label}</Link>
                ))}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user?.role === 'customer' && (
                    <Link to="/customer/cart" style={{
                        position: 'relative', padding: '10px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '1.2rem', textDecoration: 'none', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center',
                    }}>
                        🛒
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
                                color: '#fff', borderRadius: '50%', width: 20, height: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700,
                            }}>{cartCount}</span>
                        )}
                    </Link>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            padding: '6px 14px', borderRadius: '100px',
                            background: 'rgba(255,107,53,0.15)', color: '#ff6b35',
                            fontSize: '0.8rem', fontWeight: 600,
                            border: '1px solid rgba(255,107,53,0.3)',
                        }}>{user.role.toUpperCase()}</span>
                        <span style={{ color: 'rgba(240,240,255,0.7)', fontSize: '0.9rem' }}>{user.name?.split(' ')[0]}</span>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                    </div>
                )}

                {/* Mobile menu button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ background: 'none', border: 'none', color: '#f0f0ff', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
                    className="show-mobile"
                >☰</button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div style={{
                    position: 'absolute', top: '72px', left: 0, right: 0,
                    background: 'rgba(13,13,20,0.98)', backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                    {links.map(l => (
                        <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
                            padding: '12px 16px', borderRadius: '10px', color: '#f0f0ff',
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}>{l.label}</Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
