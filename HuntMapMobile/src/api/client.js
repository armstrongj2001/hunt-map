import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://100.113.3.1:8000'; // Tailscale IP — stable across reboots

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: try to refresh the access token once, then retry the original request.
// If refresh fails, clear tokens so the app falls back to the login screen.
let isRefreshing = false;
let refreshQueue = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only attempt refresh on 401s that haven't already been retried
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }
    original._retried = true;

    if (isRefreshing) {
      // Another request already triggered a refresh — queue this one
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      });
    }

    isRefreshing = true;
    try {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh });
      const newAccess = data.access;
      await AsyncStorage.setItem('access_token', newAccess);

      // Unblock any queued requests
      refreshQueue.forEach(({ resolve }) => resolve(newAccess));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    } catch {
      // Refresh failed — wipe tokens so AuthNavigator redirects to login
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      refreshQueue.forEach(({ reject }) => reject(error));
      refreshQueue = [];
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
