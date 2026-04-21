import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Phase 2: Hunt creation wizard goes here
export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Hunt</Text>
      <Text style={styles.subtitle}>Coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
