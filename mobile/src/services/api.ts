import axios from 'axios';
import { Platform } from 'react-native';

// 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// BUT for physical devices, you need your computer's LAN IP
// Current LAN IP: 192.168.29.233
const BASE_URL = 'http://192.168.29.233:3000'; // Hardcoded for physical device testing

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
    // In a real app, we would get the token from AsyncStorage here
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});

export default api;
