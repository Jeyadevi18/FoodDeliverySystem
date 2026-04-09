import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../../api/client';

const ROLE_COLOR = { admin: '#FF6B35', customer: '#6C63FF', delivery: '#2ECC71' };

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try { const res = await api.get('/api/auth/users'); setUsers(res.data); } catch { }
        setLoading(false);
    };

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' }}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>👥 Users ({users.length})</Text>
            <FlatList
                data={users}
                keyExtractor={u => u._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.email}>{item.email}</Text>
                        </View>
                        <View style={[styles.roleBadge, { borderColor: ROLE_COLOR[item.role] }]}>
                            <Text style={[styles.roleText, { color: ROLE_COLOR[item.role] }]}>{item.role?.toUpperCase()}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#2a2a3e' },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF6B3533', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FF6B35', fontWeight: '800', fontSize: 18 },
    name: { color: '#fff', fontWeight: '700', fontSize: 15 },
    email: { color: '#888', fontSize: 12, marginTop: 2 },
    roleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    roleText: { fontSize: 10, fontWeight: '700' },
});
