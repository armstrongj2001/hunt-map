import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Switch, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import HuntMap from '../components/HuntMap';
import HuntChatPanel from '../components/HuntChatPanel';

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
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [droppedPins, setDroppedPins] = useState([]);
  const [rightTab, setRightTab] = useState('form'); // 'form' | 'chat'
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation(loc.coords);
      }
    })();
  }, []);

  const selectedTheme = THEMES.find(t => t.key === theme) || THEMES[0];

  // Called when HuntBot returns a hunt with checkpoint coordinates
  function handleHuntGenerated(huntData) {
    if (huntData.title) setTitle(huntData.title);
    if (huntData.center) setMapCenter(huntData.center);
    if (huntData.checkpoints?.length) {
      setDroppedPins(huntData.checkpoints.map(cp => ({
        latitude: cp.latitude,
        longitude: cp.longitude,
        address: cp.title,
        clue: cp.clue,
        hint: cp.hint,
      })));
    }
  }

  // Called when user clicks the map or drags an existing pin
  function handlePinDrop(pin, replaceIndex) {
    setDroppedPins(prev => {
      if (replaceIndex !== undefined) {
        const next = [...prev];
        next[replaceIndex] = pin;
        return next;
      }
      return [...prev, pin];
    });
  }

  function handlePinRemove(index) {
    setDroppedPins(prev => prev.filter((_, i) => i !== index));
  }

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

      <View style={s.divider} />

      {/* Checkpoints section */}
      <Text style={s.panelSubheading}>Checkpoints</Text>
      <Text style={s.panelCaption}>Click the map to drop a pin, drag to adjust position</Text>

      {droppedPins.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📍</Text>
          <Text style={s.emptyTitle}>No checkpoints yet</Text>
          <Text style={s.emptyDesc}>Click the map to drop your first pin</Text>
        </View>
      ) : (
        <View style={s.pinList}>
          {droppedPins.map((pin, i) => (
            <View key={i} style={s.pinRow}>
              <View style={s.pinBadge}><Text style={s.pinBadgeText}>{i + 1}</Text></View>
              <Text style={s.pinAddress} numberOfLines={1}>{pin.address}</Text>
              <TouchableOpacity onPress={() => handlePinRemove(i)} style={s.pinRemove}>
                <Text style={s.pinRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

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
        {/* Map panel */}
        <View style={s.webMap}>
          <HuntMap
            location={mapCenter || userLocation}
            droppedPins={droppedPins}
            onPinDrop={handlePinDrop}
            onPinRemove={handlePinRemove}
            showPinDrop
          />
        </View>

        {/* Right panel: Form / AI Chat tabs */}
        <View style={s.webRight}>
          <View style={s.tabBar}>
            <TouchableOpacity
              style={[s.tab, rightTab === 'form' && s.tabActive]}
              onPress={() => setRightTab('form')}
            >
              <Text style={[s.tabText, rightTab === 'form' && s.tabTextActive]}>Hunt Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, rightTab === 'chat' && s.tabActive]}
              onPress={() => setRightTab('chat')}
            >
              <Text style={[s.tabText, rightTab === 'chat' && s.tabTextActive]}>🤖 AI Designer</Text>
            </TouchableOpacity>
          </View>

          {rightTab === 'form' ? formPanel : <HuntChatPanel onHuntGenerated={handleHuntGenerated} />}
        </View>
      </View>
    );
  }

  // Mobile: map top, form below
  return (
    <View style={s.mobileShell}>
      <View style={s.mobileMap}>
        <HuntMap
          location={mapCenter || userLocation}
          droppedPins={droppedPins}
          onPinDrop={handlePinDrop}
          onPinRemove={handlePinRemove}
          showPinDrop
        />
      </View>
      {formPanel}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    webShell: { flex: 1, flexDirection: 'row', height: '100%' },
    webMap: { flex: 6, height: '100%', position: 'relative' },
    webRight: { flex: 4, flexDirection: 'column', borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.background },

    // Tab bar
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
    tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: palette.campfire },
    tabText: { fontSize: fontSize.caption, fontFamily: 'Inter_500Medium', color: colors.textSecondary },
    tabTextActive: { fontFamily: 'Inter_600SemiBold', color: palette.campfire },

    mobileShell: { flex: 1 },
    mobileMap: { height: '40%' },

    formScroll: { flex: 1 },
    formContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
    panelHeading: { fontSize: fontSize.section, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.lg },
    panelSubheading: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    panelCaption: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: spacing.md },
    label: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
    input: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.md, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', borderWidth: 1, borderColor: colors.border },
    textarea: { height: 80, textAlignVertical: 'top' },

    themePicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.base, marginBottom: spacing.xs, gap: spacing.sm },
    themeIcon: { fontSize: 18 },
    themeLabel: { flex: 1, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textPrimary },
    themeChevron: { fontSize: 12, color: colors.textSecondary },
    themeDropdown: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
    themeOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, gap: spacing.sm },
    themeOptionActive: { backgroundColor: colors.surfaceAlt },
    themeOptionActiveText: { fontFamily: 'Inter_600SemiBold', color: colors.primary },

    modeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    modeLabel: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    modeLabelActive: { fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },

    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },

    emptyState: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
    emptyTitle: { fontSize: fontSize.body, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    emptyDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    pinList: { marginBottom: spacing.lg },
    pinRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm },
    pinBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.campfire, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    pinBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold' },
    pinAddress: { flex: 1, fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textPrimary },
    pinRemove: { padding: spacing.xs },
    pinRemoveText: { fontSize: 13, color: colors.textSecondary },

    actionRow: { flexDirection: 'row', gap: spacing.md },
    secondaryButton: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.base, alignItems: 'center' },
    secondaryButtonText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: fontSize.body },
    ghostButton: { flex: 1, padding: spacing.base, alignItems: 'center' },
    ghostButtonText: { fontFamily: 'Inter_400Regular', color: colors.textSecondary, fontSize: fontSize.body },
  });
}
