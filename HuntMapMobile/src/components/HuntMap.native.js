import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MAP_TYPES = [
  { key: 'standard',  label: 'Default'   },
  { key: 'satellite', label: 'Satellite' },
  { key: 'terrain',   label: 'Terrain'   },
];

export default function HuntMap({ location }) {
  const [mapType, setMapType] = useState('standard');

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 39.7392, longitude: -104.9903, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation mapType={mapType}>
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="You are here"
            pinColor="#E8734A"
          />
        )}
      </MapView>

      {/* Floating toggle — top-right corner */}
      <View style={styles.toggle}>
        {MAP_TYPES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.toggleBtn, mapType === key && styles.toggleBtnActive]}
            onPress={() => setMapType(key)}
          >
            <Text style={[styles.toggleText, mapType === key && styles.toggleTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  toggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toggleBtnActive: {
    backgroundColor: '#1A3C34',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#5F5E5A',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});
