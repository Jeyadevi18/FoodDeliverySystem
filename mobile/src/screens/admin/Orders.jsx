import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import api from '../../api/client';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    const STATUS_COLOR = { pending: '#F39C12', confirmed: '#3498DB', preparing: '#9B59B6', 'out-for-delivery': '#FF6B35', delivered: '#2ECC71', cancelled: '#E74C3C' };

    useEffect(() => { fetchOrders(); fetchAgents(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/orders');
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch { }
        setLoading(false);
    };

    const fetchAgents = async () => {
        try {
            const res = await api.get('/api/auth/users');
            setAgents(res.data.filter(u => u.role === 'delivery'));
        } catch { }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/api/orders/${id}/status`, { status });
            fetchOrders();
        } catch { Alert.alert('Error', 'Failed to update status'); }
    };

    const assignAgent = async (orderId, agentId) => {
        try {
            await api.put(`/api/orders/${orderId}/assign`, { deliveryAgent: agentId });
            fetchOrders();
            setModalVisible(false);
        } catch { Alert.alert('Error', 'Failed to assign agent'); }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 All Orders</Text>
            <FlatList
                data={orders}
                keyExtractor={o => o._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
                            <View style={[styles.badge, { borderColor: STATUS_COLOR[item.status] }]}>
                                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status?.toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={styles.meta}>👤 {item.user?.name} • ₹{item.total}</Text>
                        <Text style={styles.meta}>📍 {item.address}</Text>
                        <Text style={styles.meta}>🚴 Agent: {item.deliveryAgent?.name || 'Not assigned'}</Text>

                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.assignBtn} onPress={() => { setSelectedOrder(item); setModalVisible(true); }}>
                                <Text style={styles.btnText}>Assign Agent</Text>
                            </TouchableOpacity>
                            {STATUS_OPTIONS.filter(s => s !== item.status).slice(0, 2).map(s => (
                                <TouchableOpacity key={s} style={[styles.statusBtn, { borderColor: STATUS_COLOR[s] }]} onPress={() => updateStatus(item._id, s)}>
                                    <Text style={[styles.statusBtnText, { color: STATUS_COLOR[s] }]}>{s.replace(/-/g, ' ')}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            />

            {/* Assign Agent Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Assign Delivery Agent</Text>
                        {agents.map(a => (
                            <TouchableOpacity key={a._id} style={styles.agentItem} onPress={() => assignAgent(selectedOrder?._id, a._id)}>
                                <Text style={styles.agentName}>{a.name}</Text>
                                <Text style={styles.agentEmail}>{a.email}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
    card: { backgroundColor: '#1e1e2e', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a3e' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { color: '#fff', fontWeight: '700', fontSize: 14 },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    meta: { color: '#aaa', fontSize: 12, marginBottom: 3 },
    btnRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    assignBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    statusBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
    statusBtnText: { fontSize: 11, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#1e1e2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    agentItem: { padding: 14, borderRadius: 12, backgroundColor: '#2a2a3e', marginBottom: 8 },
    agentName: { color: '#fff', fontWeight: '700' },
    agentEmail: { color: '#888', fontSize: 12 },
    cancelBtn: { marginTop: 8, alignItems: 'center' },
    cancelText: { color: '#FF4444', fontSize: 16, fontWeight: '600' },
});
