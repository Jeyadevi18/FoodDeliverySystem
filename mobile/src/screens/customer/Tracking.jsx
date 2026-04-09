import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { io } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import api from '../../api/client';
import { BASE_URL } from '../../api/client';

const { width, height } = Dimensions.get('window');

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function CustomerTracking({ route, navigation }) {
    const { orderId } = route.params;
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [order, setOrder] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const [arrived, setArrived] = useState(false);
    const socketRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        fetchOrder();
        setupNotifications();
        connectSocket();
        return () => socketRef.current?.disconnect();
    }, []);

    const setupNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') console.log('Notification permission denied');
    };

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/api/orders/${orderId}`);
            setOrder(res.data);
            if (res.data.deliveryLocation) {
                const loc = res.data.deliveryLocation;
                setDeliveryLocation({ latitude: loc.lat, longitude: loc.lng });
            }
        } catch { }
    };

    const connectSocket = () => {
        const socket = io(BASE_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_order_room', orderId);
            console.log('Connected to tracking socket, room:', orderId);
        });

        socket.on('location_update', (data) => {
            const newLoc = { latitude: data.lat, longitude: data.lng };
            setDeliveryLocation(newLoc);
            setLocationHistory(prev => [...prev, newLoc]);
            // Animate map to new location
            mapRef.current?.animateToRegion({
                ...newLoc,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 800);
        });

        socket.on('delivery_arrived', async () => {
            setArrived(true);
            // Send local push notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🎉 Your food has arrived!',
                    body: 'Your delivery person is at your door. Enjoy your meal!',
                    sound: true,
                },
                trigger: null, // immediately
            });
            Alert.alert('🎉 Delivery Arrived!', 'Your food has been delivered!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        });
    };

    const region = deliveryLocation
        ? { ...deliveryLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
        : { latitude: 11.0168, longitude: 76.9558, latitudeDelta: 0.05, longitudeDelta: 0.05 }; // Default: Coimbatore

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📍 Live Tracking</Text>
                <View style={[styles.liveDot, arrived && { backgroundColor: '#2ECC71' }]} />
            </View>

            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                showsUserLocation
                showsMyLocationButton
            >
                {deliveryLocation && (
                    <Marker coordinate={deliveryLocation} title="Delivery Agent" description="Your delivery is on the way!">
                        <View style={styles.markerContainer}>
                            <Text style={styles.markerEmoji}>🚴</Text>
                        </View>
                    </Marker>
                )}
                {locationHistory.length > 1 && (
                    <Polyline
                        coordinates={locationHistory}
                        strokeColor="#FF6B35"
                        strokeWidth={3}
                    />
                )}
            </MapView>

            {/* Info Panel */}
            <View style={styles.infoPanel}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order ID</Text>
                    <Text style={styles.infoValue}>#{orderId?.slice(-6).toUpperCase()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {arrived ? '✅ Delivered' : '🚴 On the way'}
                        </Text>
                    </View>
                </View>
                {order?.deliveryAgent && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Delivery Agent</Text>
                        <Text style={styles.infoValue}>{order.deliveryAgent?.name || 'Assigned'}</Text>
                    </View>
                )}
                <Text style={styles.refreshNote}>📡 Location updates every minute automatically</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a' },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 55, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#1a1a2e', gap: 12 },
    back: { color: '#FF6B35', fontSize: 16 },
    title: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
    liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B35' },
    map: { width, height: height * 0.5 },
    markerContainer: { backgroundColor: '#FF6B35', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#fff' },
    markerEmoji: { fontSize: 20 },
    infoPanel: { flex: 1, backgroundColor: '#1e1e2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, marginTop: -16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a3e' },
    infoLabel: { color: '#888', fontSize: 14 },
    infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
    statusBadge: { backgroundColor: '#FF6B3533', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#FF6B35' },
    statusText: { color: '#FF6B35', fontWeight: '700', fontSize: 13 },
    refreshNote: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
