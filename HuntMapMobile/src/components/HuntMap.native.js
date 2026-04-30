import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MAP_TYPES = [
  { key: 'standard',  label: 'Default'   },
  { key: 'satellite', label: 'Satellite' },
  { key: 'terrain',   label: 'Terrain'   },
];

const DEFAULT_REGION = {
  latitude: 39.7392,
  longitude: -104.9903,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function HuntMap({
  location,
  markers = [],
  droppedPins = [],
  onMapPress,
  onPinDrop,
  onPinRemove,
  showPinDrop = false,
}) {
  const [mapType, setMapType] = useState('standard');
  const mapRef = useRef(null);

  // Fly to location when GPS or search result changes
  useEffect(() => {
    if (!mapRef.current || !location) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 600);
  }, [location?.latitude, location?.longitude]);

  async function handleMapPress(e) {
    if (!showPinDrop || !onPinDrop) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onPinDrop({ latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
  }

  const initialRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        onPress={showPinDrop ? handleMapPress : undefined}
      >
        {/* Read-only markers */}
        {markers.map((m, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title || `Checkpoint ${i + 1}`}
          />
        ))}

        {/* Draggable checkpoint pins */}
        {droppedPins.map((pin, i) => (
          <Marker
            key={`pin-${i}`}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={`Checkpoint ${i + 1}`}
            description={pin.address}
            draggable
            pinColor="#E8734A"
            onDragEnd={(e) => {
              if (!onPinDrop) return;
              const { latitude, longitude } = e.nativeEvent.coordinate;
              onPinDrop({ latitude, longitude, address: pin.address }, i);
            }}
          />
        ))}
      </MapView>

      {/* Map type toggle — top-right */}
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
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  toggleBtnActive: { backgroundColor: '#1A3C34' },
  toggleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#5F5E5A' },
  toggleTextActive: { color: '#FFFFFF' },
});
