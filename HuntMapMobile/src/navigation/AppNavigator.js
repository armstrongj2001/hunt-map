import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTheme } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PlayScreen from '../screens/PlayScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Tab icon using emoji — will swap for Lucide icons when we build Phase 2 screens
function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>;
}

export default function AppNavigator({ onLogout }) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons = { Home: '🧭', Create: '✚', Play: '🗺️', Profile: '👤' };
          return <TabIcon emoji={icons[route.name]} focused={focused} />;
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.tabBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
        },
        headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Discover' }} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Play" component={PlayScreen} options={{ title: 'My Hunts' }} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}
