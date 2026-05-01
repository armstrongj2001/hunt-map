import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import Sidebar from './Sidebar';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PlayScreen from '../screens/PlayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HuntDetailScreen from '../screens/HuntDetailScreen';

export default function WebLayout({ onLogout }) {
  const { colors } = useTheme();
  const [activeScreen, setActiveScreen] = useState('Discover');
  const [huntDetailId, setHuntDetailId] = useState(null); // non-null = show detail overlay

  function navigate(screen, params) {
    if (screen === 'HuntDetail' && params?.huntId) {
      setHuntDetailId(params.huntId);
    } else {
      setHuntDetailId(null);
      setActiveScreen(screen);
    }
  }

  function renderScreen() {
    switch (activeScreen) {
      case 'Discover': return <HomeScreen />;
      case 'Create':   return <CreateScreen />;
      case 'Play':     return <PlayScreen onNavigate={navigate} />;
      case 'Profile':  return <ProfileScreen onLogout={onLogout} />;
      default:         return <HomeScreen />;
    }
  }

  return (
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <Sidebar activeScreen={activeScreen} onNavigate={(s) => navigate(s)} />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {huntDetailId ? (
          <HuntDetailScreen
            huntId={huntDetailId}
            onBack={() => setHuntDetailId(null)}
            onDeleted={() => { setHuntDetailId(null); setActiveScreen('Play'); }}
          />
        ) : (
          renderScreen()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', height: '100%' },
  content: { flex: 1, overflow: 'hidden' },
});
