// Native placeholder — Google Places Autocomplete on mobile coming in Phase 2
// For now, shows a simple non-functional search bar to maintain layout consistency
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';

export default function PlacesSearchBar({ placeholder = 'Search places...' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: 'rgba(255,255,255,0.97)', borderColor: colors.border }]}>
      <TextInput
        style={[styles.input, { color: colors.textPrimary, fontFamily: 'Inter_400Regular' }]}
        placeholder={placeholder}
        placeholderTextColor={palette.slate}
        editable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    right: spacing.base,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    paddingHorizontal: spacing.sm,
  },
});
