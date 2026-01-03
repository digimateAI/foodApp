import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

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
