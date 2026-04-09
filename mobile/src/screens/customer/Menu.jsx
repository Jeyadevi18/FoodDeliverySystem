import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Menu() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState({});

    useEffect(() => {
        fetchFoods();
        loadCart();
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await api.get('/api/foods');
            setFoods(res.data);
        } catch {
            Alert.alert('Error', 'Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const loadCart = async () => {
        try {
            const stored = await AsyncStorage.getItem('cart');
            if (stored) setCart(JSON.parse(stored));
        } catch { }
    };

    const saveCart = async (newCart) => {
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
        setCart(newCart);
    };

    const addToCart = (food) => {
        const updated = { ...cart, [food._id]: { ...food, qty: (cart[food._id]?.qty || 0) + 1 } };
        saveCart(updated);
    };

    const removeFromCart = (foodId) => {
        const updated = { ...cart };
        if (updated[foodId]?.qty > 1) updated[foodId].qty--;
        else delete updated[foodId];
        saveCart(updated);
    };

    const filtered = foods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.category?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => {
        const qty = cart[item._id]?.qty || 0;
        return (
            <View style={styles.card}>
                <View style={styles.cardInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodCategory}>{item.category}</Text>
                    <Text style={styles.foodPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.cardActions}>
                    <Text style={styles.foodImage}>{item.emoji || '🍽️'}</Text>
                    {qty === 0 ? (
                        <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                            <Text style={styles.addBtnText}>Add +</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.qtyRow}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item._id)}>
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qty}>{qty}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#FF6B35" size="large" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍔 Menu</Text>
                <TextInput
                    style={styles.search}
                    placeholder="Search food..."
                    placeholderTextColor="#555"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <FlatList
                data={filtered}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
    header: { paddingHorizontal: 20, marginBottom: 12 },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 12 },
    search: { backgroundColor: '#1e1e2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333' },
    card: { flexDirection: 'row', backgroundColor: '#1e1e2e', marginHorizontal: 16, marginVertical: 6, borderRadius: 14, padding: 14, justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e' },
    cardInfo: { flex: 1 },
    foodName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
    foodCategory: { fontSize: 12, color: '#888', marginBottom: 8 },
    foodPrice: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
    cardActions: { alignItems: 'center', gap: 8 },
    foodImage: { fontSize: 36 },
    addBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { backgroundColor: '#FF6B35', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    qty: { color: '#fff', fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
});
