import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from './src/theme';
import { isLoggedIn } from './src/api/auth';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import LandingPage from './src/screens/LandingPage';

function Root() {
  const { colors, isDark } = useTheme();
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(Platform.OS === 'web');

  useEffect(() => {
    isLoggedIn().then((result) => {
      setLoggedIn(result);
      // If already logged in, skip landing page
      if (result) setShowLanding(false);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.cta} />
      </View>
    );
  }

  // Web landing page for non-logged-in visitors
  if (showLanding && !loggedIn) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        onLogin={() => setShowLanding(false)}
      />
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {loggedIn ? (
        <AppNavigator onLogout={() => { setLoggedIn(false); setShowLanding(Platform.OS === 'web'); }} />
      ) : (
        <AuthNavigator onLoginSuccess={() => setLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E8734A" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
