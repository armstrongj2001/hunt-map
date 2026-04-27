import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { login } from '../api/auth';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      onLoginSuccess();
    } catch {
      Alert.alert('Login failed', 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoRow}>
          <Text style={s.logoIcon}>🧭</Text>
          <Text style={s.logoText}>HuntMap</Text>
        </View>
        <Text style={s.tagline}>Turn any place into an adventure</Text>

        {/* Form card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>

          <Text style={s.label}>Username</Text>
          <TextInput
            style={s.input}
            placeholder="Enter your username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={s.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryButtonText}>Log In</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={s.switchText}>
            Don't have an account? <Text style={s.switchLink}>Sign up free</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
    logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    logoIcon: { fontSize: 36, marginRight: spacing.sm },
    logoText: { fontSize: fontSize.hero, fontFamily: 'Inter_700Bold', color: colors.primary },
    tagline: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
    cardTitle: { fontSize: fontSize.section, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.lg },
    label: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: colors.background, color: colors.textPrimary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.md, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', borderWidth: 1, borderColor: colors.border },
    primaryButton: { backgroundColor: colors.cta, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center', marginTop: spacing.sm },
    primaryButtonText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
    switchText: { textAlign: 'center', color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: fontSize.caption },
    switchLink: { color: colors.cta, fontFamily: 'Inter_600SemiBold' },
  });
}
