import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Login({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (err) {
            Alert.alert('Login Failed', err?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.emoji}>👋</Text>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        placeholderTextColor="#555"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#555"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={{ color: '#FF6B35' }}>Register</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#0f0f1a', padding: 24, justifyContent: 'center' },
    back: { position: 'absolute', top: 50, left: 24 },
    backText: { color: '#FF6B35', fontSize: 16 },
    emoji: { fontSize: 60, textAlign: 'center', marginTop: 60, marginBottom: 12 },
    title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 32 },
    form: { gap: 8, marginBottom: 24 },
    label: { color: '#ccc', fontSize: 14, marginBottom: 4, fontWeight: '600' },
    input: { backgroundColor: '#1e1e2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
    btn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    link: { alignItems: 'center' },
    linkText: { color: '#888', fontSize: 14 },
});
