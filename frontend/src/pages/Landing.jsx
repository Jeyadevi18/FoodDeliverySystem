import { Link } from 'react-router-dom';

const FEATURES = [
    { icon: '🍕', title: 'Huge Menu', desc: 'Veg & Non-Veg across multiple categories', color: 'var(--grad-orange)' },
    { icon: '⚡', title: 'Fast Delivery', desc: 'Live GPS tracking to your doorstep', color: 'var(--grad-teal)' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Card, UPI, and Cash on Delivery', color: 'var(--grad-purple)' },
    { icon: '📊', title: 'Smart Admin', desc: 'Full analytics and order management', color: 'var(--grad-green)' },
];

const POPULAR = [
    { name: 'Margherita Pizza', price: 299, cat: 'veg', emoji: '🍕' },
    { name: 'Chicken Biryani', price: 349, cat: 'non-veg', emoji: '🍛' },
    { name: 'Veg Burger', price: 199, cat: 'veg', emoji: '🍔' },
    { name: 'Grilled Chicken', price: 399, cat: 'non-veg', emoji: '🍗' },
    { name: 'Pasta Arabiata', price: 249, cat: 'veg', emoji: '🍝' },
    { name: 'Mango Lassi', price: 99, cat: 'beverages', emoji: '🥭' },
];

const Landing = () => (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
        {/* Hero */}
        <section style={{
            minHeight: '100vh', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#1a0a2e 100%)',
            display: 'flex', alignItems: 'center',
        }}>
            {/* Animated orbs */}
            {['#ff6b35', '#f7c948', '#4ecdc4', '#667eea'].map((c, i) => (
                <div key={i} style={{
                    position: 'absolute', borderRadius: '50%',
                    width: 300 + i * 80, height: 300 + i * 80,
                    background: `radial-gradient(circle, ${c}22, transparent 70%)`,
                    top: `${[10, 60, 20, 70][i]}%`, left: `${[70, 10, 90, 50][i]}%`,
                    transform: 'translate(-50%,-50%)',
                    animation: `float ${3 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    pointerEvents: 'none'
                }} />
            ))}

            <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 80 }}>
                <div style={{ maxWidth: 680 }}>
                    <div className="animate-fadeInUp" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)',
                        borderRadius: 100, padding: '6px 18px', marginBottom: 24
                    }}>
                        <span>🔥</span>
                        <span style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: 600 }}>
                            India's Smartest Food Delivery System
                        </span>
                    </div>
                    <h1 className="animate-fadeInUp delay-100" style={{
                        fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.1,
                        marginBottom: 24, color: '#fff'
                    }}>
                        Delicious Food,<br />
                        <span style={{ background: 'linear-gradient(135deg,#ff6b35,#f7c948)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Delivered Fast 🚀
                        </span>
                    </h1>
                    <p className="animate-fadeInUp delay-200" style={{ fontSize: '1.15rem', marginBottom: 40, maxWidth: 500 }}>
                        Order from hundreds of restaurants, track in real-time, and enjoy the freshest meals at your door.
                    </p>
                    <div className="animate-fadeInUp delay-300" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary btn-lg animate-pulse-glow">
                            🍽️ Order Now
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In →
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="animate-fadeInUp delay-400" style={{ display: 'flex', gap: 40, marginTop: 60, flexWrap: 'wrap' }}>
                        {[['500+', 'Restaurants'], ['50K+', 'Happy Customers'], ['10min', 'Avg. Delivery']].map(([v, l]) => (
                            <div key={l}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff6b35' }}>{v}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,255,0.5)' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating food cards */}
            <div style={{
                position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
                display: 'flex', flexDirection: 'column', gap: 16
            }} className="hide-mobile">
                {['🍕', '🍔', '🌮', '🍜'].map((e, i) => (
                    <div key={i} className="glass-card animate-float" style={{
                        animationDelay: `${i * 0.4}s`, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        minWidth: 160, fontSize: '1.5rem'
                    }}>
                        {e}
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f0ff' }}>
                                {['Pizza', 'Burger', 'Tacos', 'Noodles'][i]}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready in 25 min</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Features */}
        <section className="section" style={{ background: 'var(--bg-surface)' }}>
            <div className="container">
                <div className="text-center" style={{ marginBottom: 60 }}>
                    <h2>Why Choose <span style={{ color: 'var(--primary)' }}>FoodDeliver?</span></h2>
                    <p style={{ marginTop: 12 }}>Everything you need for the perfect food delivery experience</p>
                </div>
                <div className="grid grid-2" style={{ gap: 24 }}>
                    {FEATURES.map((f, i) => (
                        <div key={f.title} className="card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s`, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: 16, background: f.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.8rem', flexShrink: 0, boxShadow: `0 8px 20px rgba(0,0,0,0.3)`
                            }}>{f.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Popular Items */}
        <section className="section">
            <div className="container">
                <div className="flex-between" style={{ marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                    <h2>🔥 Popular <span style={{ color: 'var(--primary)' }}>Right Now</span></h2>
                    <Link to="/register" className="btn btn-primary">View Full Menu →</Link>
                </div>
                <div className="grid grid-3" style={{ gap: 20 }}>
                    {POPULAR.map((item, i) => (
                        <div key={item.name} className="card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, padding: 0, overflow: 'hidden' }}>
                            <div style={{
                                height: 120, background: 'linear-gradient(135deg,rgba(255,107,53,0.2),rgba(247,201,72,0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem'
                            }}>{item.emoji}</div>
                            <div style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h3>
                                    <span className={`badge badge-${item.cat}`}>{item.cat}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>₹{item.price}</span>
                                    <Link to="/register" style={{
                                        background: 'var(--grad-orange)', color: '#fff', border: 'none',
                                        borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem',
                                        fontWeight: 600, cursor: 'pointer', textDecoration: 'none'
                                    }}>Order</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA */}
        <section style={{
            padding: '80px 24px', textAlign: 'center',
            background: 'linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,201,72,0.08))',
            borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
            <h2 style={{ marginBottom: 16 }}>Ready to Order? <span style={{ color: 'var(--primary)' }}>Join us!</span></h2>
            <p style={{ marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                Register as a Customer, Delivery Agent, or Admin and manage your food delivery experience.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started 🚀</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Login →</Link>
            </div>
        </section>

        {/* Footer */}
        <footer style={{
            background: 'var(--bg-surface)', borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'
        }}>
            <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>🍕 FoodDeliver</span> – Smart Food Delivery Management System
            </div>
            <div>© {new Date().getFullYear()} FoodDeliver. Built with ❤️ using React + Node.js .</div>
        </footer>
    </div>
);

export default Landing;
