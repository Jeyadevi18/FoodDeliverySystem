import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DEMO_USERS = [
    { _id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', role: 'customer', phone: '9876543210', isActive: true, createdAt: new Date().toISOString() },
    { _id: 'u2', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'delivery', phone: '9123456789', isActive: true, createdAt: new Date().toISOString() },
    { _id: 'u3', name: 'Sneha Patel', email: 'sneha@example.com', role: 'customer', phone: '9988776655', isActive: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { _id: 'u4', name: 'Arjun Mehta', email: 'arjun@example.com', role: 'delivery', phone: '9845678901', isActive: true, createdAt: new Date().toISOString() },
];

const ROLE_COLORS = { customer: '#ff6b35', delivery: '#4ecdc4', admin: '#667eea' };

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = () => {
        const params = {};
        if (roleFilter) params.role = roleFilter;
        api.get('/admin/users', { params }).then(r => setUsers(r.data.users || [])).catch(() => setUsers(DEMO_USERS.filter(u => !roleFilter || u.role === roleFilter))).finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const handleToggle = async (id, name) => {
        try { await api.put(`/admin/users/${id}/toggle`); toast.success(`${name} status updated`); fetchUsers(); }
        catch { setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u)); toast.success('Updated (demo)'); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"?`)) return;
        try { await api.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
        catch { setUsers(prev => prev.filter(u => u._id !== id)); toast.success('Deleted (demo)'); }
    };

    const displayed = users.length > 0 ? users : DEMO_USERS.filter(u => !roleFilter || u.role === roleFilter);

    return (
        <div className="page" style={{ background: 'var(--bg-base)' }}>
            <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <div className="flex-between" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div><h2 style={{ marginBottom: 4 }}>👥 User Management</h2><p>Manage customers and delivery agents</p></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['', 'customer', 'delivery', 'admin'].map(r => (
                            <button key={r} onClick={() => setRoleFilter(r)} className="btn btn-sm" style={{
                                background: roleFilter === r ? 'var(--grad-orange)' : 'rgba(255,255,255,0.06)',
                                color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
                                border: 'none',
                            }}>{r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                    {loading ? [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />) :
                        displayed.map((user, idx) => (
                            <div key={user._id} className="card animate-fadeInUp" style={{ animationDelay: `${idx * 0.06}s`, padding: '20px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                                        background: `${ROLE_COLORS[user.role]}22`, border: `1px solid ${ROLE_COLORS[user.role]}44`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                                    }}>{user.role === 'customer' ? '🧑' : user.role === 'delivery' ? '🚴' : '⚙️'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                                        background: `${ROLE_COLORS[user.role]}22`, color: ROLE_COLORS[user.role],
                                        border: `1px solid ${ROLE_COLORS[user.role]}44`
                                    }}>{user.role}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>📞 {user.phone || 'N/A'}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`badge ${user.isActive ? 'badge-delivered' : 'badge-cancelled'}`} style={{ flex: 1, justifyContent: 'center' }}>
                                        {user.isActive ? '✓ Active' : '✗ Inactive'}
                                    </span>
                                    <button onClick={() => handleToggle(user._id, user.name)} className="btn btn-secondary btn-sm">
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => handleDelete(user._id, user.name)} className="btn btn-danger btn-sm btn-icon">🗑</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
