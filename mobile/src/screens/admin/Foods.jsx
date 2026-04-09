import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../api/client';

export default function AdminFoods() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', category: '', description: '' });

    useEffect(() => { fetchFoods(); }, []);

    const fetchFoods = async () => {
        setLoading(true);
        try { const res = await api.get('/api/foods'); setFoods(res.data); } catch { }
        setLoading(false);
    };

    const openAdd = () => { setEditing(null); setForm({ name: '', price: '', category: '', description: '' }); setModalVisible(true); };
    const openEdit = (food) => { setEditing(food); setForm({ name: food.name, price: String(food.price), category: food.category || '', description: food.description || '' }); setModalVisible(true); };

    const save = async () => {
        if (!form.name || !form.price) { Alert.alert('Error', 'Name and price are required'); return; }
        try {
            if (editing) await api.put(`/api/foods/${editing._id}`, { ...form, price: Number(form.price) });
            else await api.post('/api/foods', { ...form, price: Number(form.price) });
            setModalVisible(false); fetchFoods();
        } catch { Alert.alert('Error', 'Failed to save food'); }
    };

    const deleteFood = (id) => {
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/api/foods/${id}`); fetchFoods(); } catch { } } },
        ]);
    };

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' }}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍽️ Foods</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                    <Text style={styles.addBtnText}>+ Add Food</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={foods}
                keyExtractor={f => f._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.emoji}>{item.emoji || '🍽️'}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.meta}>{item.category} • ₹{item.price}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteFood(item._id)}><Text style={styles.deleteText}>🗑</Text></TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{editing ? 'Edit Food' : 'Add New Food'}</Text>
                        {[['name', 'Food Name'], ['price', 'Price (₹)', 'numeric'], ['category', 'Category'], ['description', 'Description']].map(([key, label, kbType]) => (
                            <TextInput key={key} style={styles.input} placeholder={label} placeholderTextColor="#555" value={form[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))} keyboardType={kbType || 'default'} />
                        ))}
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#fff' },
    addBtn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '700' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#2a2a3e' },
    emoji: { fontSize: 32 },
    name: { color: '#fff', fontWeight: '700', fontSize: 15 },
    meta: { color: '#888', fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8 },
    editBtn: { backgroundColor: '#6C63FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    editText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    deleteBtn: { backgroundColor: '#E74C3C33', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    deleteText: { fontSize: 14 },
    overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#1e1e2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    input: { backgroundColor: '#0f0f1a', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 10 },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
    cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#555' },
    cancelText: { color: '#aaa', fontWeight: '600' },
    saveBtn: { flex: 1, backgroundColor: '#FF6B35', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '700' },
});
