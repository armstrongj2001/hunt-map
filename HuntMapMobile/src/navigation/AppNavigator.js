import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PlayScreen from '../screens/PlayScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Simple text emoji icons — we'll swap these for proper icons in Phase 2
function TabIcon({ label }) {
  const icons = { Home: '🗺️', Create: '✏️', Play: '🎯', Profile: '👤' };
  return <Text style={{ fontSize: 20 }}>{icons[label]}</Text>;
}

export default function AppNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <TabIcon label={route.name} />,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}
