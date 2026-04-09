import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';

const STATUS_COLOR = {
    pending: '#F39C12', confirmed: '#3498DB', preparing: '#9B59B6',
    'out-for-delivery': '#FF6B35', delivered: '#2ECC71', cancelled: '#E74C3C',
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchOrders);
        return unsubscribe;
    }, [navigation]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/orders/my');
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch { }
        setLoading(false);
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    if (orders.length === 0) return (
        <View style={styles.empty}>
            <Text style={{ fontSize: 60 }}>📦</Text>
            <Text style={{ color: '#888', fontSize: 18, marginTop: 12 }}>No orders yet</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📦 My Orders</Text>
            <FlatList
                data={orders}
                keyExtractor={o => o._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '33', borderColor: STATUS_COLOR[item.status] }]}>
                                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                                    {item.status?.replace(/-/g, ' ').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.meta}>🛒 {item.items?.length} item(s)  •  ₹{item.total}</Text>
                        <Text style={styles.meta}>📍 {item.address}</Text>
                        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                        {item.status === 'out-for-delivery' && (
                            <TouchableOpacity
                                style={styles.trackBtn}
                                onPress={() => navigation.navigate('Tracking', { orderId: item._id })}
                            >
                                <Text style={styles.trackBtnText}>📍 Track Live Location</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 16 },
    card: { backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a3e' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { color: '#fff', fontWeight: '700', fontSize: 15 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: '700' },
    meta: { color: '#aaa', fontSize: 13, marginBottom: 4 },
    date: { color: '#666', fontSize: 12, marginTop: 4 },
    trackBtn: { marginTop: 12, backgroundColor: '#FF6B35', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
