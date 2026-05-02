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

function HuntListItem({ hunt, colors, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[itemStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

export default function PlayScreen({ onNavigate }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Created');
  const [myHunts, setMyHunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const s = makeStyles(colors);

  const loadHunts = useCallback(async () => {
    setLoadFailed(false);
    try {
      const data = await fetchMyHunts();
      // Guard against non-array responses (e.g. unexpected API shape)
      setMyHunts(Array.isArray(data) ? data : []);
    } catch {
      setLoadFailed(true);
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

  function renderCreatedTab() {
    if (loading) {
      return <ActivityIndicator size="large" color={palette.campfire} style={{ marginTop: spacing.xxl }} />;
    }

    if (loadFailed) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>⚠️</Text>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>Couldn't load your hunts</Text>
          <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>Check your connection and pull down to retry.</Text>
        </View>
      );
    }

    if (myHunts.length === 0) {
      return (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🗺️</Text>
          <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>You haven't created any hunts yet</Text>
          <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>Ready to build one? Design a hunt with HuntBot in minutes.</Text>
          <TouchableOpacity style={s.ctaButton} onPress={() => onNavigate?.('Create')}>
            <Text style={s.ctaButtonText}>Create Your First Hunt</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return myHunts.map(hunt => (
      <HuntListItem
        key={hunt.id}
        hunt={hunt}
        colors={colors}
        onPress={() => onNavigate?.('HuntDetail', { huntId: hunt.id })}
      />
    ));
  }

  function renderJoinedTab() {
    return (
      <View style={s.emptyState}>
        <Text style={s.emptyIcon}>🧭</Text>
        <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>No active hunts</Text>
        <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>Join a hunt using a code from a hunt creator.</Text>
        <TouchableOpacity style={s.ctaButton} onPress={() => onNavigate?.('Discover')}>
          <Text style={s.ctaButtonText}>Browse Discover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderCompletedTab() {
    return (
      <View style={s.emptyState}>
        <Text style={s.emptyIcon}>🏆</Text>
        <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>No completed hunts yet</Text>
        <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>Finish your first hunt and it'll appear here.</Text>
      </View>
    );
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
        {activeTab === 'Created'   && renderCreatedTab()}
        {activeTab === 'Joined'    && renderJoinedTab()}
        {activeTab === 'Completed' && renderCompletedTab()}
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
    emptyDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
    ctaButton: { backgroundColor: palette.campfire, borderRadius: borderRadius.md, paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
    ctaButtonText: { color: '#fff', fontSize: fontSize.body, fontFamily: 'Inter_600SemiBold' },
  });
}
