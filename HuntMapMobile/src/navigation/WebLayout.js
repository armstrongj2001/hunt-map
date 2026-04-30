import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import Sidebar from './Sidebar';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PlayScreen from '../screens/PlayScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Maps screen keys to their components
function ActiveScreen({ screen, onLogout }) {
  switch (screen) {
    case 'Discover': return <HomeScreen />;
    case 'Create':   return <CreateScreen />;
    case 'Play':     return <PlayScreen />;
    case 'Profile':  return <ProfileScreen onLogout={onLogout} />;
    default:         return <HomeScreen />;
  }
}

export default function WebLayout({ onLogout }) {
  const { colors } = useTheme();
  const [activeScreen, setActiveScreen] = useState('Discover');

  return (
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <ActiveScreen screen={activeScreen} onLogout={onLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
