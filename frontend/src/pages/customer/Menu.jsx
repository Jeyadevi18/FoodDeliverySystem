import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'veg', 'non-veg', 'beverages', 'desserts'];
const CAT_ICONS = { all: '🍽️', veg: '🥦', 'non-veg': '🍗', beverages: '🥤', desserts: '🍰' };
const CAT_COLORS = { all: 'var(--grad-orange)', veg: 'var(--grad-green)', 'non-veg': 'var(--grad-pink)', beverages: 'var(--grad-teal)', desserts: 'var(--grad-purple)' };



const FOOD_EMOJIS = { veg: '🥗', 'non-veg': '🍖', beverages: '🥤', desserts: '🍰' };

const Menu = () => {
    const { addToCart, cartItems } = useCart();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(false);
        const params = { available: 'true' };
        if (category !== 'all') params.category = category;
        if (search) params.search = search;

        api.get('/foods', { params })
            .then(r => setFoods(r.data.foods || []))
            .catch(() => { setFoods([]); setError(true); })
            .finally(() => setLoading(false));
    }, [category, search]);

    const displayed = foods;

    const handleAdd = (food) => {
        addToCart(food);
        toast.success(`${food.name} added to cart! 🛒`);
    };

    const inCart = (id) => cartItems.find(i => i._id === id);

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                {/* Header */}
                <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
                    <h2>🍽️ Our <span style={{ color: 'var(--primary)' }}>Menu</span></h2>
                    <p>Fresh, delicious food made to order</p>
                </div>

                {/* Search */}
                <div className="animate-fadeInUp" style={{ position: 'relative', marginBottom: 24, maxWidth: 480 }}>
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
                    <input
                        className="form-control" placeholder="Search dishes..."
                        style={{ paddingLeft: 48 }}
                        value={search} onChange={e => { setSearch(e.target.value); setLoading(true); }}
                    />
                </div>

                {/* Category pills */}
                <div className="animate-fadeInUp" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => { setCategory(cat); setLoading(true); }} style={{
                            padding: '10px 20px', border: 'none', borderRadius: 100, cursor: 'pointer',
                            fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.3s',
                            background: category === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,0.06)',
                            color: category === cat ? '#fff' : 'var(--text-secondary)',
                            boxShadow: category === cat ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                            transform: category === cat ? 'scale(1.05)' : 'scale(1)',
                        }}>
                            {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Food grid */}
                {loading ? (
                    <div className="grid grid-3" style={{ gap: 20 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />)}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
                        <p style={{ fontWeight: 600 }}>Could not load menu.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Please check your connection and refresh the page.</p>
                    </div>
                ) : (
                    <div className="grid grid-3" style={{ gap: 20 }}>
                        {displayed.map((food, idx) => (
                            <div key={food._id} className="card animate-fadeInUp" style={{ animationDelay: `${idx * 0.06}s`, padding: 0, overflow: 'hidden' }}>
                                {/* Image / Emoji area */}
                                <div style={{
                                    height: 140, position: 'relative', overflow: 'hidden',
                                    background: food.imageUrl
                                        ? `url(${food.imageUrl}) center/cover`
                                        : `linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,201,72,0.1))`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {!food.imageUrl && <span style={{ fontSize: '4rem' }}>{FOOD_EMOJIS[food.category] || '🍽️'}</span>}
                                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                                        <span className={`badge badge-${food.category}`}>{food.category}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '16px 20px 20px' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{food.name}</h3>
                                    <p style={{ fontSize: '0.8rem', marginBottom: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                        {food.description?.substring(0, 60)}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>₹{food.price}</span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱ {food.preparationTime} min</span>
                                    </div>
                                    {food.rating > 0 && (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', marginBottom: 12 }}>
                                            {'⭐'.repeat(Math.round(food.rating))} {food.rating}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleAdd(food)}
                                        className="btn btn-primary btn-sm w-full"
                                        style={{ background: inCart(food._id) ? 'var(--grad-green)' : 'var(--grad-orange)' }}
                                    >
                                        {inCart(food._id) ? `✓ In Cart (${inCart(food._id).quantity})` : '+ Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {displayed.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍽️</div>
                                <p>No items available in this category right now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating cart button */}
            <Link to="/customer/cart" style={{
                position: 'fixed', bottom: 32, right: 32, zIndex: 100,
                background: 'var(--grad-orange)', color: '#fff', border: 'none',
                borderRadius: 20, padding: '14px 24px', fontFamily: 'Outfit', fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(255,107,53,0.5)', cursor: 'pointer',
                animation: 'pulse-glow 2s ease-in-out infinite',
            }}>
                🛒 Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})
            </Link>
        </div>
    );
};

export default Menu;
