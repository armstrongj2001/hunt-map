import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { fetchMyHunts } from '../api/hunts';

const TABS = ['Created', 'Joined', 'Completed'];

const STATUS_STYLES = {
  draft:     { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' },
  published: { bg: '#E8F5E9', text: palette.evergreen, label: 'Published' },
  archived:  { bg: '#FFF3E0', text: '#8B5E34', label: 'Archived' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <View style={[badgeStyles.pill, { backgroundColor: s.bg }]}>
      <Text style={[badgeStyles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});

function HuntListItem({ hunt, colors }) {
  return (
    <TouchableOpacity style={[itemStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={itemStyles.top}>
        <Text style={[itemStyles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {hunt.title}
        </Text>
        <StatusBadge status={hunt.status} />
      </View>
      <View style={itemStyles.meta}>
        <Text style={[itemStyles.metaText, { color: colors.textSecondary }]}>
          {hunt.checkpoint_count} checkpoint{hunt.checkpoint_count !== 1 ? 's' : ''}
        </Text>
        <Text style={[itemStyles.metaDot, { color: colors.textSecondary }]}>·</Text>
        <Text style={[itemStyles.metaText, { color: colors.textSecondary }]}>
          {hunt.game_mode === 'competitive' ? '🏆 Competitive' : '🌿 Free Play'}
        </Text>
        {hunt.theme && hunt.theme !== 'custom' && (
          <>
            <Text style={[itemStyles.metaDot, { color: colors.textSecondary }]}>·</Text>
            <Text style={[itemStyles.metaText, { color: colors.textSecondary }]}>
              {hunt.theme.charAt(0).toUpperCase() + hunt.theme.slice(1)}
            </Text>
          </>
        )}
      </View>
      {hunt.status === 'draft' && (
        <View style={itemStyles.joinCodeRow}>
          <Text style={[itemStyles.joinCodeLabel, { color: colors.textSecondary }]}>Join code: </Text>
          <Text style={[itemStyles.joinCode, { color: palette.campfire }]}>{hunt.join_code}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const itemStyles = StyleSheet.create({
  card: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.base, marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  title: { flex: 1, fontSize: fontSize.body, fontFamily: 'Inter_600SemiBold', marginRight: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  metaText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular' },
  metaDot: { fontSize: fontSize.caption },
  joinCodeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  joinCodeLabel: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular' },
  joinCode: { fontSize: fontSize.caption, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
});

const EMPTY_STATES = {
  Created: { icon: '🗺️', title: "No hunts created yet", desc: 'Use the Create tab to design a hunt with HuntBot.' },
  Joined:  { icon: '🧭', title: 'No active hunts', desc: 'Browse Discover to find a hunt near you.' },
  Completed: { icon: '🏆', title: 'No completed hunts yet', desc: 'Your finished adventures will appear here.' },
};

export default function PlayScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Created');
  const [myHunts, setMyHunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const s = makeStyles(colors);

  const loadHunts = useCallback(async () => {
    try {
      const data = await fetchMyHunts();
      setMyHunts(data);
    } catch {
      // silently fail — user might be offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadHunts(); }, [loadHunts]);

  function onRefresh() {
    setRefreshing(true);
    loadHunts();
  }

  const empty = EMPTY_STATES[activeTab];

  function renderContent() {
    if (activeTab !== 'Created') {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>{empty.icon}</Text>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>{empty.title}</Text>
          <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>{empty.desc}</Text>
        </View>
      );
    }

    if (loading) {
      return <ActivityIndicator size="large" color={palette.campfire} style={{ marginTop: spacing.xxl }} />;
    }

    if (myHunts.length === 0) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>{empty.icon}</Text>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>{empty.title}</Text>
          <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>{empty.desc}</Text>
        </View>
      );
    }

    return myHunts.map(hunt => (
      <HuntListItem key={hunt.id} hunt={hunt} colors={colors} />
    ));
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.pageTitle}>My Hunts</Text>
      </View>

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

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.campfire} />}
      >
        {renderContent()}
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
    tabActive: { borderBottomColor: palette.campfire },
    tabText: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    tabTextActive: { fontFamily: 'Inter_700Bold', color: palette.campfire },
    scroll: { flex: 1 },
    content: { padding: spacing.lg, flexGrow: 1 },
    emptyState: { flex: 1, alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
    emptyIcon: { fontSize: 56, marginBottom: spacing.md },
    emptyTitle: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: spacing.sm },
    emptyDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  });
}
