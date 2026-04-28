import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons (Vite path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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

const bikeIcon = L.divIcon({
    html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6));">🛵</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], className: '',
});
const homeIcon = L.divIcon({
    html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6));">🏠</div>`,
    iconSize: [32, 32], iconAnchor: [16, 32], className: '',
});

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function etaLabel(km) {
    const mins = Math.round((km / 30) * 60);
    if (mins < 1) return '< 1 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
}

function distLabel(km) {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

const Tracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agentPos, setAgentPos] = useState(null);
    const [destPos, setDestPos] = useState(null);
    const [eta, setEta] = useState(null);
    const [distKm, setDistKm] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Use callback ref so map init fires as soon as the div is in the DOM
    const mapInstance = useRef(null);
    const agentMarker = useRef(null);
    const destMarker = useRef(null);
    const routeLine = useRef(null);
    const lastNotify = useRef(0);

    const mapContainerRef = useCallback((node) => {
        if (!node || mapInstance.current) return;
        const map = L.map(node).setView([13.0827, 80.2707], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);
        mapInstance.current = map;
    }, []);

    /* ── Fetch order (poll every 15s) ─────────────── */
    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                const o = data.order;
                setOrder(o);
                if (o.deliveryAgent?.location?.lat) {
                    setAgentPos({ lat: o.deliveryAgent.location.lat, lng: o.deliveryAgent.location.lng });
                }
            } catch { /* keep previous state */ }
            finally { setLoading(false); }
        };
        fetch();
        const interval = setInterval(fetch, 15000);
        return () => clearInterval(interval);
    }, [id]);

    /* ── Socket.IO ─────────────────────────────────── */
    useEffect(() => {
        if (!id) return;
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socket.emit('join_order_room', id);

        socket.on('location_update', ({ lat, lng, timestamp }) => {
            const pos = { lat, lng };
            setAgentPos(pos);
            setLastUpdate(timestamp ? new Date(timestamp) : new Date());
        });

        socket.on('delivery_arrived', () => {
            toast.success('🎉 Your food has arrived! Enjoy your meal!', { duration: 8000 });
        });

        return () => socket.disconnect();
    }, [id]);

    /* ── Geocode delivery address ─────────────────── */
    useEffect(() => {
        if (!order?.deliveryAddress) return;
        fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(order.deliveryAddress)}&limit=1`
        )
            .then(r => r.json())
            .then(data => {
                if (data[0]) setDestPos({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            })
            .catch(() => { });
    }, [order?.deliveryAddress]);

    /* ── Update map markers whenever positions change ─ */
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        if (agentPos) {
            if (!agentMarker.current) {
                agentMarker.current = L.marker([agentPos.lat, agentPos.lng], { icon: bikeIcon })
                    .addTo(map)
                    .bindPopup('🛵 Delivery Agent');
            } else {
                agentMarker.current.setLatLng([agentPos.lat, agentPos.lng]);
            }
        }

        if (destPos) {
            if (!destMarker.current) {
                destMarker.current = L.marker([destPos.lat, destPos.lng], { icon: homeIcon })
                    .addTo(map)
                    .bindPopup('🏠 Your Delivery Address')
                    .openPopup();
            }
        }

        if (agentPos && destPos) {
            const lls = [[agentPos.lat, agentPos.lng], [destPos.lat, destPos.lng]];
            if (routeLine.current) routeLine.current.setLatLngs(lls);
            else routeLine.current = L.polyline(lls, { color: '#ff6b35', weight: 4, dashArray: '10 7', opacity: 0.85 }).addTo(map);
            map.fitBounds(L.latLngBounds(lls), { padding: [60, 60] });

            const km = haversine(agentPos.lat, agentPos.lng, destPos.lat, destPos.lng);
            setDistKm(km);
            setEta(etaLabel(km));
        } else if (agentPos) {
            map.setView([agentPos.lat, agentPos.lng], 15);
        } else if (destPos) {
            map.setView([destPos.lat, destPos.lng], 14);
        }
    }, [agentPos, destPos]);

    /* ── 5-minute ETA toast ───────────────────────── */
    useEffect(() => {
        if (!eta || !distKm || !lastUpdate) return;
        const now = Date.now();
        if (now - lastNotify.current >= 5 * 60 * 1000) {
            lastNotify.current = now;
            toast(
                `🛵 Update: Agent is ${distLabel(distKm)} away — ETA ${eta}`,
                {
                    duration: 10000, icon: '📍',
                    style: { background: '#1e1e38', color: '#fff', border: '1px solid rgba(255,107,53,0.4)', fontWeight: 600 },
                }
            );
        }
    }, [lastUpdate]);

    const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 24 }}>📍 Live Order Tracking</h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="skeleton" style={{ height: 120, borderRadius: 20 }} />
                        <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

                        {/* ── Left column ── */}
                        <div>
                            {/* Status banner */}
                            {cfg && (
                                <div className="animate-fadeInUp" style={{
                                    borderRadius: 20, padding: '22px 26px', marginBottom: 16,
                                    background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}11)`,
                                    border: `1px solid ${cfg.color}44`,
                                    display: 'flex', alignItems: 'center', gap: 16,
                                }}>
                                    <span style={{ fontSize: '2.6rem', animation: order?.status === 'on_the_way' ? 'float 1.5s ease-in-out infinite' : 'none' }}>
                                        {cfg.icon}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>CURRENT STATUS</div>
                                        <h3 style={{ color: cfg.color, margin: 0, fontSize: '1.35rem' }}>{cfg.label}</h3>
                                    </div>
                                    {eta && order?.status !== 'delivered' && (
                                        <div style={{
                                            background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.35)',
                                            borderRadius: 50, padding: '10px 20px', textAlign: 'center', minWidth: 100,
                                        }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ETA</div>
                                            <div style={{ fontWeight: 800, color: '#ff6b35', fontSize: '1.15rem' }}>{eta}</div>
                                            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{distKm ? distLabel(distKm) + ' away' : ''}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Live Map ── always rendered so callback ref fires ── */}
                            <div style={{ borderRadius: 20, overflow: 'hidden', border: '2px solid var(--glass-border)', marginBottom: 12, position: 'relative' }}>
                                {/* The div below ALWAYS renders; callback ref initialises Leaflet immediately */}
                                <div
                                    ref={mapContainerRef}
                                    style={{ height: 380, width: '100%' }}
                                />

                                {/* "Waiting" overlay when agent hasn't shared yet */}
                                {!agentPos && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(14,14,30,0.72)', zIndex: 500, pointerEvents: 'none',
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🗺️</div>
                                        <div style={{ color: '#fff', fontWeight: 700 }}>Waiting for agent location…</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 6 }}>
                                            Map will update when your agent starts tracking
                                        </div>
                                    </div>
                                )}

                                {/* LIVE badge */}
                                {agentPos && (
                                    <div style={{
                                        position: 'absolute', top: 12, left: 12, zIndex: 1000,
                                        background: 'rgba(0,0,0,0.78)', color: '#ff6b35',
                                        borderRadius: 20, padding: '5px 14px', fontSize: '0.72rem', fontWeight: 700,
                                        border: '1px solid rgba(255,107,53,0.4)',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6b35', display: 'inline-block' }} />
                                        LIVE TRACKING
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <span>{lastUpdate ? `📡 Last update: ${lastUpdate.toLocaleTimeString()}` : '⏳ Awaiting first location ping…'}</span>
                                <span style={{ color: 'rgba(34,197,94,0.9)', background: 'rgba(34,197,94,0.08)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                                    🔄 Auto-updates every 5 min
                                </span>
                            </div>

                            {order?.deliveryAddress && (
                                <div className="card">
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🏠</span>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELIVERY ADDRESS</div>
                                            <div style={{ fontWeight: 600, marginTop: 4 }}>{order.deliveryAddress}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Right sidebar ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {order?.deliveryAgent && (
                                <div className="card animate-fadeInUp">
                                    <h4 style={{ marginBottom: 14 }}>🚴 Delivery Agent</h4>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grad-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🛵</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{order.deliveryAgent.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{order.deliveryAgent.phone}</div>
                                        </div>
                                    </div>
                                    {agentPos && (
                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px' }}>
                                            📍 {agentPos.lat.toFixed(5)}, {agentPos.lng.toFixed(5)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {eta && order?.status !== 'delivered' && (
                                <div style={{ padding: '20px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,149,30,0.08))', border: '1px solid rgba(255,107,53,0.3)' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>⏱ ESTIMATED ARRIVAL</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.7rem', color: '#ff6b35' }}>{eta}</div>
                                    {distKm && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{distLabel(distKm)} away</div>}
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,107,53,0.7)', marginTop: 10 }}>
                                        🔔 You'll get a notification every 5 min
                                    </div>
                                </div>
                            )}

                            {order?.items?.length > 0 && (
                                <div className="card animate-fadeInUp">
                                    <h4 style={{ marginBottom: 14 }}>📦 Order Items</h4>
                                    {order.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.88rem' }}>
                                            <span>{item.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800, color: 'var(--primary)' }}>
                                        <span>Total</span><span>₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            )}

                            {!order && !loading && (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Order not found.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;
