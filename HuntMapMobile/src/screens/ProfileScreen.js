import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../api/client';
import { logout } from '../api/auth';

export default function ProfileScreen({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await client.get('/api/users/me/');
      setProfile(response.data);
    } catch (error) {
      console.log('Could not load profile', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    onLogout(); // tells the navigator to switch back to auth screens
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile?.display_name || profile?.username}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.joined}>
        Joined {new Date(profile?.date_joined).toLocaleDateString()}
      </Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 4,
  },
  joined: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 48,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
