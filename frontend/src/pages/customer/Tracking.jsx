import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_CONFIG = {
    pending: { label: 'Order Placed', icon: '📝', color: '#f59e0b' },
    confirmed: { label: 'Confirmed', icon: '✅', color: '#3b82f6' },
    preparing: { label: 'Preparing', icon: '👨‍🍳', color: '#a855f7' },
    ready: { label: 'Ready for Pickup', icon: '📦', color: '#14b8a6' },
    picked: { label: 'Picked Up', icon: '🚴', color: '#ff6b35' },
    on_the_way: { label: 'On The Way', icon: '🛵', color: '#ff6b35' },
    delivered: { label: 'Delivered!', icon: '🎉', color: '#22c55e' },
    cancelled: { label: 'Cancelled', icon: '❌', color: '#ef4444' },
};

const DEMO_ORDER = {
    _id: 'demo123', status: 'on_the_way', totalAmount: 497,
    deliveryAddress: '123 Main Street, Chennai',
    items: [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Mango Lassi', quantity: 2 }],
    deliveryAgent: { name: 'Ravi Kumar', phone: '+91 9876543210', location: { lat: 13.05, lng: 80.22 } },
    estimatedDeliveryTime: 15,
};

const Tracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchOrder = () => {
            api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => setOrder(DEMO_ORDER));
        };
        fetchOrder();
        setLoading(false);
        const interval = setInterval(fetchOrder, 15000);
        return () => clearInterval(interval);
    }, [id]);

    const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 24 }}>📍 Live Order Tracking</h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="skeleton" style={{ height: 120, borderRadius: 20 }} />
                        <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
                    </div>
                ) : order ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                        <div>
                            {/* Status banner */}
                            <div className="animate-fadeInUp" style={{
                                borderRadius: 20, padding: '28px 32px', marginBottom: 24,
                                background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`,
                                border: `1px solid ${cfg.color}44`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <span style={{ fontSize: '3rem', animation: order.status === 'on_the_way' ? 'float 1.5s ease-in-out infinite' : 'none' }}>
                                        {cfg.icon}
                                    </span>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>CURRENT STATUS</div>
                                        <h3 style={{ color: cfg.color, margin: 0, fontSize: '1.5rem' }}>{cfg.label}</h3>
                                        {order.estimatedDeliveryTime > 0 && order.status !== 'delivered' && (
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                                ⏱ Estimated: {order.estimatedDeliveryTime} min
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Map placeholder */}
                            <div ref={mapRef} style={{
                                height: 320, borderRadius: 20,
                                background: 'linear-gradient(135deg,rgba(30,30,56,0.8),rgba(22,22,42,0.9))',
                                border: '1px solid var(--glass-border)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', overflow: 'hidden', marginBottom: 20,
                            }}>
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(rgba(255,107,53,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,53,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                                <div style={{ animation: 'float 2s ease-in-out infinite', fontSize: '3rem', marginBottom: 8 }}>🗺️</div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Live Map</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Add VITE_GOOGLE_MAPS_API_KEY to see live map</div>
                                {order.deliveryAgent?.location && (
                                    <div style={{ marginTop: 12, padding: '8px 16px', borderRadius: 100, background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                        🚴 Agent at {order.deliveryAgent.location.lat?.toFixed(4)}, {order.deliveryAgent.location.lng?.toFixed(4)}
                                    </div>
                                )}
                            </div>

                            {/* Delivery address */}
                            <div className="card">
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📍</span>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DELIVERY ADDRESS</div>
                                        <div style={{ fontWeight: 600, marginTop: 4 }}>{order.deliveryAddress}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {order.deliveryAgent && (
                                <div className="card animate-fadeInUp">
                                    <h4 style={{ marginBottom: 16 }}>🚴 Delivery Agent</h4>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{
                                            width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                                            background: 'var(--grad-teal)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                        }}>🚴</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{order.deliveryAgent.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.deliveryAgent.phone}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card animate-fadeInUp">
                                <h4 style={{ marginBottom: 16 }}>📦 Order Items</h4>
                                {order.items?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                                        <span>{item.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800, color: 'var(--primary)' }}>
                                    <span>Total</span><span>₹{order.totalAmount}</span>
                                </div>
                            </div>

                            <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: '0.8rem', color: '#22c55e', textAlign: 'center' }}>
                                🔄 Auto-refreshes every 15 seconds
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 60 }}><p>Order not found.</p></div>
                )}
            </div>
        </div>
    );
};

export default Tracking;
