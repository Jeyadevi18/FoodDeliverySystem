import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const [stats, setStats] = useState({ orders: 0, users: 0, foods: 0, revenue: 0 });

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const [ordersRes, usersRes, foodsRes] = await Promise.all([
                api.get('/api/orders'), api.get('/api/auth/users'), api.get('/api/foods')
            ]);
            const orders = ordersRes.data;
            setStats({
                orders: orders.length,
                users: usersRes.data.length,
                foods: foodsRes.data.length,
                revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
            });
        } catch { }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛠 Admin Panel</Text>
                <TouchableOpacity onPress={() => Alert.alert('Logout', 'Sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {[
                    { label: 'Total Orders', value: stats.orders, icon: '📦', color: '#6C63FF' },
                    { label: 'Total Users', value: stats.users, icon: '👥', color: '#3498DB' },
                    { label: 'Menu Items', value: stats.foods, icon: '🍔', color: '#FF6B35' },
                    { label: 'Revenue (₹)', value: stats.revenue, icon: '💰', color: '#2ECC71' },
                ].map((s, i) => (
                    <View key={i} style={[styles.statCard, { borderColor: s.color }]}>
                        <Text style={styles.statIcon}>{s.icon}</Text>
                        <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {[
                { title: '📋 Manage Orders', sub: 'View and update all orders', screen: 'Orders' },
                { title: '🍽️ Manage Foods', sub: 'Add, edit or remove menu items', screen: 'Foods' },
                { title: '👥 Manage Users', sub: 'View all registered users', screen: 'Users' },
            ].map((a, i) => (
                <TouchableOpacity key={i} style={styles.actionCard}>
                    <View>
                        <Text style={styles.actionTitle}>{a.title}</Text>
                        <Text style={styles.actionSub}>{a.sub}</Text>
                    </View>
                    <Text style={{ color: '#FF6B35', fontSize: 20 }}>→</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#fff' },
    logout: { color: '#FF6B35', fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 24 },
    statCard: { width: '47%', backgroundColor: '#1e1e2e', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
    statIcon: { fontSize: 28, marginBottom: 6 },
    statVal: { fontSize: 26, fontWeight: '800' },
    statLabel: { color: '#aaa', fontSize: 11, marginTop: 2, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', paddingHorizontal: 20, marginBottom: 12 },
    actionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2e', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2a3e' },
    actionTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
    actionSub: { color: '#888', fontSize: 12 },
});
