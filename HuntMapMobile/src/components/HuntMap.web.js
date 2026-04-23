// Web version — react-native-maps doesn't run in the browser,
// so we show a simple placeholder for now. We'll swap in a real
// web map (Leaflet or Google Maps JS) in Phase 2.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HuntMap({ location }) {
  const lat = location?.latitude?.toFixed(5) ?? '—';
  const lng = location?.longitude?.toFixed(5) ?? '—';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>
        {location
          ? `Your location: ${lat}, ${lng}`
          : 'Location not available in browser'}
      </Text>
      <Text style={styles.note}>
        Interactive map coming in Phase 2.{'\n'}
        Use the mobile app for GPS features.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24, textAlign: 'center' },
  note: { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20 },
});
