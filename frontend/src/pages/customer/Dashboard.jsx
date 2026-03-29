import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/mine').then(r => setOrders(r.data.orders || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const recent = orders.slice(0, 3);
    const statusColor = { pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#a855f7', ready: '#14b8a6', picked: '#ff6b35', on_the_way: '#ff6b35', delivered: '#22c55e', cancelled: '#ef4444' };

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

                {/* Welcome banner */}
                <div className="animate-fadeInUp" style={{
                    borderRadius: 24, padding: '40px 48px', marginBottom: 32, overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg,#ff6b35,#f7c948,#ff3366)',
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, fontSize: '8rem', opacity: 0.15, animation: 'float 4s ease-in-out infinite' }}>🍕</div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Good day, foodie! 👋</div>
                        <h2 style={{ color: '#fff', margin: 0 }}>Hello, {user?.name?.split(' ')[0]}!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>What are you craving today?</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                            <Link to="/customer/menu" className="btn" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
                                🍽️ Browse Menu
                            </Link>
                            <Link to="/customer/orders" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                                📦 My Orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Total Orders', val: orders.length, icon: '📦', color: 'var(--grad-orange)' },
                        { label: 'Delivered', val: orders.filter(o => o.status === 'delivered').length, icon: '✅', color: 'var(--grad-green)' },
                        { label: 'Active', val: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length, icon: '🚴', color: 'var(--grad-teal)' },
                        { label: 'Cancelled', val: orders.filter(o => o.status === 'cancelled').length, icon: '❌', color: 'var(--grad-pink)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card animate-fadeInUp" style={{ '--before-bg': s.color }}>
                            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                            <div className="stat-value">{loading ? '...' : s.val}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent orders */}
                <div className="card animate-fadeInUp" style={{ overflow: 'hidden' }}>
                    <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <h3>🕐 Recent Orders</h3>
                        <Link to="/customer/orders" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>View all →</Link>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
                        </div>
                    ) : recent.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</div>
                            <p>No orders yet! Start ordering now.</p>
                            <Link to="/customer/menu" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Menu</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {recent.map(order => (
                                <div key={order._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                    background: 'var(--bg-elevated)', borderRadius: 14,
                                    border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap',
                                }}>
                                    <div style={{ fontSize: '2rem' }}>📦</div>
                                    <div style={{ flex: 1, minWidth: 120 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {order.items?.map(i => i.name).join(', ').substring(0, 40)}...
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>₹{order.totalAmount}</div>
                                    <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                                    {['picked', 'on_the_way', 'confirmed', 'preparing'].includes(order.status) && (
                                        <Link to={`/customer/tracking/${order._id}`} className="btn btn-primary btn-sm">Track 📍</Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 24 }}>
                    {[
                        { to: '/customer/menu', icon: '🍕', label: 'Browse Menu', sub: 'Explore all foods', grad: 'var(--grad-orange)' },
                        { to: '/customer/cart', icon: '🛒', label: 'My Cart', sub: 'Review your items', grad: 'var(--grad-teal)' },
                        { to: '/customer/orders', icon: '📋', label: 'Order History', sub: 'Track & review', grad: 'var(--grad-purple)' },
                    ].map(l => (
                        <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                            <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: 28 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                                    background: l.grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem'
                                }}>{l.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{l.label}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{l.sub}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
