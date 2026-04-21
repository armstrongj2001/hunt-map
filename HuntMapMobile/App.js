import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { isLoggedIn } from './src/api/auth';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true); // true while we check for a saved token

  useEffect(() => {
    // On app launch, check if there's already a saved login token
    isLoggedIn().then((result) => {
      setLoggedIn(result);
      setChecking(false);
    });
  }, []);

  // Show a blank screen while we check for a saved token
  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {loggedIn ? (
        <AppNavigator onLogout={() => setLoggedIn(false)} />
      ) : (
        <AuthNavigator onLoginSuccess={() => setLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
}
