import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'on_the_way', 'delivered', 'cancelled'];

const STATUS_COLOR = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    ready: '#06b6d4',
    picked: '#f97316',
    on_the_way: '#6366f1',
    delivered: '#10b981',
    cancelled: '#ef4444',
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [assigning, setAssigning] = useState({});
    const [selected, setSelected] = useState(null); // expanded order
    const [agentMap, setAgentMap] = useState({});   // orderId → agentId chosen

    /* ── Fetch helpers ─────────────────────────────────────────── */
    const fetchOrders = useCallback(() => {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        setLoading(true);
        api.get('/orders', { params })
            .then(r => setOrders(r.data.orders || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [filterStatus]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    useEffect(() => {
        api.get('/admin/users', { params: { role: 'delivery' } })
            .then(r => setAgents(r.data.users || []))
            .catch(() => { });
    }, []);

    /* ── Assign agent ────────────────────────────────────────── */
    const handleAssign = async (orderId) => {
        const agentId = agentMap[orderId];
        if (!agentId) { toast.error('Select a delivery agent first'); return; }
        setAssigning(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.put(`/orders/${orderId}/assign`, { deliveryAgentId: agentId });
            toast.success('🚴 Order assigned to delivery agent!');
            fetchOrders();
        } catch {
            toast.error('Failed to assign — check connection');
        } finally {
            setAssigning(prev => ({ ...prev, [orderId]: false }));
        }
    };

    /* ── Update status ───────────────────────────────────────── */
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/assign`, { status: newStatus });
            toast.success(`Status → ${newStatus.replace('_', ' ')}`);
            fetchOrders();
        } catch {
            // fallback optimistic
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Status → ${newStatus.replace('_', ' ')} (local)`);
        }
    };

    const pending = orders.filter(o => o.status === 'pending').length;
    const unassigned = orders.filter(o => !o.deliveryAgent && o.status !== 'cancelled' && o.status !== 'delivered').length;

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

                {/* ── Header ─────────────────────────────────── */}
                <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h2 style={{ marginBottom: 4 }}>📦 Orders & Assignment</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Assign delivery agents and manage order status</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select className="form-control" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '8px 16px' }}>🔄</button>
                    </div>
                </div>

                {/* ── Stats bar ──────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                        { label: 'Total Orders', value: orders.length, icon: '📦', color: '#3b82f6' },
                        { label: 'Pending', value: pending, icon: '⏳', color: '#f59e0b' },
                        { label: 'Unassigned', value: unassigned, icon: '🚴', color: '#ef4444' },
                        { label: 'Agents Online', value: agents.length, icon: '👷', color: '#10b981' },
                    ].map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
                            <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Order cards ────────────────────────────── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {orders.map(order => {
                            const isOpen = selected === order._id;
                            const needsAgt = !order.deliveryAgent && !['cancelled', 'delivered'].includes(order.status);

                            return (
                                <div key={order._id} className="card" style={{
                                    padding: 0, overflow: 'hidden',
                                    border: needsAgt ? '2px solid #f59e0b' : '1px solid var(--glass-border)',
                                    transition: 'all 0.3s',
                                }}>
                                    {/* Row header */}
                                    <div onClick={() => setSelected(isOpen ? null : order._id)} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '110px 1fr 100px 120px 160px 36px',
                                        alignItems: 'center', gap: 12, padding: '14px 20px',
                                        cursor: 'pointer', background: 'var(--bg-elevated)',
                                    }}>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{order.customer?.name || 'Customer'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {order.items?.length} item(s) · {new Date(order.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontWeight: 700,
                                            fontSize: '0.75rem', textTransform: 'capitalize',
                                            background: STATUS_COLOR[order.status] + '22',
                                            color: STATUS_COLOR[order.status],
                                        }}>
                                            {order.status?.replace('_', ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', color: order.deliveryAgent ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                                            {order.deliveryAgent ? `🚴 ${order.deliveryAgent.name}` : '⚠ Unassigned'}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                                    </div>

                                    {/* Expanded panel */}
                                    {isOpen && (
                                        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                                                {/* Items */}
                                                <div>
                                                    <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>🍽 Items Ordered</div>
                                                    {order.items?.map((it, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', marginBottom: 6 }}>
                                                            <span>{it.name} × {it.quantity}</span>
                                                            <span style={{ color: 'var(--primary)' }}>₹{(it.price * it.quantity)}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        📍 {order.deliveryAddress}
                                                    </div>
                                                    {order.notes && (
                                                        <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            📝 {order.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Assignment + Status */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                    {/* Assign agent */}
                                                    <div style={{
                                                        background: 'var(--bg-base)', borderRadius: 12, padding: '16px',
                                                        border: '1px dashed var(--primary)',
                                                    }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            🚴 Assign Delivery Agent
                                                            {order.deliveryAgent && (
                                                                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                                                    (current: {order.deliveryAgent.name})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <select
                                                                className="form-control"
                                                                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                                                                value={agentMap[order._id] || ''}
                                                                onChange={e => setAgentMap(prev => ({ ...prev, [order._id]: e.target.value }))}
                                                            >
                                                                <option value="">— Select Agent —</option>
                                                                {agents.map(a => (
                                                                    <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => handleAssign(order._id)}
                                                                disabled={assigning[order._id]}
                                                                className="btn btn-primary"
                                                                style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                                            >
                                                                {assigning[order._id] ? '⏳' : '📤 Assign'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Update status */}
                                                    <div style={{ background: 'var(--bg-base)', borderRadius: 12, padding: '14px' }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 10 }}>🔄 Update Status</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {STATUS_OPTIONS.map(s => (
                                                                <button key={s} onClick={() => handleStatusUpdate(order._id, s)}
                                                                    style={{
                                                                        padding: '5px 12px', borderRadius: 20, border: 'none',
                                                                        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                                                        background: order.status === s ? STATUS_COLOR[s] : STATUS_COLOR[s] + '22',
                                                                        color: order.status === s ? '#fff' : STATUS_COLOR[s],
                                                                        transition: 'all 0.2s',
                                                                    }}>
                                                                    {s.replace('_', ' ')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
