import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import client from '../api/client';
import { logout } from '../api/auth';

export default function ProfileScreen({ onLogout }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const res = await client.get('/api/users/me/');
      setProfile(res.data);
    } catch (e) {
      console.log('Could not load profile', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    onLogout();
  }

  const s = makeStyles(colors);

  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={colors.cta} /></View>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Avatar placeholder */}
      <View style={s.avatarCircle}>
        <Text style={s.avatarText}>
          {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
        </Text>
      </View>
      <Text style={s.name}>{profile?.display_name || profile?.username}</Text>
      <Text style={s.email}>{profile?.email}</Text>
      <Text style={s.joined}>
        Explorer since {new Date(profile?.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { label: 'Created', value: '0' },
          { label: 'Played', value: '0' },
          { label: 'Miles', value: '0' },
        ].map(stat => (
          <View key={stat.label} style={s.statCard}>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Settings</Text>

        <View style={s.settingRow}>
          <Text style={s.settingLabel}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.secondary }}
            thumbColor={isDark ? colors.gold : colors.surface}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    avatarText: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
    name: { fontSize: fontSize.section, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    email: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: spacing.xs },
    joined: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: spacing.lg },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, width: '100%' },
    statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    statValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.primary },
    statLabel: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginTop: spacing.xs },
    section: { width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.base, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
    sectionTitle: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingLabel: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textPrimary },
    logoutButton: { borderWidth: 1.5, borderColor: colors.error, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
    logoutText: { color: colors.error, fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
  });
}
