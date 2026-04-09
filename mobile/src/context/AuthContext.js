import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Auth load error:', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const { token: t, user: u } = res.data;
        await AsyncStorage.setItem('token', t);
        await AsyncStorage.setItem('user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    };

    const register = async (name, email, password, role = 'customer') => {
        const res = await api.post('/api/auth/register', { name, email, password, role });
        const { token: t, user: u } = res.data;
        await AsyncStorage.setItem('token', t);
        await AsyncStorage.setItem('user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
