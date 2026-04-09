import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Cart() {
    const [cart, setCart] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadCart);
        return unsubscribe;
    }, [navigation]);

    const loadCart = async () => {
        try {
            const stored = await AsyncStorage.getItem('cart');
            if (stored) setCart(JSON.parse(stored));
            else setCart({});
        } catch { }
    };

    const saveCart = async (newCart) => {
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
        setCart(newCart);
    };

    const changeQty = (id, delta) => {
        const updated = { ...cart };
        if (updated[id]) {
            updated[id].qty += delta;
            if (updated[id].qty <= 0) delete updated[id];
        }
        saveCart(updated);
    };

    const clearCart = () => {
        Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => saveCart({}) },
        ]);
    };

    const items = Object.values(cart);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Menu')}>
                    <Text style={styles.shopBtnText}>Browse Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛒 Cart</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price} × {item.qty} = ₹{item.price * item.qty}</Text>
                        </View>
                        <View style={styles.qtyRow}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item._id, -1)}>
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qty}>{item.qty}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item._id, 1)}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 160 }}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => navigation.navigate('Checkout', { cart: items, total })}
                >
                    <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55 },
    empty: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyIcon: { fontSize: 64 },
    emptyText: { color: '#888', fontSize: 18 },
    shopBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: '#fff' },
    clearText: { color: '#FF4444', fontWeight: '600' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', marginHorizontal: 16, marginVertical: 6, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2a2a3e' },
    name: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
    price: { fontSize: 13, color: '#aaa' },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { backgroundColor: '#FF6B35', width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    qty: { color: '#fff', fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a2e', padding: 20, borderTopWidth: 1, borderTopColor: '#2a2a3e' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    totalLabel: { color: '#aaa', fontSize: 16 },
    totalValue: { color: '#FF6B35', fontSize: 22, fontWeight: '800' },
    checkoutBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    checkoutText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
