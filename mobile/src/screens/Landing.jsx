import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Landing({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.hero}>
                <Text style={styles.emoji}>🍔</Text>
                <Text style={styles.brand}>QuickBite</Text>
                <Text style={styles.tagline}>Delicious food{'\n'}delivered fast</Text>
            </View>

            <View style={styles.features}>
                {[
                    { icon: '🚀', text: 'Fast Delivery' },
                    { icon: '📍', text: 'Live Tracking' },
                    { icon: '💳', text: 'Easy Payment' },
                ].map((f, i) => (
                    <View key={i} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>{f.icon}</Text>
                        <Text style={styles.featureText}>{f.text}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.primaryBtnText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.secondaryBtnText}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 24 },
    hero: { alignItems: 'center', marginTop: 40 },
    emoji: { fontSize: 80, marginBottom: 16 },
    brand: { fontSize: 42, fontWeight: '800', color: '#FF6B35', letterSpacing: 1 },
    tagline: { fontSize: 22, color: '#ffffff', textAlign: 'center', marginTop: 12, lineHeight: 32, fontWeight: '300' },
    features: { flexDirection: 'row', gap: 24 },
    featureItem: { alignItems: 'center', backgroundColor: '#1e1e2e', borderRadius: 16, padding: 16, width: 90 },
    featureIcon: { fontSize: 28, marginBottom: 8 },
    featureText: { color: '#ccc', fontSize: 11, textAlign: 'center' },
    buttons: { width: '100%', gap: 12 },
    primaryBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    secondaryBtn: { borderWidth: 2, borderColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    secondaryBtnText: { color: '#FF6B35', fontSize: 18, fontWeight: '700' },
});
