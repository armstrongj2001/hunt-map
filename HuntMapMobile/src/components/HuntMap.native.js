// Mobile version — uses the full native Google Maps component
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export default function HuntMap({ location }) {
  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        // Default to Denver
        latitude: 39.7392,
        longitude: -104.9903,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <MapView style={styles.map} region={region} showsUserLocation>
      {location && (
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You are here"
          pinColor="#f97316"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
