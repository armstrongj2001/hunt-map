import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';

const TABS = ['Created', 'Joined', 'Completed'];

const STATUS_STYLES = {
  Draft:     { bg: '#F3F4F6', text: '#6B7280' },
  Published: { bg: '#E8F5E9', text: palette.evergreen },
  Archived:  { bg: '#FFF3E0', text: '#8B5E34' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Draft;
  return (
    <View style={[badgeStyles.pill, { backgroundColor: style.bg }]}>
      <Text style={[badgeStyles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});

const EMPTY_STATES = {
  Created: {
    icon: '🗺️',
    title: "You haven't created any hunts yet",
    desc: 'Ready to build your first adventure?',
    cta: 'Create a Hunt',
  },
  Joined: {
    icon: '🧭',
    title: 'No active hunts',
    desc: 'Browse the Discover page to find a hunt near you.',
    cta: 'Discover Hunts',
  },
  Completed: {
    icon: '🏆',
    title: 'No completed hunts yet',
    desc: 'Your finished adventures will appear here. Get exploring!',
    cta: null,
  },
};

function EmptyState({ tab }) {
  const state = EMPTY_STATES[tab];
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }}>
      <Text style={{ fontSize: 56, marginBottom: spacing.md }}>{state.icon}</Text>
      <Text style={{ fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }}>{state.title}</Text>
      <Text style={{ fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg }}>{state.desc}</Text>
      {state.cta && (
        <TouchableOpacity style={{ backgroundColor: palette.campfire, borderRadius: borderRadius.md, paddingVertical: 12, paddingHorizontal: spacing.xl }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: fontSize.body }}>{state.cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PlayScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Created');
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      {/* Page header */}
      <View style={s.header}>
        <Text style={s.pageTitle}>My Hunts</Text>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <EmptyState tab={activeTab} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    pageTitle: { fontSize: fontSize.section, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
    tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg },
    tab: { paddingVertical: spacing.md, marginRight: spacing.xl, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: palette.evergreen },
    tabText: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    tabTextActive: { fontFamily: 'Inter_700Bold', color: palette.evergreen },
    scroll: { flex: 1 },
    content: { padding: spacing.lg },
  });
}
