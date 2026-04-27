import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web browser can reach Django directly via localhost.
// iPhone (Expo Go) needs your machine's actual local network IP.
// Find your IP with: ip addr show eth0 | grep inet
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://100.113.3.1:8000'; // Tailscale IP — stable across reboots

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
