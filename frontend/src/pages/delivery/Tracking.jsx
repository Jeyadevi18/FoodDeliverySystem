import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUSES = ['picked', 'on_the_way', 'delivered'];
const STATUS_LABELS = { picked: '🚴 Picked Up', on_the_way: '🛵 On The Way', delivered: '🎉 Delivered' };

const DeliveryTracking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [locSharing, setLocSharing] = useState(false);

    useEffect(() => {
        api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => setOrder({
            _id: id, status: 'picked', totalAmount: 497,
            customer: { name: 'Priya Sharma', phone: '+91 9876543210', address: '123 Main Street' },
            items: [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Mango Lassi', quantity: 2 }],
            deliveryAddress: '123 Main Street, Chennai'
        })).finally(() => setLoading(false));
    }, [id]);

    const handleStatusUpdate = async (status) => {
        setUpdating(true);
        try {
            await api.put(`/delivery/orders/${id}/status`, { status });
            setOrder(prev => ({ ...prev, status }));
            toast.success(`Status updated: ${STATUS_LABELS[status]}`);
        } catch {
            setOrder(prev => ({ ...prev, status }));
            toast.success(`Updated (demo): ${STATUS_LABELS[status]}`);
        } finally { setUpdating(false); }
    };

    const startLocationSharing = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setLocSharing(true);
        const watch = navigator.geolocation.watchPosition(
            pos => {
                api.put('/delivery/location', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => { });
                toast.success(`📍 Location updated (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
            },
            () => toast.error('Location access denied'),
            { enableHighAccuracy: true }
        );
        setTimeout(() => { navigator.geolocation.clearWatch(watch); setLocSharing(false); toast.success('Location sharing stopped'); }, 60000);
    };

    const currentStepIdx = order ? STATUSES.indexOf(order.status) : -1;

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 800 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 24 }}>🗺️ Delivery Map & Status</h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
                        <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
                    </div>
                ) : order && (
                    <>
                        {/* Customer info card */}
                        <div className="card animate-fadeInUp" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--grad-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👤</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{order.customer?.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {order.customer?.phone}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {order.deliveryAddress}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{order.totalAmount}</div>
                        </div>

                        {/* Map placeholder */}
                        <div style={{
                            height: 280, borderRadius: 20, marginBottom: 24, position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(135deg,rgba(30,30,56,0.9),rgba(22,22,42,0.9))',
                            border: '1px solid var(--glass-border)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'linear-gradient(rgba(78,205,196,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(78,205,196,0.4) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div style={{ fontSize: '3.5rem', marginBottom: 8, animation: 'float 2s ease-in-out infinite' }}>🗺️</div>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Live Navigation Map</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Google Maps loads with VITE_GOOGLE_MAPS_API_KEY</div>
                            <button onClick={startLocationSharing} className="btn btn-success btn-sm" style={{ marginTop: 16 }}>
                                {locSharing ? '📡 Sharing Live Location...' : '📍 Share My Location'}
                            </button>
                        </div>

                        {/* Status update */}
                        <div className="card animate-fadeInUp" style={{ marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 20 }}>📊 Update Delivery Status</h3>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                                {STATUSES.map((s, i) => (
                                    <button key={s} onClick={() => handleStatusUpdate(s)}
                                        disabled={updating || i > currentStepIdx + 1}
                                        className={`btn btn-${currentStepIdx === i ? 'primary' : 'secondary'} btn-sm`}
                                        style={{ opacity: i > currentStepIdx + 1 ? 0.4 : 1 }}>
                                        {STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                {STATUSES.map((s, i) => (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                                            background: i <= currentStepIdx ? 'var(--grad-teal)' : 'var(--bg-elevated)',
                                            border: i === currentStepIdx ? '2px solid #4ecdc4' : '1px solid var(--glass-border)',
                                            boxShadow: i === currentStepIdx ? '0 0 20px rgba(78,205,196,0.5)' : 'none',
                                            transition: 'all 0.4s',
                                        }}>{i <= currentStepIdx ? '✓' : i + 1}</div>
                                        {i < STATUSES.length - 1 && (
                                            <div style={{ flex: 1, height: 3, background: i < currentStepIdx ? '#4ecdc4' : 'var(--glass-border)', transition: 'background 0.4s' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {STATUSES.map(s => <span key={s} style={{ flex: 1, textAlign: 'center' }}>{s.replace('_', ' ')}</span>)}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="card animate-fadeInUp">
                            <h4 style={{ marginBottom: 14 }}>📦 Order Items</h4>
                            {order.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                                    <span>{item.name}</span><span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeliveryTracking;
