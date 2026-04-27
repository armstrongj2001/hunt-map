import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { register, login } from '../api/auth';

export default function SignUpScreen({ navigation, onLoginSuccess }) {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      await login(username, password);
      onLoginSuccess();
    } catch (error) {
      const msg = error.response?.data?.username?.[0] || 'Sign up failed. Try a different username.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.logoRow}>
          <Text style={s.logoIcon}>🧭</Text>
          <Text style={s.logoText}>HuntMap</Text>
        </View>
        <Text style={s.tagline}>Your first adventure starts here</Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Create your account</Text>

          <Text style={s.label}>Username</Text>
          <TextInput
            style={s.input}
            placeholder="Choose a username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={s.label}>Email <Text style={s.optional}>(optional)</Text></Text>
          <TextInput
            style={s.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="8+ characters"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={s.primaryButton} onPress={handleSignUp} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryButtonText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.switchText}>
            Already have an account? <Text style={s.switchLink}>Log in</Text>
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
    optional: { fontFamily: 'Inter_400Regular', textTransform: 'none', letterSpacing: 0 },
    input: { backgroundColor: colors.background, color: colors.textPrimary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.md, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', borderWidth: 1, borderColor: colors.border },
    primaryButton: { backgroundColor: colors.cta, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center', marginTop: spacing.sm },
    primaryButtonText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
    switchText: { textAlign: 'center', color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: fontSize.caption },
    switchLink: { color: colors.cta, fontFamily: 'Inter_600SemiBold' },
  });
}
