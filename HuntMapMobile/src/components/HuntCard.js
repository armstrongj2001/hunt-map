import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MapPin, Star, Clock, Users } from 'lucide-react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';

// Color swatch for the card thumbnail (until we have real map images)
const THEME_COLORS = {
  mystery:   '#1A3C34',
  trail:     '#2D6A4F',
  haunting:  '#2C1810',
  family:    '#4A7C59',
  pub:       '#8B5E34',
  pirate:    '#1A3C34',
};

// Difficulty badge styles
const DIFFICULTY_STYLES = {
  Easy:   { bg: '#E8F5E9', text: '#2D6A4F' },
  Medium: { bg: '#FFF3E0', text: '#8B5E34' },
  Hard:   { bg: '#FCE4EC', text: '#C62828' },
};

const MODE_STYLES = {
  Competitive: { bg: '#FCE4EC', text: '#C62828' },
  'Free Play':  { bg: '#E8F5E9', text: '#2D6A4F' },
};

function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          color={i <= Math.round(rating) ? palette.gold : palette.stone}
          fill={i <= Math.round(rating) ? palette.gold : 'transparent'}
        />
      ))}
      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: palette.slate, marginLeft: 4 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function Badge({ label, styles }) {
  return (
    <View style={[badgeBase.pill, { backgroundColor: styles.bg }]}>
      <Text style={[badgeBase.text, { color: styles.text }]}>{label}</Text>
    </View>
  );
}

const badgeBase = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});

export default function HuntCard({ hunt, onPress, active = false }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const thumbColor = THEME_COLORS[hunt.colorKey] || palette.forest;

  return (
    <TouchableOpacity
      style={[s.card, active && s.cardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Thumbnail — colored placeholder until real images */}
      <View style={[s.thumb, { backgroundColor: thumbColor }]}>
        <Text style={s.thumbIcon}>{hunt.icon || '🗺️'}</Text>
        <View style={s.thumbBadge}>
          <Badge label={hunt.mode} styles={MODE_STYLES[hunt.mode] || MODE_STYLES['Free Play']} />
        </View>
      </View>

      {/* Card body */}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{hunt.title}</Text>

        <View style={s.metaRow}>
          <MapPin size={12} strokeWidth={1.5} color={palette.slate} />
          <Text style={s.metaText}>{hunt.distance} away · by {hunt.creator}</Text>
        </View>

        <View style={s.bottomRow}>
          <Stars rating={hunt.rating} />
          <Badge label={hunt.difficulty} styles={DIFFICULTY_STYLES[hunt.difficulty] || DIFFICULTY_STYLES.Medium} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.md,
      ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    cardActive: {
      borderColor: palette.campfire,
      borderWidth: 2,
    },
    thumb: {
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    thumbIcon: { fontSize: 36 },
    thumbBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm },
    body: { padding: spacing.base },
    title: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    metaText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  });
}
