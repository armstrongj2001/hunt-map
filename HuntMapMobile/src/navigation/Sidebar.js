import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Compass, PlusCircle, Map, User } from 'lucide-react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';

const NAV_ITEMS = [
  { key: 'Discover', label: 'Discover',  Icon: Compass    },
  { key: 'Create',   label: 'Create',    Icon: PlusCircle },
  { key: 'Play',     label: 'My Hunts',  Icon: Map        },
  { key: 'Profile',  label: 'Profile',   Icon: User       },
];

export default function Sidebar({ activeScreen, onNavigate }) {
  const { isDark } = useTheme();

  return (
    <View style={styles.sidebar}>

      {/* Logo */}
      <View style={styles.logoRow}>
        <Text style={styles.logoIcon}>🧭</Text>
        <Text style={styles.logoText}>HuntMap</Text>
      </View>

      {/* Nav items */}
      <View style={styles.nav}>
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = activeScreen === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onNavigate(key)}
            >
              {/* Gold left-border accent on active */}
              {active && <View style={styles.activeBorder} />}

              <Icon
                size={20}
                strokeWidth={1.5}
                color={active ? palette.gold : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom spacer / version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>HuntMap v0.1</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: palette.forest,
    height: '100%',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'column',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoIcon: { fontSize: 24, marginRight: spacing.sm },
  logoText: {
    fontSize: fontSize.card,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  nav: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeBorder: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: palette.gold,
    borderRadius: 2,
  },
  navLabel: {
    marginLeft: spacing.md,
    fontSize: fontSize.body,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  navLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: fontSize.caption,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.3)',
  },
});
