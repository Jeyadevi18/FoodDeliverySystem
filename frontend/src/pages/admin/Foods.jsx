import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'veg', available: true, preparationTime: 25, imageUrl: '' };
const CATS = ['veg', 'non-veg', 'beverages', 'desserts'];
const CAT_EMOJI = { veg: '🥗', 'non-veg': '🍖', beverages: '🥤', desserts: '🍰' };



const AdminFoods = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchFoods = () => {
        setLoadError(false);
        api.get('/foods', { params: { search } })
            .then(r => setFoods(r.data.foods || []))
            .catch(() => { setFoods([]); setLoadError(true); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchFoods(); }, [search]);

    const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (food) => { setForm({ ...food, price: String(food.price), preparationTime: String(food.preparationTime) }); setEditId(food._id); setShowModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) };
            if (editId) {
                await api.put(`/foods/${editId}`, payload);
                toast.success('Food item updated! ✏️');
            } else {
                await api.post('/foods', payload);
                toast.success('Food item added! 🍕');
            }
            setShowModal(false);
            fetchFoods();
        } catch {
            // Demo mode
            if (editId) { setFoods(prev => prev.map(f => f._id === editId ? { ...f, ...form, price: Number(form.price) } : f)); }
            else { setFoods(prev => [...prev, { ...form, _id: Date.now().toString(), price: Number(form.price) }]); }
            toast.success(editId ? 'Updated (demo)' : 'Added (demo)');
            setShowModal(false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try { await api.delete(`/foods/${id}`); toast.success('Deleted!'); fetchFoods(); }
        catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete food item.'); }
    };

    const displayed = foods;

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <div className="flex-between" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h2 style={{ marginBottom: 4 }}>🍕 Food Menu</h2>
                        <p>Manage all food items</p>
                    </div>
                    <button onClick={openAdd} className="btn btn-primary">+ Add New Item</button>
                </div>

                <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                    <input className="form-control" placeholder="Search items..." style={{ paddingLeft: 44 }}
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div className="grid grid-3" style={{ gap: 18 }}>
                    {loading ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 18 }} />) :
                    loadError ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
                            <p style={{ fontWeight: 600 }}>Could not load food items from server.</p>
                            <button onClick={fetchFoods} className="btn btn-secondary" style={{ marginTop: 16 }}>🔄 Retry</button>
                        </div>
                    ) : displayed.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍽️</div>
                            <p>No food items yet. Click "+ Add New Item" to get started.</p>
                        </div>
                    ) :
                        displayed.map((food, idx) => (
                            <div key={food._id} className="card animate-fadeInUp" style={{ animationDelay: `${idx * 0.06}s`, padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: food.imageUrl ? `url(${food.imageUrl}) center/cover` : 'linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,201,72,0.1))',
                                    fontSize: '3.5rem', position: 'relative',
                                }}>
                                    {!food.imageUrl && CAT_EMOJI[food.category]}
                                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                                        <span className={`badge badge-${food.category}`}>{food.category}</span>
                                        <span className={`badge ${food.available ? 'badge-delivered' : 'badge-cancelled'}`}>{food.available ? 'Active' : 'Off'}</span>
                                    </div>
                                </div>
                                <div style={{ padding: '14px 18px 18px' }}>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: 6 }}>{food.name}</h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>{food.description?.substring(0, 55)}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.05rem' }}>₹{food.price}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ {food.preparationTime}m</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => openEdit(food)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                                        <button onClick={() => handleDelete(food._id, food.name)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>🗑 Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div onClick={e => e.target === e.currentTarget && setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div className="card animate-fadeInUp" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
                        <div className="flex-between" style={{ marginBottom: 24 }}>
                            <h3>{editId ? '✏️ Edit Item' : '+ Add Food Item'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Name *</label>
                                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Description *</label>
                                    <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'none' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price (₹) *</label>
                                    <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Prep Time (min)</label>
                                    <input type="number" className="form-control" value={form.preparationTime} onChange={e => setForm({ ...form, preparationTime: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {CATS.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Availability</label>
                                    <select className="form-control" value={form.available} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                                        <option value="true">✅ Available</option>
                                        <option value="false">❌ Unavailable</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">Image URL (optional)</label>
                                    <input className="form-control" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFoods;
