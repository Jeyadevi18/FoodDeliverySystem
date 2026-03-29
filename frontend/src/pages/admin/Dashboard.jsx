import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const DEMO_STATS = { totalOrders: 128, pendingOrders: 14, deliveredOrders: 89, totalRevenue: 52480, totalCustomers: 45, totalDeliveryAgents: 8 };
const DEMO_RECENT = [
    { _id: 'o1', customer: { name: 'Priya S' }, totalAmount: 497, status: 'pending', createdAt: new Date().toISOString() },
    { _id: 'o2', customer: { name: 'Arjun M' }, totalAmount: 732, status: 'on_the_way', createdAt: new Date().toISOString() },
    { _id: 'o3', customer: { name: 'Kavya R' }, totalAmount: 249, status: 'delivered', createdAt: new Date().toISOString() },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/stats').then(r => { setStats(r.data.stats); setRecent(r.data.recentOrders || []); }).catch(() => { setStats(DEMO_STATS); setRecent(DEMO_RECENT); }).finally(() => setLoading(false));
    }, []);

    const s = stats || DEMO_STATS;

    const STAT_CARDS = [
        { label: 'Total Orders', val: s.totalOrders, icon: '📦', color: 'var(--grad-orange)' },
        { label: 'Pending', val: s.pendingOrders, icon: '⏳', color: 'var(--grad-purple)' },
        { label: 'Delivered', val: s.deliveredOrders, icon: '✅', color: 'var(--grad-green)' },
        { label: 'Revenue (₹)', val: `${s.totalRevenue?.toLocaleString()}`, icon: '💰', color: 'var(--grad-teal)' },
        { label: 'Customers', val: s.totalCustomers, icon: '👥', color: 'var(--grad-pink)' },
        { label: 'Agents', val: s.totalDeliveryAgents, icon: '🚴', color: 'linear-gradient(135deg,#f7c948,#ff6b35)' },
    ];

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                {/* Header */}
                <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', marginBottom: 12 }}>
                        <span>⚙️</span><span style={{ color: '#667eea', fontSize: '0.85rem', fontWeight: 600 }}>Admin Dashboard</span>
                    </div>
                    <h2>Platform Overview</h2>
                    <p>Monitor all activity in real-time</p>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                    {STAT_CARDS.map((c, i) => (
                        <div key={c.label} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.07}s` }}>
                            <div className="stat-icon" style={{ background: c.color }}>{c.icon}</div>
                            <div className="stat-value">{loading ? '...' : c.val}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { to: '/admin/foods', icon: '🍕', label: 'Manage Foods', sub: 'Add, edit, delete menu items', color: 'var(--grad-orange)' },
                        { to: '/admin/orders', icon: '📦', label: 'Manage Orders', sub: 'View & assign delivery agents', color: 'var(--grad-purple)' },
                        { to: '/admin/users', icon: '👥', label: 'Manage Users', sub: 'Customers & delivery agents', color: 'var(--grad-teal)' },
                    ].map(a => (
                        <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                            <div className="card animate-fadeInUp" style={{ padding: 24 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 12 }}>{a.icon}</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{a.label}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.sub}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent orders table */}
                <div className="card animate-fadeInUp">
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h3>🕐 Recent Orders</h3>
                        <Link to="/admin/orders" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>View all →</Link>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>
                                {(recent.length > 0 ? recent : DEMO_RECENT).map(o => (
                                    <tr key={o._id}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{o._id.slice(-6).toUpperCase()}</td>
                                        <td>{o.customer?.name}</td>
                                        <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                                        <td><span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
