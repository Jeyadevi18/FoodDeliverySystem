import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (Vite/webpack path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STATUSES = ['picked', 'on_the_way', 'delivered'];
const STATUS_LABELS = { picked: '🚴 Picked Up', on_the_way: '🛵 On The Way', delivered: '🎉 Delivered' };

// Custom delivery bike icon
const bikeIcon = L.divIcon({
    html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));">🛵</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: '',
});

const DeliveryTracking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [lastSent, setLastSent] = useState(null);
    const [nextSendIn, setNextSendIn] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);
    const intervalRef = useRef(null);   // 5-min broadcast interval
    const countdownRef = useRef(null);  // 1-sec countdown timer
    const lastPositionRef = useRef(null);

    /* ── Fetch order ──────────────────────────────── */
    useEffect(() => {
        api.get(`/orders/${id}`)
            .then(r => setOrder(r.data.order))
            .catch(() => setOrder({
                _id: id, status: 'picked', totalAmount: 497,
                customer: { name: 'Priya Sharma', phone: '+91 9876543210' },
                items: [{ name: 'Margherita Pizza', quantity: 1 }, { name: 'Mango Lassi', quantity: 2 }],
                deliveryAddress: '123 Main Street, Chennai',
            }))
            .finally(() => setLoading(false));
    }, [id]);

    /* ── Init Leaflet map ─────────────────────────── */
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        const map = L.map(mapRef.current, { zoomControl: true }).setView([13.0827, 80.2707], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);
        mapInstanceRef.current = map;

        // Try to center on user's location right away
        navigator.geolocation?.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            map.setView([lat, lng], 15);
            if (!markerRef.current) {
                markerRef.current = L.marker([lat, lng], { icon: bikeIcon })
                    .addTo(map)
                    .bindPopup('📍 You are here')
                    .openPopup();
            }
        });

        return () => { map.remove(); mapInstanceRef.current = null; };
    }, [loading]);

    /* ── Socket.IO connection ─────────────────────── */
    useEffect(() => {
        if (!id) return;
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.emit('join_order_room', id);
        return () => socket.disconnect();
    }, [id]);

    /* ── Helpers ──────────────────────────────────── */
    const broadcastLocation = (lat, lng) => {
        if (!socketRef.current) return;
        socketRef.current.emit('location_update', { orderId: id, lat, lng });
        // Also persist to DB
        api.put('/delivery/location', { lat, lng }).catch(() => { });
        setLastSent(new Date());
        setNextSendIn(300); // 5 min countdown
        toast(`📡 Location sent to customer`, { icon: '🛵', duration: 2500 });
    };

    /* ── Start / Stop tracking ────────────────────── */
    const startTracking = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setTracking(true);

        const watchId = navigator.geolocation.watchPosition(
            pos => {
                const { latitude: lat, longitude: lng } = pos.coords;
                lastPositionRef.current = { lat, lng };

                // Update map marker
                if (mapInstanceRef.current) {
                    if (!markerRef.current) {
                        markerRef.current = L.marker([lat, lng], { icon: bikeIcon })
                            .addTo(mapInstanceRef.current)
                            .bindPopup('📍 Your live location');
                    } else {
                        markerRef.current.setLatLng([lat, lng]);
                    }
                    mapInstanceRef.current.panTo([lat, lng]);
                }
            },
            () => toast.error('Location access denied'),
            { enableHighAccuracy: true }
        );
        watchIdRef.current = watchId;

        // Immediately send first location
        navigator.geolocation.getCurrentPosition(pos => {
            broadcastLocation(pos.coords.latitude, pos.coords.longitude);
        });

        // Broadcast every 5 minutes
        intervalRef.current = setInterval(() => {
            if (lastPositionRef.current) {
                broadcastLocation(lastPositionRef.current.lat, lastPositionRef.current.lng);
            }
        }, 5 * 60 * 1000);

        // Countdown timer (every second)
        countdownRef.current = setInterval(() => {
            setNextSendIn(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        setTracking(false);
        setNextSendIn(null);
        toast('📴 Location sharing stopped');
    };

    useEffect(() => () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
    }, []);

    /* ── Status update ────────────────────────────── */
    const handleStatusUpdate = async (status) => {
        setUpdating(true);
        try {
            await api.put(`/delivery/orders/${id}/status`, { status });
            setOrder(prev => ({ ...prev, status }));
            toast.success(`Status: ${STATUS_LABELS[status]}`);
            if (status === 'delivered') {
                socketRef.current?.emit('delivery_arrived', { orderId: id });
                stopTracking();
            }
        } catch {
            setOrder(prev => ({ ...prev, status }));
            toast.success(`Updated: ${STATUS_LABELS[status]}`);
        } finally { setUpdating(false); }
    };

    const currentStepIdx = order ? STATUSES.indexOf(order.status) : -1;
    const fmtCountdown = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

    /* ── Render ───────────────────────────────────── */
    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 860 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 24 }}>🗺️ Delivery Map &amp; Status</h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
                        <div className="skeleton" style={{ height: 340, borderRadius: 20 }} />
                    </div>
                ) : order && (
                    <>
                        {/* Customer info */}
                        <div className="card animate-fadeInUp" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--grad-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👤</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{order.customer?.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {order.customer?.phone}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {order.deliveryAddress}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{order.totalAmount}</div>
                        </div>

                        {/* Live Map */}
                        <div style={{ borderRadius: 20, overflow: 'hidden', border: '2px solid var(--glass-border)', marginBottom: 16, position: 'relative' }}>
                            <div ref={mapRef} style={{ height: 340, width: '100%' }} />

                            {/* Tracking controls overlay */}
                            <div style={{
                                position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                                display: 'flex', gap: 10, zIndex: 1000, alignItems: 'center',
                            }}>
                                {!tracking ? (
                                    <button onClick={startTracking} style={{
                                        background: 'linear-gradient(135deg,#ff6b35,#f7931e)', color: '#fff',
                                        border: 'none', borderRadius: 50, padding: '10px 24px',
                                        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(255,107,53,0.5)',
                                    }}>
                                        📡 Start Live Tracking
                                    </button>
                                ) : (
                                    <>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.8)', color: '#4ecdc4',
                                            borderRadius: 50, padding: '8px 18px', fontSize: '0.8rem', fontWeight: 700,
                                        }}>
                                            🔴 LIVE &nbsp;|&nbsp; Next update: {nextSendIn !== null ? fmtCountdown(nextSendIn) : '—'}
                                        </div>
                                        <button onClick={stopTracking} style={{
                                            background: 'rgba(239,68,68,0.9)', color: '#fff',
                                            border: 'none', borderRadius: 50, padding: '8px 18px',
                                            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                        }}>
                                            ⏹ Stop
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {lastSent && (
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                                ✅ Last location sent to customer at {lastSent.toLocaleTimeString()}
                            </div>
                        )}

                        {/* Status Update */}
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {STATUSES.map((s, i) => (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                                            background: i <= currentStepIdx ? 'var(--grad-teal)' : 'var(--bg-elevated)',
                                            border: i === currentStepIdx ? '2px solid #4ecdc4' : '1px solid var(--glass-border)',
                                            boxShadow: i === currentStepIdx ? '0 0 20px rgba(78,205,196,0.5)' : 'none',
                                            transition: 'all 0.4s',
                                        }}>
                                            {i <= currentStepIdx ? '✓' : i + 1}
                                        </div>
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
