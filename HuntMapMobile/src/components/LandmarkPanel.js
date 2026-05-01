import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, TextInput, Platform,
} from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { queryNearbyLandmarks } from '../api/landmarks';
import { sendChatMessage } from '../api/ai';

const SOURCE_COLORS = {
  'OpenStreetMap': { bg: '#E8F5E9', text: '#2E7D32' },
  'Google Places': { bg: '#E3F2FD', text: '#1565C0' },
  'Wikipedia':     { bg: '#FFF8E1', text: '#F57F17' },
};

export default function LandmarkPanel({ pin, pinIndex, huntTheme, onSave, onDismiss }) {
  const { colors } = useTheme();
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [clue, setClue] = useState(pin?.clue || '');
  const [hint, setHint] = useState(pin?.hint || '');
  const [generating, setGenerating] = useState(false);
  const s = makeStyles(colors);

  useEffect(() => {
    if (!pin) return;
    setLoading(true);
    setSelected(null);
    setClue(pin.clue || '');
    setHint(pin.hint || '');
    queryNearbyLandmarks(pin.latitude, pin.longitude).then(results => {
      setLandmarks(results);
      setLoading(false);
    });
  }, [pin?.latitude, pin?.longitude]);

  async function generateClue(landmark) {
    setGenerating(true);
    const theme = huntTheme && huntTheme !== 'custom' ? huntTheme : 'adventure';
    const prompt = `Generate a single treasure hunt clue for this checkpoint.
Landmark: ${landmark.name} (${landmark.type})
${landmark.description ? `Description: ${landmark.description}` : ''}
Hunt theme: ${theme}
Location: ${pin.address || 'unknown'}

Write ONE clue (2-3 sentences, in the theme's voice) that leads players to this landmark without naming it directly. Then on a new line starting with "HINT:" write a subtle hint (1 sentence).`;

    try {
      const reply = await sendChatMessage([{ role: 'user', content: prompt }]);
      const hintMatch = reply.match(/HINT:\s*(.+)/i);
      const clueText = reply.replace(/HINT:.+/is, '').trim();
      setClue(clueText);
      setHint(hintMatch ? hintMatch[1].trim() : '');
    } catch {
      // leave fields as-is
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    onSave(pinIndex, {
      ...pin,
      clue,
      hint,
      landmark: selected,
    });
  }

  if (!pin) return null;

  return (
    <View style={s.panel}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.badgeCircle}>
            <Text style={s.badgeNumber}>{pinIndex + 1}</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>Checkpoint {pinIndex + 1}</Text>
            <Text style={s.headerSub} numberOfLines={1}>{pin.address}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDismiss} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Nearby landmarks */}
        <Text style={s.sectionLabel}>Nearby Landmarks</Text>
        {loading ? (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color={palette.campfire} />
            <Text style={s.loadingText}>Searching nearby places…</Text>
          </View>
        ) : landmarks.length === 0 ? (
          <Text style={s.noResults}>No landmarks found nearby. Write your clue manually below.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.landmarkRow}>
            {landmarks.map(l => {
              const isSelected = selected?.id === l.id;
              const srcStyle = SOURCE_COLORS[l.source] || { bg: colors.surfaceAlt, text: colors.textSecondary };
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[s.landmarkCard, isSelected && s.landmarkCardActive]}
                  onPress={() => {
                    setSelected(isSelected ? null : l);
                    if (!isSelected) generateClue(l);
                  }}
                >
                  <Text style={[s.landmarkName, isSelected && s.landmarkNameActive]} numberOfLines={2}>
                    {l.name}
                  </Text>
                  <View style={[s.sourceTag, { backgroundColor: srcStyle.bg }]}>
                    <Text style={[s.sourceTagText, { color: srcStyle.text }]}>{l.source}</Text>
                  </View>
                  <Text style={[s.landmarkType, isSelected && { color: '#fff' }]} numberOfLines={1}>
                    {l.type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Clue editor */}
        <Text style={s.sectionLabel}>
          Clue {generating && <Text style={s.generating}> ✦ Generating…</Text>}
        </Text>
        {generating ? (
          <View style={[s.textarea, s.generatingBox]}>
            <ActivityIndicator size="small" color={palette.campfire} />
          </View>
        ) : (
          <TextInput
            style={[s.textarea, { color: colors.textPrimary }]}
            multiline
            numberOfLines={4}
            placeholder="What clue will players read at this checkpoint?"
            placeholderTextColor={palette.stone}
            value={clue}
            onChangeText={setClue}
            textAlignVertical="top"
            {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
          />
        )}

        <Text style={s.sectionLabel}>Hint <Text style={s.optional}>(optional)</Text></Text>
        <TextInput
          style={[s.textarea, s.hintInput, { color: colors.textPrimary }]}
          multiline
          numberOfLines={2}
          placeholder="A subtle nudge if players get stuck…"
          placeholderTextColor={palette.stone}
          value={hint}
          onChangeText={setHint}
          textAlignVertical="top"
          {...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})}
        />

        {selected && (
          <TouchableOpacity style={s.regenerateBtn} onPress={() => generateClue(selected)} disabled={generating}>
            <Text style={s.regenerateBtnText}>↺ Regenerate clue with AI</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save Checkpoint</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    panel: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      maxHeight: '50%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    badgeCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: palette.campfire,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeNumber: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
    headerTitle: { fontSize: fontSize.body, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
    headerSub: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, maxWidth: 200 },
    closeBtn: { padding: spacing.sm },
    closeBtnText: { fontSize: 16, color: colors.textSecondary },

    scroll: { padding: spacing.base },

    sectionLabel: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_600SemiBold',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginTop: spacing.base,
    },
    optional: { fontFamily: 'Inter_400Regular', textTransform: 'none', letterSpacing: 0 },
    generating: { color: palette.campfire, fontFamily: 'Inter_400Regular' },

    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    loadingText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    noResults: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: spacing.md },

    landmarkRow: { gap: spacing.sm, paddingBottom: spacing.sm },
    landmarkCard: {
      width: 140,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    landmarkCardActive: { backgroundColor: palette.forest, borderColor: palette.forest },
    landmarkName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },
    landmarkNameActive: { color: '#fff' },
    landmarkType: { fontSize: 11, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textTransform: 'capitalize' },
    sourceTag: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    sourceTagText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

    textarea: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      minHeight: 90,
      marginBottom: spacing.sm,
    },
    hintInput: { minHeight: 60 },
    generatingBox: { justifyContent: 'center', alignItems: 'center' },

    regenerateBtn: {
      alignSelf: 'flex-start',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: palette.campfire,
      marginBottom: spacing.base,
    },
    regenerateBtnText: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: palette.campfire },

    saveBtn: {
      backgroundColor: palette.campfire,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    saveBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: fontSize.body },
  });
}
