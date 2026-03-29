import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const DEMO_ORDERS = [
    { _id: 'ord1', items: [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Mango Lassi', quantity: 2 }], totalAmount: 497, status: 'delivered', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), deliveryAddress: '123 Main St', paymentMethod: 'upi' },
    { _id: 'ord2', items: [{ name: 'Chicken Biryani', quantity: 2 }], totalAmount: 732, status: 'on_the_way', createdAt: new Date(Date.now() - 3600000).toISOString(), deliveryAddress: '456 Park Ave', paymentMethod: 'card' },
    { _id: 'ord3', items: [{ name: 'Veg Burger', quantity: 1 }, { name: 'Pasta Arabiata', quantity: 1 }], totalAmount: 471, status: 'pending', createdAt: new Date().toISOString(), deliveryAddress: '789 Oak Rd', paymentMethod: 'cod' },
];

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'on_the_way', 'delivered'];

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/orders/mine').then(r => setOrders(r.data.orders || [])).catch(() => setOrders(DEMO_ORDERS)).finally(() => setLoading(false));
    }, []);

    const displayed = orders.length > 0 ? orders : DEMO_ORDERS;

    const getStepIdx = (status) => STATUS_STEPS.indexOf(status);

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 8 }}>📦 My Orders</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Track and review your past orders</p>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {displayed.map((order, idx) => (
                            <div key={order._id} className="card animate-fadeInUp" style={{ animationDelay: `${idx * 0.08}s`, padding: 0, overflow: 'hidden' }}>
                                {/* Order header */}
                                <div
                                    style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
                                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                                >
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                        background: 'linear-gradient(135deg,rgba(255,107,53,0.2),rgba(247,201,72,0.1))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                    }}>📦</div>
                                    <div style={{ flex: 1, minWidth: 120 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                                            {order.items?.map(i => i.name).join(', ').substring(0, 50)}{order.items?.length > 1 ? '...' : ''}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.createdAt).toLocaleString()} · #{order._id.slice(-6).toUpperCase()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>₹{order.totalAmount}</div>
                                        <span className={`badge badge-${order.status}`} style={{ marginTop: 4 }}>{order.status.replace('_', ' ')}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{expanded === order._id ? '▲' : '▼'}</span>
                                </div>

                                {/* Expanded details */}
                                {expanded === order._id && (
                                    <div className="animate-fadeIn" style={{ borderTop: '1px solid var(--glass-border)', padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
                                        {/* Progress steps */}
                                        {order.status !== 'cancelled' && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>ORDER PROGRESS</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                                                    {STATUS_STEPS.map((s, i) => (
                                                        <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                                                                background: i <= getStepIdx(order.status) ? 'var(--grad-orange)' : 'var(--bg-elevated)',
                                                                color: i <= getStepIdx(order.status) ? '#fff' : 'var(--text-muted)',
                                                                border: i === getStepIdx(order.status) ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                                transition: 'all 0.3s', boxShadow: i === getStepIdx(order.status) ? 'var(--shadow-glow)' : 'none',
                                                            }}>{i <= getStepIdx(order.status) ? '✓' : i + 1}</div>
                                                            {i < STATUS_STEPS.length - 1 && (
                                                                <div style={{
                                                                    width: 40, height: 2, flexShrink: 0,
                                                                    background: i < getStepIdx(order.status) ? 'var(--primary)' : 'var(--glass-border)',
                                                                    transition: 'background 0.4s',
                                                                }} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                                    {STATUS_STEPS.join(' → ')}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
                                            <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELIVERY ADDRESS</div><div style={{ fontSize: '0.9rem', marginTop: 4 }}>{order.deliveryAddress}</div></div>
                                            <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT</div><div style={{ fontSize: '0.9rem', marginTop: 4 }}>{order.paymentMethod?.toUpperCase()}</div></div>
                                            <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ITEMS</div><div style={{ fontSize: '0.9rem', marginTop: 4 }}>{order.items?.length} item(s)</div></div>
                                        </div>

                                        {['picked', 'on_the_way', 'confirmed', 'preparing'].includes(order.status) && (
                                            <Link to={`/customer/tracking/${order._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                                                📍 Live Track
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
