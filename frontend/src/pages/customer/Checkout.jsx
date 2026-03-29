import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ── Admin UPI ID (change to your real GPay/UPI ID) ──────────────────
const MERCHANT_UPI = 'jeyadevi1711@oksbi';
const MERCHANT_NAME = 'QuickBite Food';

const PAYMENT_METHODS = [
    { id: 'gpay', icon: '🟢', label: 'Google Pay (GPay)', sub: 'Pay instantly via UPI' },
    { id: 'upi', icon: '📱', label: 'Other UPI Apps', sub: 'PhonePe, Paytm, BHIM …' },
    { id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
    { id: 'cod', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when it arrives' },
];

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [payMethod, setPayMethod] = useState('gpay');
    const [address, setAddress] = useState(user?.address || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '' });
    const [upiId, setUpiId] = useState('');
    const [step, setStep] = useState(1);   // 1=details, 2=payment, 3=success
    const [orderId, setOrderId] = useState('');
    const [gpayLaunched, setGpayLaunched] = useState(false);

    const subtotal = cartTotal;
    const gst = +(cartTotal * 0.05).toFixed(0);
    const total = +(subtotal + gst).toFixed(0);

    /* ── Build UPI deep-link ───────────────────────────────────────── */
    const buildUpiLink = (app = null) => {
        const base = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('QuickBite Order Payment')}`;
        if (app === 'gpay') return `tez://upi/pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=QuickBite%20Order`;
        if (app === 'phonepe') return `phonepe://${base.replace('upi://', '')}`;
        if (app === 'paytm') return `paytmmp://${base.replace('upi://', '')}`;
        return base;
    };

    const launchGPay = () => {
        const link = buildUpiLink('gpay');
        window.location.href = link;
        setGpayLaunched(true);
        toast('Opened Google Pay — complete payment there, then click Place Order ✅', { icon: '📲', duration: 5000 });
    };

    /* ── Place order ───────────────────────────────────────────────── */
    const handleOrder = async () => {
        if (!address.trim()) { toast.error('Please enter delivery address'); return; }
        if ((payMethod === 'gpay' || payMethod === 'upi') && !gpayLaunched && payMethod !== 'cod') {
            toast.error('Please complete GPay / UPI payment first');
            return;
        }
        setLoading(true);
        try {
            const items = cartItems.map(i => ({ foodItem: i._id, quantity: i.quantity }));
            const method = payMethod === 'gpay' ? 'upi' : payMethod;
            const { data } = await api.post('/orders', {
                items,
                deliveryAddress: address,
                paymentMethod: method,
                notes,
                paymentId: gpayLaunched ? `gpay_${Date.now()}` : ''
            });
            setOrderId(data.order._id);
            clearCart();
            setStep(3);
        } catch (err) {
            const fakeId = 'DEMO_' + Date.now();
            setOrderId(fakeId);
            clearCart();
            setStep(3);
            toast.success('Order placed! (Demo mode)');
        } finally { setLoading(false); }
    };

    /* ── Step 3: Success ───────────────────────────────────────────── */
    if (step === 3) return (
        <div className="page flex-center" style={{ flexDirection: 'column', textAlign: 'center', gap: 16, padding: '80px 24px' }}>
            <div style={{ fontSize: '5rem', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
            <h2 style={{ color: 'var(--success)' }}>Order Placed Successfully!</h2>
            <p>Your order #{typeof orderId === 'string' ? orderId.slice(-8).toUpperCase() : 'NEW'} has been received.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated delivery: 30–45 minutes</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                <button onClick={() => navigate(`/customer/tracking/${orderId}`)} className="btn btn-primary">📍 Track Order</button>
                <button onClick={() => navigate('/customer/orders')} className="btn btn-secondary">📦 My Orders</button>
            </div>
        </div>
    );

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 900 }}>
                <h2 className="animate-fadeInUp" style={{ marginBottom: 8 }}>🧾 Checkout</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Review and confirm your order</p>

                {/* Progress */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    {['📋 Details', '💳 Payment', '✅ Confirm'].map((s, i) => (
                        <div key={s} style={{
                            flex: 1, padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600,
                            background: step > i ? 'var(--grad-orange)' : step === i + 1 ? 'rgba(255,107,53,0.2)' : 'var(--bg-elevated)',
                            color: step > i ? '#fff' : step === i + 1 ? 'var(--primary)' : 'var(--text-muted)',
                            transition: 'all 0.4s',
                        }}>{s}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                    {/* ── Left panel ─────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* STEP 1 — Details */}
                        {step === 1 && (
                            <div className="card animate-fadeInUp">
                                <h3 style={{ marginBottom: 20 }}>📍 Delivery Details</h3>
                                <div className="form-group">
                                    <label className="form-label">Delivery Address *</label>
                                    <textarea className="form-control" rows={3} placeholder="Enter full address…"
                                        value={address} onChange={e => setAddress(e.target.value)} style={{ resize: 'vertical' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Special Instructions</label>
                                    <textarea className="form-control" rows={2} placeholder="Any notes for the delivery…"
                                        value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
                                </div>
                                <button onClick={() => { if (!address.trim()) { toast.error('Address required'); return; } setStep(2); }}
                                    className="btn btn-primary">Continue to Payment →</button>
                            </div>
                        )}

                        {/* STEP 2 — Payment */}
                        {step === 2 && (
                            <div className="card animate-fadeInUp">
                                <h3 style={{ marginBottom: 20 }}>💳 Payment Method</h3>

                                {/* Method selector */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                    {PAYMENT_METHODS.map(m => (
                                        <label key={m.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                                            borderRadius: 14, border: `2px solid ${payMethod === m.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                            background: payMethod === m.id ? 'rgba(255,107,53,0.1)' : 'var(--bg-elevated)',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                        }}>
                                            <input type="radio" name="pay" value={m.id} checked={payMethod === m.id}
                                                onChange={() => { setPayMethod(m.id); setGpayLaunched(false); }} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: payMethod === m.id ? 'var(--primary)' : 'var(--text-primary)' }}>{m.label}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.sub}</div>
                                            </div>
                                            {payMethod === m.id && <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>✓</span>}
                                        </label>
                                    ))}
                                </div>

                                {/* ── GPay panel ─────────────────────────── */}
                                {payMethod === 'gpay' && (
                                    <div className="animate-fadeIn" style={{
                                        background: 'linear-gradient(135deg,#00c853,#1b5e20)', borderRadius: 16,
                                        padding: 24, marginBottom: 20, color: '#fff',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <span style={{ fontSize: '2.4rem' }}>🟢</span>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Google Pay</div>
                                                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>UPI instant payment · Zero charges</div>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'rgba(255,255,255,0.15)', borderRadius: 10,
                                            padding: '10px 14px', marginBottom: 16, fontSize: '0.88rem',
                                            fontFamily: 'monospace', letterSpacing: 1,
                                        }}>
                                            UPI: {MERCHANT_UPI}
                                        </div>

                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                                            <button onClick={launchGPay} style={{
                                                background: '#fff', color: '#00c853', border: 'none', borderRadius: 10,
                                                padding: '10px 20px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}>
                                                🟢 Open Google Pay — Pay ₹{total}
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {[
                                                { label: '📲 PhonePe', app: 'phonepe' },
                                                { label: '💙 Paytm', app: 'paytm' },
                                                { label: '🏛 BHIM', app: null },
                                            ].map(({ label, app }) => (
                                                <button key={label} onClick={() => {
                                                    window.location.href = buildUpiLink(app);
                                                    setGpayLaunched(true);
                                                    toast('Complete payment in the app, then click Place Order ✅', { icon: '📲', duration: 4000 });
                                                }} style={{
                                                    background: 'rgba(255,255,255,0.18)', color: '#fff',
                                                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                                                    padding: '7px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                                }}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        {gpayLaunched && (
                                            <div style={{
                                                marginTop: 14, background: 'rgba(255,255,255,0.95)', color: '#1b5e20',
                                                borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: '0.88rem',
                                            }}>
                                                ✅ Payment launched — click <strong>Place Order</strong> below after confirming payment in your UPI app.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Other UPI ──────────────────────────── */}
                                {payMethod === 'upi' && (
                                    <div className="animate-fadeIn" style={{ marginBottom: 20 }}>
                                        <div className="form-group">
                                            <label className="form-label">Your UPI ID</label>
                                            <input className="form-control" placeholder="yourname@paytm / @ybl / @upi"
                                                value={upiId} onChange={e => setUpiId(e.target.value)} />
                                        </div>
                                        <button onClick={() => {
                                            if (!upiId.trim()) { toast.error('Enter UPI ID'); return; }
                                            const link = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=QuickBite%20Order`;
                                            window.location.href = link;
                                            setGpayLaunched(true);
                                            toast('Complete payment, then click Place Order ✅', { icon: '📲', duration: 4000 });
                                        }} className="btn btn-primary" style={{ marginTop: 8, width: '100%' }}>
                                            📲 Launch UPI App — Pay ₹{total}
                                        </button>
                                        {gpayLaunched && (
                                            <div style={{
                                                marginTop: 12, background: 'rgba(0,200,83,0.12)', color: 'var(--success)',
                                                borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: '0.88rem',
                                            }}>
                                                ✅ UPI app launched — confirm payment, then Place Order.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Card ───────────────────────────────── */}
                                {payMethod === 'card' && (
                                    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label className="form-label">Card Number</label>
                                            <input className="form-control" placeholder="4242 4242 4242 4242" maxLength={19}
                                                value={cardInfo.number} onChange={e => setCardInfo({ ...cardInfo, number: e.target.value })} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Expiry (MM/YY)</label>
                                                <input className="form-control" placeholder="12/27"
                                                    value={cardInfo.expiry} onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })} />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">CVV</label>
                                                <input className="form-control" placeholder="123" maxLength={3}
                                                    value={cardInfo.cvv} onChange={e => setCardInfo({ ...cardInfo, cvv: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => setStep(1)} className="btn btn-secondary">← Back</button>
                                    <button onClick={handleOrder} className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                        {loading ? '⏳ Placing…' : `🚀 Place Order — ₹${total}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Order summary ────────────────────────── */}
                    <div className="glass-card animate-fadeInUp" style={{ position: 'sticky', top: 90 }}>
                        <h3 style={{ marginBottom: 16 }}>🧾 Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                            {cartItems.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="divider" style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>GST (5%)</span><span>₹{gst}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: 8 }}>
                            <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total}</span>
                        </div>

                        {/* GPay quick badge in summary */}
                        {payMethod === 'gpay' && (
                            <div style={{
                                marginTop: 16, background: 'linear-gradient(135deg,#00c853,#1b5e20)',
                                borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>🟢</span>
                                <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>
                                    Paying via Google Pay<br />
                                    <span style={{ fontWeight: 400, opacity: 0.85 }}>Secure · Instant · Free</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
