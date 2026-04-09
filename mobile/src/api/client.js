import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Change this to your computer's local IP when testing on a real device
// Use http://10.0.2.2:5000 for Android Emulator
// Use http://<YOUR_IP>:5000 for real device (e.g. http://192.168.1.10:5000)
export const BASE_URL = 'http://10.0.2.2:5000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
