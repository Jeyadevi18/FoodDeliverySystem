import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../api/client';
import { useNavigation } from '@react-navigation/native';

const STATUS_COLOR = {
    pending: '#F39C12', confirmed: '#3498DB', preparing: '#9B59B6',
    'out-for-delivery': '#FF6B35', delivered: '#2ECC71', cancelled: '#E74C3C',
};

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsub = navigation.addListener('focus', fetchOrders);
        return unsub;
    }, [navigation]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/orders/assigned');
            setOrders(res.data.filter(o => o.status !== 'delivered'));
        } catch {
            Alert.alert('Error', 'Could not load assigned orders');
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/api/orders/${id}/status`, { status });
            fetchOrders();
        } catch {
            Alert.alert('Error', 'Could not update status');
        }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚴 My Deliveries</Text>
            {orders.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 60 }}>✅</Text>
                    <Text style={{ color: '#888', fontSize: 18, marginTop: 12 }}>No pending deliveries</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={o => o._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                                <View style={[styles.badge, { borderColor: STATUS_COLOR[item.status] }]}>
                                    <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                                        {item.status?.replace(/-/g, ' ').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.meta}>📍 {item.address}</Text>
                            <Text style={styles.meta}>👤 {item.user?.name} • 📞 {item.user?.phone || 'N/A'}</Text>
                            <Text style={styles.meta}>₹{item.total} • {item.paymentMethod?.toUpperCase()}</Text>

                            {/* Action Buttons */}
                            <View style={styles.actions}>
                                {item.status !== 'out-for-delivery' && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#FF6B35' }]}
                                        onPress={() => {
                                            updateStatus(item._id, 'out-for-delivery');
                                            navigation.navigate('DeliveryTracking', { orderId: item._id });
                                        }}
                                    >
                                        <Text style={styles.actionBtnText}>🚴 Start Delivery + Share Location</Text>
                                    </TouchableOpacity>
                                )}
                                {item.status === 'out-for-delivery' && (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#6C63FF' }]}
                                            onPress={() => navigation.navigate('DeliveryTracking', { orderId: item._id })}
                                        >
                                            <Text style={styles.actionBtnText}>📍 Share Live Location</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#2ECC71' }]}
                                            onPress={() => updateStatus(item._id, 'delivered')}
                                        >
                                            <Text style={styles.actionBtnText}>✅ Mark Delivered</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 16 },
    card: { backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a3e' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderId: { color: '#fff', fontWeight: '700', fontSize: 15 },
    badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, backgroundColor: 'transparent' },
    badgeText: { fontSize: 10, fontWeight: '700' },
    meta: { color: '#aaa', fontSize: 13, marginBottom: 4 },
    actions: { gap: 8, marginTop: 12 },
    actionBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
