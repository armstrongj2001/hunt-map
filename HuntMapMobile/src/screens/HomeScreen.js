import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import HuntMap from '../components/HuntMap';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    // Geolocation works on web too, but with a browser permission prompt
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Location required',
          'HuntMap needs your location to show nearby hunts and checkpoints.'
        );
      }
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(loc.coords);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HuntMap location={location} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
});
