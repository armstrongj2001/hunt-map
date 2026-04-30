import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { login } from '../api/auth';

// Social provider configs — buttons are UI-ready, backends wired in Phase 4-5
const SOCIAL_PROVIDERS = [
  { key: 'google', label: 'G',  color: '#EA4335', border: '#DADCE0' },
  { key: 'apple',  label: '🍎', color: '#000000', border: '#D1D1D6' },
  { key: 'github', label: '🐙', color: '#24292F', border: '#D0D7DE' },
];

function SocialButton({ provider }) {
  function handlePress() {
    Alert.alert('Coming Soon', `${provider.key.charAt(0).toUpperCase() + provider.key.slice(1)} login will be available soon.`);
  }

  return (
    <TouchableOpacity style={[styles.socialBtn, { borderColor: provider.border }]} onPress={handlePress}>
      <Text style={[styles.socialIcon, { color: provider.color }]}>{provider.label}</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or continue with</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

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

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo — white text on dark background */}
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>🧭</Text>
          <Text style={styles.logoText}>HuntMap</Text>
        </View>
        <Text style={styles.tagline}>Turn any place into an adventure</Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor={palette.stone}
            autoCapitalize="none"
            returnKeyType="next"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={palette.stone}
            secureTextEntry
            returnKeyType="go"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}  // ← Enter key submits the form
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryButtonText}>Log In</Text>
            }
          </TouchableOpacity>

          <Divider />

          {/* Social buttons — non-functional, wired in Phase 4-5 */}
          <View style={styles.socialRow}>
            {SOCIAL_PROVIDERS.map(p => <SocialButton key={p.key} provider={p} />)}
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.switchText}>
            Don't have an account? <Text style={styles.switchLink}>Sign up free</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Dark Forest background, card centered
  page: {
    flex: 1,
    backgroundColor: palette.forest,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xxl,
  },

  // Logo — white on dark
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoIcon: { fontSize: 36, marginRight: spacing.sm },
  logoText: {
    fontSize: fontSize.hero,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: fontSize.caption,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // White card, max 420px wide
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.section,
    fontFamily: 'Inter_700Bold',
    color: palette.charcoal,
    marginBottom: spacing.lg,
  },

  // Inputs
  label: {
    fontSize: fontSize.caption,
    fontFamily: 'Inter_600SemiBold',
    color: palette.slate,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: palette.charcoal,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.sand,
    paddingHorizontal: spacing.base,
    height: 48,
    marginBottom: spacing.md,
    fontSize: fontSize.body,
    fontFamily: 'Inter_400Regular',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },

  // Primary button
  primaryButton: {
    backgroundColor: palette.campfire,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: fontSize.body,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.sand,
  },
  dividerText: {
    fontSize: fontSize.caption,
    fontFamily: 'Inter_400Regular',
    color: palette.slate,
    marginHorizontal: spacing.md,
  },

  // Social buttons
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },

  // Switch link
  switchText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Inter_400Regular',
    fontSize: fontSize.caption,
  },
  switchLink: {
    color: palette.gold,
    fontFamily: 'Inter_600SemiBold',
  },
});
