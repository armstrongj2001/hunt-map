import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';

// Landing page — web only, shown before login
export default function LandingPage({ onGetStarted, onLogin }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.pageContent}>

      {/* ── Nav bar ── */}
      <View style={s.nav}>
        <View style={s.navLogo}>
          <Text style={s.navLogoIcon}>🧭</Text>
          <Text style={s.navLogoText}>HuntMap</Text>
        </View>
        <View style={s.navLinks}>
          <TouchableOpacity onPress={onLogin} style={s.navLinkButton}>
            <Text style={s.navLinkText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGetStarted} style={s.navCta}>
            <Text style={s.navCtaText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero ── */}
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>🌍 GPS TREASURE HUNTS</Text>
        <Text style={s.heroHeadline}>Turn any place into{'\n'}an adventure</Text>
        <Text style={s.heroSub}>
          Create immersive treasure hunts with AI-assisted clues, drop pins on real locations,
          and challenge your friends to find them. Any place. Any theme. Any time.
        </Text>
        <View style={s.heroButtons}>
          <TouchableOpacity style={s.primaryButton} onPress={onGetStarted}>
            <Text style={s.primaryButtonText}>Start for Free</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryButton} onPress={onLogin}>
            <Text style={s.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.heroNote}>No credit card required · Works on iOS, Android & Web</Text>
      </View>

      {/* ── How it works ── */}
      <View style={s.section}>
        <Text style={s.sectionEyebrow}>HOW IT WORKS</Text>
        <Text style={s.sectionTitle}>Three steps to adventure</Text>
        <View style={s.stepsRow}>
          {[
            { num: '1', icon: '📍', title: 'Drop your pins', desc: 'Open the map, tap to place checkpoints at real locations. Anywhere in the world.' },
            { num: '2', icon: '✨', title: 'AI writes the clues', desc: 'Tell our AI your theme — it finds nearby landmarks and writes clever clues automatically.' },
            { num: '3', icon: '🏆', title: 'Share & compete', desc: 'Send the join code. Players navigate by GPS, scan QR codes, and race the clock.' },
          ].map(step => (
            <View key={step.num} style={s.stepCard}>
              <Text style={s.stepIcon}>{step.icon}</Text>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Features ── */}
      <View style={[s.section, s.sectionAlt]}>
        <Text style={s.sectionEyebrow}>FEATURES</Text>
        <Text style={s.sectionTitle}>Everything you need to run a great hunt</Text>
        <View style={s.featuresGrid}>
          {[
            { icon: '🤖', title: 'AI Clue Generator', desc: 'Describe your theme, AI writes riddles, ciphers, and trivia clues based on real landmarks near your pins.' },
            { icon: '📡', title: 'GPS + QR Verification', desc: 'Players unlock checkpoints by physically arriving at the location or scanning a hidden QR code.' },
            { icon: '🏅', title: 'Competitive Mode', desc: 'Timed hunts with leaderboards, scoring, and hint penalties. Or go free-play for a relaxed experience.' },
            { icon: '🎭', title: 'Themed Hunts', desc: 'Halloween mysteries, pirate adventures, birthday quests — AI adapts the story to any theme you choose.' },
            { icon: '👥', title: 'Team Play', desc: 'Create teams, assign leaders, track group progress. Perfect for corporate events or group outings.' },
            { icon: '🗺️', title: 'Works Everywhere', desc: 'Create on your laptop, play on your phone. iOS, Android, and web — one account, all platforms.' },
          ].map(feat => (
            <View key={feat.title} style={s.featureCard}>
              <Text style={s.featureIcon}>{feat.icon}</Text>
              <Text style={s.featureTitle}>{feat.title}</Text>
              <Text style={s.featureDesc}>{feat.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── CTA banner ── */}
      <View style={s.ctaBanner}>
        <Text style={s.ctaTitle}>Ready to hide your first clue?</Text>
        <Text style={s.ctaSub}>Free to use. No experience needed. Adventure guaranteed.</Text>
        <TouchableOpacity style={s.ctaButton} onPress={onGetStarted}>
          <Text style={s.ctaButtonText}>Create Your First Hunt →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <Text style={s.footerLogo}>🧭 HuntMap</Text>
        <Text style={s.footerNote}>Built with adventure in mind · Denver, CO</Text>
      </View>

    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    pageContent: { maxWidth: 1100, alignSelf: 'center', width: '100%' },

    // Nav
    nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingVertical: spacing.base },
    navLogo: { flexDirection: 'row', alignItems: 'center' },
    navLogoIcon: { fontSize: 24, marginRight: spacing.sm },
    navLogoText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.primary },
    navLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    navLinkButton: { padding: spacing.sm },
    navLinkText: { fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, fontSize: fontSize.body },
    navCta: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
    navCtaText: { fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: fontSize.body },

    // Hero
    hero: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    heroEyebrow: { fontSize: fontSize.overline, fontFamily: 'Inter_600SemiBold', color: colors.secondary, letterSpacing: 1.5, marginBottom: spacing.md },
    heroHeadline: { fontSize: 52, fontFamily: 'Inter_700Bold', color: colors.primary, textAlign: 'center', lineHeight: 60, marginBottom: spacing.lg },
    heroSub: { fontSize: fontSize.card, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center', maxWidth: 560, lineHeight: 28, marginBottom: spacing.xl },
    heroButtons: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    primaryButton: { backgroundColor: colors.cta, borderRadius: borderRadius.md, paddingVertical: 14, paddingHorizontal: 28 },
    primaryButtonText: { fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: fontSize.body },
    secondaryButton: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, paddingHorizontal: 28 },
    secondaryButtonText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: fontSize.body },
    heroNote: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    // Sections
    section: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    sectionAlt: { backgroundColor: colors.surface },
    sectionEyebrow: { fontSize: fontSize.overline, fontFamily: 'Inter_600SemiBold', color: colors.secondary, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
    sectionTitle: { fontSize: fontSize.hero, fontFamily: 'Inter_700Bold', color: colors.primary, textAlign: 'center', marginBottom: spacing.xl },

    // Steps
    stepsRow: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
    stepCard: { flex: 1, minWidth: 240, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    stepIcon: { fontSize: 40, marginBottom: spacing.md },
    stepTitle: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
    stepDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

    // Features grid
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'center' },
    featureCard: { width: 300, backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
    featureIcon: { fontSize: 32, marginBottom: spacing.md },
    featureTitle: { fontSize: fontSize.body, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.sm },
    featureDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, lineHeight: 20 },

    // CTA banner
    ctaBanner: { backgroundColor: colors.primary, padding: spacing.xxl, alignItems: 'center' },
    ctaTitle: { fontSize: fontSize.hero, fontFamily: 'Inter_700Bold', color: '#fff', textAlign: 'center', marginBottom: spacing.md },
    ctaSub: { fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: spacing.xl },
    ctaButton: { backgroundColor: colors.cta, borderRadius: borderRadius.md, paddingVertical: 14, paddingHorizontal: 32 },
    ctaButtonText: { fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: fontSize.body },

    // Footer
    footer: { padding: spacing.xl, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
    footerLogo: { fontSize: fontSize.body, fontFamily: 'Inter_700Bold', color: colors.primary, marginBottom: spacing.sm },
    footerNote: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
  });
}
