import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { sendChatMessage } from '../api/ai';

const STARTERS = [
  'Design me a Halloween hunt near Cheesman Park with 5 stops',
  'Create a pirate treasure hunt downtown Denver for kids',
  'Build a history mystery tour around the Capitol building',
];

export default function HuntChatPanel({ onHuntGenerated }) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const s = makeStyles(colors);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  async function send(text) {
    const content = (text || input).trim();
    if (!content) return;
    setInput('');

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const reply = await sendChatMessage(nextMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't reach the AI right now. Check your connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🤖 HuntBot</Text>
        <Text style={s.headerSub}>AI hunt designer</Text>
      </View>

      {/* Message list */}
      <ScrollView
        ref={scrollRef}
        style={s.feed}
        contentContainerStyle={s.feedContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🧭</Text>
            <Text style={s.emptyTitle}>Tell me about your hunt</Text>
            <Text style={s.emptyDesc}>
              Describe a theme, location, or mood and I'll design it for you.
            </Text>
            <View style={s.starters}>
              {STARTERS.map((s2, i) => (
                <TouchableOpacity key={i} style={s.starterBtn} onPress={() => send(s2)}>
                  <Text style={s.starterText}>{s2}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg, i) => (
          <View key={i} style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
            {msg.role === 'assistant' && (
              <Text style={s.bubbleLabel}>HuntBot</Text>
            )}
            <Text style={[s.bubbleText, msg.role === 'user' ? s.bubbleTextUser : s.bubbleTextBot]}>
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[s.bubble, s.bubbleBot]}>
            <Text style={s.bubbleLabel}>HuntBot</Text>
            <ActivityIndicator size="small" color={palette.campfire} style={{ marginTop: 4 }} />
          </View>
        )}
      </ScrollView>

      {/* Input row */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Ask HuntBot anything…"
          placeholderTextColor={palette.stone}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => send()}
          blurOnSubmit={false}
          editable={!loading}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
        >
          <Text style={s.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: fontSize.card,
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
    },
    headerSub: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    feed: { flex: 1 },
    feedContent: {
      padding: spacing.md,
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },

    // Empty state
    emptyState: { flex: 1, alignItems: 'center', paddingTop: spacing.xl },
    emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
    emptyTitle: {
      fontSize: fontSize.card,
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyDesc: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      maxWidth: 280,
    },
    starters: { width: '100%', gap: spacing.sm },
    starterBtn: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
    },
    starterText: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      color: colors.textPrimary,
    },

    // Bubbles
    bubble: {
      marginBottom: spacing.sm,
      maxWidth: '85%',
      borderRadius: borderRadius.lg,
      padding: spacing.base,
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      backgroundColor: palette.forest,
      borderBottomRightRadius: 4,
    },
    bubbleBot: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },
    bubbleLabel: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      color: palette.campfire,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bubbleText: {
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      lineHeight: 20,
    },
    bubbleTextUser: { color: '#FFFFFF' },
    bubbleTextBot: { color: colors.textPrimary },

    // Input row
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      fontSize: fontSize.caption,
      fontFamily: 'Inter_400Regular',
      color: colors.textPrimary,
      maxHeight: 100,
      ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.campfire,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: palette.stone },
    sendIcon: {
      color: '#fff',
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      lineHeight: 20,
    },
  });
}
