import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { fetchHunt, fetchCheckpoints, updateHunt, deleteHunt, updateCheckpoint } from '../api/hunts';

const STATUS_ACTIONS = {
  draft:     { next: 'published', label: 'Publish Hunt', color: palette.evergreen },
  published: { next: 'archived',  label: 'Archive Hunt',  color: palette.slate },
  archived:  { next: 'published', label: 'Re-publish',    color: palette.evergreen },
};

export default function HuntDetailScreen({ huntId, onBack, onDeleted }) {
  const { colors } = useTheme();
  const [hunt, setHunt] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [expandedCp, setExpandedCp] = useState(null);
  const s = makeStyles(colors);

  const load = useCallback(async () => {
    try {
      const [h, cps] = await Promise.all([fetchHunt(huntId), fetchCheckpoints(huntId)]);
      setHunt(h);
      setEditTitle(h.title);
      setCheckpoints(cps);
    } catch {
      Alert.alert('Error', 'Could not load hunt.');
    } finally {
      setLoading(false);
    }
  }, [huntId]);

  useEffect(() => { load(); }, [load]);

  async function saveTitle() {
    if (editTitle === hunt.title) return;
    setSaving(true);
    try {
      const updated = await updateHunt(huntId, { title: editTitle });
      setHunt(updated);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus() {
    const action = STATUS_ACTIONS[hunt.status];
    if (!action) return;
    setSaving(true);
    try {
      const updated = await updateHunt(huntId, { status: action.next });
      setHunt(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Hunt',
      `Delete "${hunt.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteHunt(huntId);
            onDeleted?.();
            onBack();
          },
        },
      ]
    );
  }

  async function saveCheckpoint(cp, field, value) {
    try {
      const updated = await updateCheckpoint(huntId, cp.id, { [field]: value });
      setCheckpoints(prev => prev.map(c => c.id === cp.id ? updated : c));
    } catch {
      Alert.alert('Error', 'Could not save checkpoint.');
    }
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={palette.campfire} />
      </View>
    );
  }

  const statusAction = STATUS_ACTIONS[hunt?.status];

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerMeta}>
          <View style={[s.statusBadge, { backgroundColor: hunt.status === 'published' ? '#E8F5E9' : '#F3F4F6' }]}>
            <Text style={[s.statusText, { color: hunt.status === 'published' ? palette.evergreen : palette.slate }]}>
              {hunt.status.charAt(0).toUpperCase() + hunt.status.slice(1)}
            </Text>
          </View>
          {saving && <ActivityIndicator size="small" color={palette.campfire} style={{ marginLeft: spacing.sm }} />}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Title editor */}
        <Text style={s.sectionLabel}>Hunt Title</Text>
        <TextInput
          style={s.titleInput}
          value={editTitle}
          onChangeText={setEditTitle}
          onBlur={saveTitle}
          returnKeyType="done"
          onSubmitEditing={saveTitle}
          placeholderTextColor={palette.stone}
          {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
        />

        {/* Hunt meta */}
        <View style={s.metaRow}>
          <Text style={s.metaItem}>🧩 {hunt.checkpoint_count} checkpoints</Text>
          <Text style={s.metaItem}>{hunt.game_mode === 'competitive' ? '🏆 Competitive' : '🌿 Free Play'}</Text>
          {hunt.theme && hunt.theme !== 'custom' && (
            <Text style={s.metaItem}>🎨 {hunt.theme.charAt(0).toUpperCase() + hunt.theme.slice(1)}</Text>
          )}
        </View>

        {/* Join code */}
        <View style={s.joinCodeCard}>
          <Text style={s.joinCodeLabel}>Join Code</Text>
          <Text style={s.joinCode}>{hunt.join_code}</Text>
          <Text style={s.joinCodeHint}>Share this code with players to join the hunt</Text>
        </View>

        {/* Checkpoints */}
        <Text style={s.sectionLabel}>Checkpoints</Text>
        {checkpoints.length === 0 ? (
          <Text style={s.emptyText}>No checkpoints yet. Go to Create to drop pins.</Text>
        ) : (
          checkpoints.map((cp, i) => (
            <View key={cp.id} style={s.cpCard}>
              <TouchableOpacity
                style={s.cpHeader}
                onPress={() => setExpandedCp(expandedCp === cp.id ? null : cp.id)}
              >
                <View style={s.cpBadge}>
                  <Text style={s.cpBadgeText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cpCoords}>
                    {cp.latitude.toFixed(4)}, {cp.longitude.toFixed(4)}
                  </Text>
                  {cp.clue_text ? (
                    <Text style={s.cpCluePreview} numberOfLines={1}>{cp.clue_text}</Text>
                  ) : (
                    <Text style={s.cpEmpty}>No clue — tap to add</Text>
                  )}
                </View>
                <Text style={s.cpChevron}>{expandedCp === cp.id ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedCp === cp.id && (
                <View style={s.cpBody}>
                  <Text style={s.cpFieldLabel}>Clue</Text>
                  <TextInput
                    style={s.cpTextarea}
                    multiline
                    defaultValue={cp.clue_text}
                    placeholder="Write the clue players will read…"
                    placeholderTextColor={palette.stone}
                    onEndEditing={e => saveCheckpoint(cp, 'clue_text', e.nativeEvent.text)}
                    textAlignVertical="top"
                    {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
                  />
                  <Text style={s.cpFieldLabel}>Hint <Text style={s.optional}>(optional)</Text></Text>
                  <TextInput
                    style={[s.cpTextarea, { minHeight: 56 }]}
                    multiline
                    defaultValue={cp.hint_text}
                    placeholder="A subtle nudge if players get stuck…"
                    placeholderTextColor={palette.stone}
                    onEndEditing={e => saveCheckpoint(cp, 'hint_text', e.nativeEvent.text)}
                    textAlignVertical="top"
                    {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
                  />
                </View>
              )}
            </View>
          ))
        )}

        {/* Action buttons */}
        <View style={s.actionsRow}>
          {statusAction && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: statusAction.color }]}
              onPress={changeStatus}
              disabled={saving}
            >
              <Text style={s.actionBtnText}>{statusAction.label}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
            <Text style={s.deleteBtnText}>Delete Hunt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { paddingRight: spacing.md },
    backBtnText: { fontSize: fontSize.body, fontFamily: 'Inter_600SemiBold', color: palette.campfire },
    headerMeta: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
    statusText: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold' },

    scroll: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },

    sectionLabel: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_600SemiBold',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    titleInput: {
      fontSize: fontSize.section,
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
    },

    metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
    metaItem: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    joinCodeCard: {
      backgroundColor: palette.forest + '10',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: palette.forest + '30',
      padding: spacing.base,
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    joinCodeLabel: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    joinCode: { fontSize: 32, fontFamily: 'Inter_700Bold', color: palette.forest, letterSpacing: 4, marginVertical: spacing.xs },
    joinCodeHint: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center' },

    emptyText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    cpCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    cpHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, gap: spacing.sm },
    cpBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.campfire, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    cpBadgeText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
    cpCoords: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    cpCluePreview: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textPrimary, marginTop: 2 },
    cpEmpty: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: palette.stone, marginTop: 2, fontStyle: 'italic' },
    cpChevron: { fontSize: 11, color: colors.textSecondary },

    cpBody: { padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
    cpFieldLabel: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
    optional: { fontFamily: 'Inter_400Regular', textTransform: 'none', letterSpacing: 0 },
    cpTextarea: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      color: colors.textPrimary,
      minHeight: 80,
      textAlignVertical: 'top',
    },

    actionsRow: { marginTop: spacing.xl, gap: spacing.sm },
    actionBtn: { borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
    deleteBtn: { borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
    deleteBtnText: { color: '#EF4444', fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
  });
}
