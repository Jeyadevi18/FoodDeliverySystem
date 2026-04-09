import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function CustomerDashboard({ navigation }) {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/orders/my');
            const orders = res.data;
            setStats({
                total: orders.length,
                pending: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
                delivered: orders.filter(o => o.status === 'delivered').length,
            });
        } catch { }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
                    <Text style={styles.subGreeting}>What would you like today?</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                {[
                    { label: 'Total Orders', value: stats.total, icon: '📦', color: '#6C63FF' },
                    { label: 'Active', value: stats.pending, icon: '🔥', color: '#FF6B35' },
                    { label: 'Delivered', value: stats.delivered, icon: '✅', color: '#2ECC71' },
                ].map((s, i) => (
                    <View key={i} style={[styles.statCard, { borderColor: s.color }]}>
                        <Text style={styles.statIcon}>{s.icon}</Text>
                        <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {[
                    { label: 'Browse Menu', icon: '🍔', screen: 'Menu' },
                    { label: 'My Cart', icon: '🛒', screen: 'Cart' },
                    { label: 'Order History', icon: '📋', screen: 'Orders' },
                ].map((a, i) => (
                    <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
                        <Text style={styles.actionIcon}>{a.icon}</Text>
                        <Text style={styles.actionLabel}>{a.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
    greeting: { fontSize: 26, fontWeight: '800', color: '#fff' },
    subGreeting: { fontSize: 14, color: '#888', marginTop: 4 },
    logoutBtn: { backgroundColor: '#1e1e2e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    logoutText: { color: '#FF6B35', fontWeight: '600' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: '#1e1e2e', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
    statIcon: { fontSize: 22, marginBottom: 4 },
    statValue: { fontSize: 26, fontWeight: '800' },
    statLabel: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', paddingHorizontal: 20, marginBottom: 14 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
    actionCard: { backgroundColor: '#1e1e2e', borderRadius: 16, padding: 20, alignItems: 'center', width: '45%' },
    actionIcon: { fontSize: 36, marginBottom: 10 },
    actionLabel: { color: '#ccc', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
