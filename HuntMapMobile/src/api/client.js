import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's local IP when testing on a physical device.
// 10.0.2.2 is the Android emulator's alias for localhost.
// For Expo Go on a real phone, use your machine's IP: e.g. 'http://192.168.1.X:8000'
const BASE_URL = 'http://10.0.2.2:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Before every request, attach the JWT token from storage (if we have one)
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
