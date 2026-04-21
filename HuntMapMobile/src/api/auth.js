import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './client';

// Register a new account
export async function register(username, email, password) {
  const response = await client.post('/api/auth/register/', { username, email, password });
  return response.data;
}

// Log in and save the JWT tokens to local storage
export async function login(username, password) {
  const response = await client.post('/api/auth/login/', { username, password });
  const { access, refresh } = response.data;
  await AsyncStorage.setItem('access_token', access);
  await AsyncStorage.setItem('refresh_token', refresh);
  return response.data;
}

// Clear tokens from storage (logs the user out locally)
export async function logout() {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
}

// Check if a token exists (used to decide if user is already logged in)
export async function isLoggedIn() {
  const token = await AsyncStorage.getItem('access_token');
  return !!token;
}
