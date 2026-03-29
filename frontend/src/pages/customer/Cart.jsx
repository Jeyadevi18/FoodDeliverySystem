import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (cartItems.length === 0) return (
        <div className="page flex-center" style={{ flexDirection: 'column', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', animation: 'float 3s ease-in-out infinite' }}>🛒</div>
            <h2>Your cart is empty!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Add some delicious items to get started.</p>
            <Link to="/customer/menu" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>Browse Menu 🍽️</Link>
        </div>
    );

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 800 }}>
                <div className="flex-between" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <h2>🛒 My Cart</h2>
                    <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="btn btn-danger btn-sm">
                        Clear Cart
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                    {cartItems.map((item, idx) => (
                        <div key={item._id} className="card animate-fadeInUp" style={{
                            animationDelay: `${idx * 0.07}s`, display: 'flex', alignItems: 'center',
                            gap: 16, flexWrap: 'wrap', padding: '16px 20px'
                        }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                                background: 'linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,201,72,0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                                overflow: 'hidden',
                            }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                            </div>
                            <div style={{ flex: 1, minWidth: 120 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{item.name}</div>
                                <div style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{item.price} each</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{
                                    width: 34, height: 34, borderRadius: 10, border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.1rem'
                                }}>−</button>
                                <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{
                                    width: 34, height: 34, borderRadius: 10, border: 'none',
                                    background: 'var(--grad-orange)', color: '#fff', cursor: 'pointer', fontSize: '1.1rem'
                                }}>+</button>
                            </div>

                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)', minWidth: 70, textAlign: 'right' }}>
                                ₹{(item.price * item.quantity).toFixed(0)}
                            </div>
                            <button onClick={() => { removeFromCart(item._id); toast.success(`${item.name} removed`); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)',
                                transition: 'color 0.2s', padding: 4,
                            }}>✕</button>
                        </div>
                    ))}
                </div>

                {/* Summary card */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 20 }}>Order Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span>₹{cartTotal.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery fee</span>
                            <span style={{ color: 'var(--success)' }}>FREE 🎉</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>GST (5%)</span>
                            <span>₹{(cartTotal * 0.05).toFixed(0)}</span>
                        </div>
                        <hr className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{(cartTotal * 1.05).toFixed(0)}</span>
                        </div>
                    </div>
                    <Link to="/customer/checkout" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }}>
                        Proceed to Checkout →
                    </Link>
                    <Link to="/customer/menu" className="btn btn-secondary btn-block" style={{ marginTop: 10 }}>
                        ← Add More Items
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
