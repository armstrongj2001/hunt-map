import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Switch, Platform,
} from 'react-native';
import { MapPin, Sparkles } from 'lucide-react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import HuntMap from '../components/HuntMap';

const THEMES = [
  { key: 'custom',     label: 'Custom',     icon: '✏️' },
  { key: 'easter',     label: 'Easter',     icon: '🐣' },
  { key: 'halloween',  label: 'Halloween',  icon: '🎃' },
  { key: 'christmas',  label: 'Christmas',  icon: '🎄' },
  { key: 'birthday',   label: 'Birthday',   icon: '🎂' },
  { key: 'pirate',     label: 'Pirate',     icon: '🏴‍☠️' },
  { key: 'detective',  label: 'Detective',  icon: '🔍' },
  { key: 'fantasy',    label: 'Fantasy',    icon: '🧙' },
  { key: 'scifi',      label: 'Sci-Fi',     icon: '🚀' },
];

export default function CreateScreen() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('custom');
  const [competitive, setCompetitive] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const s = makeStyles(colors);

  const selectedTheme = THEMES.find(t => t.key === theme) || THEMES[0];

  const formPanel = (
    <ScrollView style={s.formScroll} contentContainerStyle={s.formContent} showsVerticalScrollIndicator={false}>
      <Text style={s.panelHeading}>New Hunt</Text>

      {/* Title */}
      <Text style={s.label}>Hunt Title</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Downtown Denver Mystery"
        placeholderTextColor={palette.slate}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text style={s.label}>Description</Text>
      <TextInput
        style={[s.input, s.textarea]}
        placeholder="What's the story behind this hunt?"
        placeholderTextColor={palette.slate}
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      {/* Theme picker */}
      <Text style={s.label}>Theme</Text>
      <TouchableOpacity style={s.themePicker} onPress={() => setShowThemePicker(!showThemePicker)}>
        <Text style={s.themeIcon}>{selectedTheme.icon}</Text>
        <Text style={s.themeLabel}>{selectedTheme.label}</Text>
        <Text style={s.themeChevron}>{showThemePicker ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showThemePicker && (
        <View style={s.themeDropdown}>
          {THEMES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[s.themeOption, theme === t.key && s.themeOptionActive]}
              onPress={() => { setTheme(t.key); setShowThemePicker(false); }}
            >
              <Text style={s.themeIcon}>{t.icon}</Text>
              <Text style={[s.themeLabel, theme === t.key && s.themeOptionActiveText]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Game mode toggle */}
      <Text style={s.label}>Game Mode</Text>
      <View style={s.modeRow}>
        <Text style={[s.modeLabel, !competitive && s.modeLabelActive]}>Free Play</Text>
        <Switch
          value={competitive}
          onValueChange={setCompetitive}
          trackColor={{ false: palette.stone, true: palette.campfire }}
          thumbColor={colors.surface}
        />
        <Text style={[s.modeLabel, competitive && s.modeLabelActive]}>Competitive</Text>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Checkpoints section */}
      <Text style={s.panelSubheading}>Checkpoints</Text>
      <Text style={s.panelCaption}>Drop pins on the map or add manually</Text>

      {/* Empty state */}
      <View style={s.emptyState}>
        <Text style={s.emptyIcon}>📍</Text>
        <Text style={s.emptyTitle}>No checkpoints yet</Text>
        <Text style={s.emptyDesc}>Tap the map to drop your first pin</Text>
      </View>

      {/* Action buttons */}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.secondaryButton}>
          <Text style={s.secondaryButtonText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostButton}>
          <Text style={s.ghostButtonText}>Preview</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={s.webShell}>
        {/* Map panel with overlay message */}
        <View style={s.webMap}>
          <HuntMap />
          <View style={s.mapOverlay} pointerEvents="none">
            <View style={s.mapOverlayCard}>
              <MapPin size={24} strokeWidth={1.5} color={palette.campfire} />
              <Text style={s.mapOverlayText}>Tap the map to drop your first checkpoint</Text>
            </View>
          </View>
        </View>
        {/* Form panel */}
        <View style={s.webForm}>
          {formPanel}
        </View>
      </View>
    );
  }

  // Mobile: map top, form below
  return (
    <View style={s.mobileShell}>
      <View style={s.mobileMap}>
        <HuntMap />
      </View>
      {formPanel}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    // Web
    webShell: { flex: 1, flexDirection: 'row', height: '100%' },
    webMap: { flex: 6, height: '100%', position: 'relative' },
    webForm: { flex: 4, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.background },
    mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    mapOverlayCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    mapOverlayText: { fontSize: fontSize.body, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },

    // Mobile
    mobileShell: { flex: 1 },
    mobileMap: { height: '40%' },

    // Form
    formScroll: { flex: 1 },
    formContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
    panelHeading: { fontSize: fontSize.section, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.lg },
    panelSubheading: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    panelCaption: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: spacing.md },
    label: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
    input: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.md, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', borderWidth: 1, borderColor: colors.border },
    textarea: { height: 80, textAlignVertical: 'top' },

    // Theme picker
    themePicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.base, marginBottom: spacing.xs, gap: spacing.sm },
    themeIcon: { fontSize: 18 },
    themeLabel: { flex: 1, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textPrimary },
    themeChevron: { fontSize: 12, color: colors.textSecondary },
    themeDropdown: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
    themeOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, gap: spacing.sm },
    themeOptionActive: { backgroundColor: colors.surfaceAlt },
    themeOptionActiveText: { fontFamily: 'Inter_600SemiBold', color: colors.primary },

    // Mode toggle
    modeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    modeLabel: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    modeLabelActive: { fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },

    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },

    // Empty state
    emptyState: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
    emptyTitle: { fontSize: fontSize.body, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    emptyDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    // Buttons
    actionRow: { flexDirection: 'row', gap: spacing.md },
    secondaryButton: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' },
    secondaryButtonText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: fontSize.body },
    ghostButton: { flex: 1, padding: spacing.base, alignItems: 'center' },
    ghostButtonText: { fontFamily: 'Inter_400Regular', color: colors.textSecondary, fontSize: fontSize.body },
  });
}
