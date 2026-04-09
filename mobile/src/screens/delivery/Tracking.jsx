import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import api from '../../api/client';
import { BASE_URL } from '../../api/client';

export default function DeliveryTracking({ route, navigation }) {
    const { orderId } = route.params;
    const [currentLocation, setCurrentLocation] = useState(null);
    const [broadcasting, setBroadcasting] = useState(false);
    const [updateCount, setUpdateCount] = useState(0);
    const socketRef = useRef(null);
    const intervalRef = useRef(null);
    const locationSub = useRef(null);

    useEffect(() => {
        setupSocketAndLocation();
        return cleanup;
    }, []);

    const setupSocketAndLocation = async () => {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is required to share your location with the customer.');
            navigation.goBack();
            return;
        }

        // Connect socket
        const socket = io(BASE_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_order_room', orderId);
            console.log('Delivery socket connected, room:', orderId);
        });

        // Get initial location
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCurrentLocation(loc.coords);
        broadcastLocation(socket, loc.coords);
        setBroadcasting(true);

        // Broadcast every 60 seconds
        intervalRef.current = setInterval(async () => {
            try {
                const newLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setCurrentLocation(newLoc.coords);
                broadcastLocation(socket, newLoc.coords);
                setUpdateCount(c => c + 1);
            } catch { }
        }, 60000);
    };

    const broadcastLocation = async (socket, coords) => {
        const { latitude: lat, longitude: lng } = coords;
        // Emit via socket for real-time
        socket?.emit('location_update', { orderId, lat, lng });
        // Also save to DB as backup
        try {
            await api.post(`/api/orders/${orderId}/location`, { lat, lng });
        } catch { }
    };

    const markArrived = async () => {
        Alert.alert('Confirm Arrival', 'Mark yourself as arrived at the customer location?', [
            { text: 'Cancel' },
            {
                text: 'Yes, Arrived!',
                onPress: async () => {
                    socketRef.current?.emit('delivery_arrived', { orderId });
                    try {
                        await api.put(`/api/orders/${orderId}/status`, { status: 'delivered' });
                    } catch { }
                    cleanup();
                    Alert.alert('✅ Done!', 'Order marked as delivered!', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                },
            },
        ]);
    };

    const cleanup = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (locationSub.current) locationSub.current.remove();
        socketRef.current?.disconnect();
        setBroadcasting(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>📡 Location Sharing</Text>
            <Text style={styles.subtitle}>Order #{orderId?.slice(-6).toUpperCase()}</Text>

            {/* Status */}
            <View style={styles.statusCard}>
                <View style={[styles.pulsingDot, broadcasting && styles.active]} />
                <View>
                    <Text style={styles.statusTitle}>{broadcasting ? 'Broadcasting Live' : 'Not Broadcasting'}</Text>
                    <Text style={styles.statusSub}>
                        {broadcasting ? 'Customer can see your location' : 'Start sharing your location'}
                    </Text>
                </View>
            </View>

            {/* Location Info */}
            {currentLocation && (
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>📍 Current Coordinates</Text>
                    <Text style={styles.coords}>
                        Lat: {currentLocation.latitude?.toFixed(6)}{'\n'}
                        Lng: {currentLocation.longitude?.toFixed(6)}
                    </Text>
                    <Text style={styles.updateCount}>📡 Updates sent: {updateCount}</Text>
                    <Text style={styles.interval}>⏱ Next update in ~1 minute</Text>
                </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>
                    🗺️ Your location is shared with the customer in real-time via the app.{'\n\n'}
                    📱 The customer sees your live position on their map and will be notified when you arrive.
                </Text>
            </View>

            {/* Arrived Button */}
            <TouchableOpacity style={styles.arrivedBtn} onPress={markArrived}>
                <Text style={styles.arrivedBtnText}>🎉 I've Arrived — Notify Customer</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 55, paddingHorizontal: 20 },
    back: { marginBottom: 8 },
    backText: { color: '#FF6B35', fontSize: 16 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
    subtitle: { color: '#888', fontSize: 15, marginBottom: 24 },
    statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, gap: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a3e' },
    pulsingDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#555' },
    active: { backgroundColor: '#FF6B35' },
    statusTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
    statusSub: { color: '#888', fontSize: 13, marginTop: 2 },
    infoCard: { backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a3e' },
    infoTitle: { color: '#FF6B35', fontWeight: '700', marginBottom: 8 },
    coords: { color: '#ccc', fontSize: 13, lineHeight: 22, marginBottom: 8 },
    updateCount: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
    interval: { color: '#888', fontSize: 12, marginTop: 4 },
    infoBox: { backgroundColor: '#0a1628', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1a3a5e', marginBottom: 24 },
    infoBoxText: { color: '#7aa3cc', fontSize: 13, lineHeight: 22 },
    arrivedBtn: { backgroundColor: '#2ECC71', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    arrivedBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
