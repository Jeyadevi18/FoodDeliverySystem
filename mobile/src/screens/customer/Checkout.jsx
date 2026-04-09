import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Checkout({ route, navigation }) {
    const { cart = [], total = 0 } = route.params || {};
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const placeOrder = async () => {
        if (!address.trim()) {
            Alert.alert('Error', 'Please enter your delivery address');
            return;
        }
        setLoading(true);
        try {
            const items = cart.map(i => ({ food: i._id, quantity: i.qty, price: i.price }));
            await api.post('/api/orders', { items, total, address, paymentMethod });
            await AsyncStorage.removeItem('cart');
            Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully!', [
                { text: 'Track Order', onPress: () => navigation.navigate('Orders') },
            ]);
        } catch (err) {
            Alert.alert('Failed', err?.response?.data?.message || 'Could not place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Checkout 🧾</Text>

            {/* Order Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {cart.map(item => (
                    <View key={item._id} style={styles.orderItem}>
                        <Text style={styles.itemName}>{item.name} × {item.qty}</Text>
                        <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                    </View>
                ))}
                <View style={[styles.orderItem, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total}</Text>
                </View>
            </View>

            {/* Delivery Address */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address 📍</Text>
                <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your full delivery address..."
                    placeholderTextColor="#555"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method 💳</Text>
                {['cod', 'upi'].map(method => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.payOption, paymentMethod === method && styles.payOptionSelected]}
                        onPress={() => setPaymentMethod(method)}
                    >
                        <Text style={styles.payIcon}>{method === 'cod' ? '💵' : '📱'}</Text>
                        <Text style={[styles.payLabel, paymentMethod === method && { color: '#FF6B35' }]}>
                            {method === 'cod' ? 'Cash on Delivery' : 'UPI / GPay'}
                        </Text>
                        {paymentMethod === method && <Text style={{ marginLeft: 'auto', color: '#FF6B35' }}>✓</Text>}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeBtnText}>Place Order 🚀</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 20 },
    back: { marginBottom: 8 },
    backText: { color: '#FF6B35', fontSize: 16 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24 },
    section: { backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a3e' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
    orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    itemName: { color: '#ccc', fontSize: 14 },
    itemPrice: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10, marginTop: 4 },
    totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
    totalValue: { color: '#FF6B35', fontSize: 20, fontWeight: '800' },
    addressInput: { backgroundColor: '#0f0f1a', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' },
    payOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 8, gap: 12 },
    payOptionSelected: { borderColor: '#FF6B35', backgroundColor: '#2a1a0e' },
    payIcon: { fontSize: 22 },
    payLabel: { color: '#ccc', fontSize: 15, fontWeight: '600' },
    placeBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
    placeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
