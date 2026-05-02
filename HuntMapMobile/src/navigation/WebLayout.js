import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import Sidebar from './Sidebar';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PlayScreen from '../screens/PlayScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HuntDetailScreen from '../screens/HuntDetailScreen';

const SCREENS = ['Discover', 'Create', 'Play', 'Profile'];

export default function WebLayout({ onLogout }) {
  const { colors } = useTheme();
  const [activeScreen, setActiveScreen] = useState('Discover');
  const [huntDetailId, setHuntDetailId] = useState(null);

  function navigate(screen, params) {
    if (screen === 'HuntDetail' && params?.huntId) {
      setHuntDetailId(params.huntId);
    } else {
      setHuntDetailId(null);
      setActiveScreen(screen);
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
          <>
            {/* All screens stay mounted — display:none hides inactive ones without unmounting.
                This keeps the Google Map initialized and chat history alive across navigation. */}
            <View style={[styles.screen, activeScreen !== 'Discover' && styles.hidden]}>
              <HomeScreen />
            </View>
            <View style={[styles.screen, activeScreen !== 'Create' && styles.hidden]}>
              <CreateScreen />
            </View>
            <View style={[styles.screen, activeScreen !== 'Play' && styles.hidden]}>
              <PlayScreen onNavigate={navigate} />
            </View>
            <View style={[styles.screen, activeScreen !== 'Profile' && styles.hidden]}>
              <ProfileScreen onLogout={onLogout} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', height: '100%' },
  content: { flex: 1, overflow: 'hidden' },
  screen: { flex: 1 },
  hidden: { display: 'none' },
});
