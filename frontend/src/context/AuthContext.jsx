import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on reload
    useEffect(() => {
        const token = localStorage.getItem('fds_token');
        const storedUser = localStorage.getItem('fds_user');
        if (token && storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { }
        }
        setLoading(false);
    }, []);

    // Email/password login
    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('fds_token', data.token);
        localStorage.setItem('fds_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    // Manual register
    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('fds_token', data.token);
        localStorage.setItem('fds_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    // Called after Google OAuth completes
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('fds_user', JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem('fds_token');
        localStorage.removeItem('fds_user');
        setUser(null);
        // Revoke Google session too (if any)
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
