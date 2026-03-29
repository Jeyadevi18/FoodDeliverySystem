import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_NEXT = { confirmed: 'picked', preparing: 'picked', ready: 'picked', picked: 'on_the_way', on_the_way: 'delivered' };
const STATUS_LABELS = {
    confirmed: '🚀 Start Pickup',
    preparing: '🚀 Start Pickup',
    ready: '🚀 Start Pickup',
    picked: '🛵 Mark On The Way',
    on_the_way: '🎉 Mark Delivered',
};

const DeliveryDashboard = () => {
    const { user } = useAuth();

    const [assigned, setAssigned] = useState([]);   // confirmed by admin — waiting for me to pick
    const [myOrders, setMyOrders] = useState([]);   // picked/on_the_way
    const [available, setAvailable] = useState([]);   // unassigned ready orders (self-accept)
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('assigned');
    const [busy, setBusy] = useState({});

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.get('/delivery/orders/assigned').then(r => setAssigned(r.data.orders || [])).catch(() => setAssigned([])),
            api.get('/delivery/orders/mine').then(r => setMyOrders(r.data.orders || [])).catch(() => setMyOrders([])),
            api.get('/delivery/orders/available').then(r => setAvailable(r.data.orders || [])).catch(() => setAvailable([])),
        ]).finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-switch tab to assigned if there are new assignments
    useEffect(() => { if (assigned.length > 0) setTab('assigned'); }, [assigned.length]);

    const handleStatusUpdate = async (orderId, status) => {
        setBusy(p => ({ ...p, [orderId]: true }));
        try {
            await api.put(`/delivery/orders/${orderId}/status`, { status });
            toast.success(`✅ Status updated: ${status.replace('_', ' ')}`);
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update status. Please try again.');
        } finally { setBusy(p => ({ ...p, [orderId]: false })); }
    };

    const handleAccept = async (orderId) => {
        setBusy(p => ({ ...p, [orderId]: true }));
        try {
            await api.put(`/delivery/orders/${orderId}/accept`);
            toast.success('✅ Order accepted!');
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to accept order. Please try again.');
        } finally { setBusy(p => ({ ...p, [orderId]: false })); }
    };

    const TABS = [
        { key: 'assigned', label: '📬 Assigned to Me', count: assigned.length, badge: '#f59e0b' },
        { key: 'active', label: '🛵 My Active', count: myOrders.length, badge: '#10b981' },
        { key: 'available', label: '📦 Available Orders', count: available.length, badge: '#3b82f6' },
    ];

    const OrderCard = ({ order, showNextBtn = false, showAcceptBtn = false }) => (
        <div className="card animate-fadeInUp" style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem', marginTop: 2 }}>
                {order.status === 'on_the_way' ? '🛵' : order.status === 'delivered' ? '✅' : '📦'}
            </span>
            <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{order.customer?.name || 'Customer'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0' }}>
                    📍 {order.deliveryAddress?.substring(0, 60) || order.customer?.address}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                        background: order.status === 'delivered' ? '#10b98122' : order.status === 'confirmed' || order.status === 'ready' ? '#f59e0b22' : '#6366f122',
                        color: order.status === 'delivered' ? '#10b981' : order.status === 'confirmed' || order.status === 'ready' ? '#f59e0b' : '#6366f1',
                    }}>
                        {order.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                <Link to={`/delivery/tracking/${order._id}`} className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                    📍 View Map
                </Link>
                {showNextBtn && STATUS_NEXT[order.status] && (
                    <button
                        onClick={() => handleStatusUpdate(order._id, STATUS_NEXT[order.status])}
                        disabled={busy[order._id]}
                        className="btn btn-primary btn-sm"
                    >
                        {busy[order._id] ? '⏳' : STATUS_LABELS[order.status]}
                    </button>
                )}
                {showAcceptBtn && (
                    <button onClick={() => handleAccept(order._id)} disabled={busy[order._id]} className="btn btn-success btn-sm">
                        {busy[order._id] ? '⏳' : '✓ Accept'}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

                {/* Welcome hero */}
                <div className="animate-fadeInUp" style={{
                    borderRadius: 20, padding: '28px 32px', marginBottom: 28, overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg,#4ecdc4,#44a08d)',
                }}>
                    <div style={{ position: 'absolute', right: -10, top: -10, fontSize: '6rem', opacity: 0.15, animation: 'float 3s ease-in-out infinite' }}>🚴</div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ color: '#fff', margin: 0 }}>Hi, {user?.name?.split(' ')[0]}! 🚀</h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Your delivery dashboard — admin sends you orders directly</p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                        { label: 'Assigned to Me', val: assigned.length, icon: '📬', color: '#f59e0b' },
                        { label: 'Active Deliveries', val: myOrders.length, icon: '🛵', color: '#6366f1' },
                        { label: 'Available Pool', val: available.length, icon: '📦', color: '#3b82f6' },
                    ].map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{loading ? '—' : s.val}</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New assignment alert */}
                {assigned.length > 0 && (
                    <div className="animate-fadeInUp" style={{
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 14,
                        padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span style={{ fontSize: '1.6rem' }}>📬</span>
                        <div style={{ color: '#fff' }}>
                            <strong>{assigned.length} new order{assigned.length > 1 ? 's' : ''} assigned to you by admin!</strong>
                            <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Click "Start Pickup" when you're ready to collect.</div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', width: 'fit-content' }}>
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: '12px 20px', border: 'none', cursor: 'pointer',
                            fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.3s',
                            background: tab === t.key ? 'var(--grad-teal)' : 'var(--bg-elevated)',
                            color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            {t.label}
                            {t.count > 0 && (
                                <span style={{
                                    background: tab === t.key ? 'rgba(255,255,255,0.3)' : t.badge,
                                    color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 800,
                                }}>{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {tab === 'assigned' && (
                            assigned.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                                    <p>No orders assigned to you yet. Admin will send orders here.</p>
                                </div>
                            ) : assigned.map(o => <OrderCard key={o._id} order={o} showNextBtn />)
                        )}

                        {tab === 'active' && (
                            myOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛵</div>
                                    <p>No active deliveries. Accept or pick up an assigned order.</p>
                                </div>
                            ) : myOrders.map(o => <OrderCard key={o._id} order={o} showNextBtn />)
                        )}

                        {tab === 'available' && (
                            available.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                                    <p>No open orders in pool right now. Check back soon!</p>
                                </div>
                            ) : available.map(o => <OrderCard key={o._id} order={o} showAcceptBtn />)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
