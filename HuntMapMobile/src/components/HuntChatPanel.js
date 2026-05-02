import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import { sendChatMessage } from '../api/ai';
import { createHuntWithCheckpoints } from '../api/hunts';

const CONVERSATIONS_KEY = 'huntbot_conversations';

const STARTERS = [
  'Design me a Halloween hunt near Cheesman Park with 5 stops',
  'Create a pirate treasure hunt downtown Denver for kids',
  'Build a history mystery tour around the Capitol building',
];

function parseHuntData(text) {
  const match = text.match(/```hunt-data\n([\s\S]*?)\n```/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function stripHuntData(text) {
  return text.replace(/```hunt-data\n[\s\S]*?\n```/g, '').trim();
}

function newConversation() {
  return { id: Date.now().toString(), title: 'New chat', createdAt: new Date().toISOString(), messages: [], savedIds: {} };
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HuntChatPanel({ onHuntGenerated }) {
  const { colors } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [savedIds, setSavedIds] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // mobile toggle
  const scrollRef = useRef(null);
  const s = makeStyles(colors);

  // Load all conversations on mount
  useEffect(() => {
    AsyncStorage.getItem(CONVERSATIONS_KEY).then((raw) => {
      if (raw) {
        try {
          const convs = JSON.parse(raw);
          if (convs.length > 0) {
            setConversations(convs);
            const latest = convs[0];
            setActiveId(latest.id);
            setMessages(latest.messages || []);
            setSavedIds(latest.savedIds || {});
            return;
          }
        } catch {}
      }
      // No history — start with a blank conversation
      const conv = newConversation();
      setConversations([conv]);
      setActiveId(conv.id);
    });
  }, []);

  // Persist whenever messages change
  useEffect(() => {
    if (!activeId || conversations.length === 0) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId ? { ...c, messages, savedIds } : c
      );
      AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [messages, savedIds]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  function startNewChat() {
    const conv = newConversation();
    setConversations((prev) => {
      const updated = [conv, ...prev];
      AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveId(conv.id);
    setMessages([]);
    setSavedIds({});
    setInput('');
    setShowSidebar(false);
  }

  function switchConversation(id) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setActiveId(id);
    setMessages(conv.messages || []);
    setSavedIds(conv.savedIds || {});
    setInput('');
    setShowSidebar(false);
  }

  function deleteConversation(id) {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
      // If deleting the active one, switch to next or create new
      if (id === activeId) {
        const next = updated[0] || newConversation();
        if (!updated[0]) updated.push(next);
        setActiveId(next.id);
        setMessages(next.messages || []);
        setSavedIds(next.savedIds || {});
      }
      return updated;
    });
  }

  async function send(text) {
    const content = (text || input).trim();
    if (!content) return;
    setInput('');

    const isFirst = messages.length === 0;
    const rawMessages = [
      ...messages.filter((m) => m.raw).map((m) => ({ role: m.role, content: m.raw })),
      { role: 'user', content },
    ];

    const newMessages = [...messages, { role: 'user', content, raw: content }];
    setMessages(newMessages);

    // Auto-title the conversation from the first user message
    if (isFirst) {
      const title = content.length > 45 ? content.slice(0, 42) + '…' : content;
      setConversations((prev) => {
        const updated = prev.map((c) => c.id === activeId ? { ...c, title } : c);
        AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    }

    setLoading(true);
    try {
      const reply = await sendChatMessage(rawMessages);
      const huntData = parseHuntData(reply);
      const displayText = stripHuntData(reply);
      setMessages((prev) => [...prev, { role: 'assistant', content: displayText, raw: reply, huntData }]);
      if (huntData?.checkpoints?.length && onHuntGenerated) {
        onHuntGenerated(huntData);
      }
    } catch (err) {
      const detail = err?.response?.data?.error || err?.message || 'Unknown error';
      console.error('[HuntBot] chat error:', detail, err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't reach the AI right now. (${detail})`,
        raw: '',
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function saveHunt(index, huntData) {
    setSavedIds((prev) => ({ ...prev, [index]: 'saving' }));
    try {
      await createHuntWithCheckpoints({ title: huntData.title, checkpoints: huntData.checkpoints });
      setSavedIds((prev) => ({ ...prev, [index]: 'saved' }));
    } catch {
      setSavedIds((prev) => ({ ...prev, [index]: null }));
    }
  }

  function dismissHunt(index) {
    setSavedIds((prev) => ({ ...prev, [index]: 'dismissed' }));
  }

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  const sidebar = (
    <View style={[s.sidebar, Platform.OS !== 'web' && s.sidebarMobile]}>
      <TouchableOpacity style={s.newChatBtn} onPress={startNewChat}>
        <Text style={s.newChatIcon}>＋</Text>
        <Text style={s.newChatText}>New chat</Text>
      </TouchableOpacity>

      <ScrollView style={s.convList} showsVerticalScrollIndicator={false}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={[s.convItem, conv.id === activeId && s.convItemActive]}
            onPress={() => switchConversation(conv.id)}
          >
            <Text style={[s.convTitle, conv.id === activeId && s.convTitleActive]} numberOfLines={2}>
              {conv.title}
            </Text>
            <View style={s.convMeta}>
              <Text style={s.convDate}>{formatDate(conv.createdAt)}</Text>
              {conversations.length > 1 && (
                <TouchableOpacity
                  onPress={() => deleteConversation(conv.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.convDelete}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ─── Chat area ──────────────────────────────────────────────────────────────
  const chatArea = (
    <>
      {/* Mobile: header with history toggle */}
      {Platform.OS !== 'web' && (
        <View style={s.mobileHeader}>
          <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={s.historyToggle}>
            <Text style={s.historyToggleIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={s.mobileHeaderTitle} numberOfLines={1}>
            {conversations.find((c) => c.id === activeId)?.title || 'HuntBot'}
          </Text>
          <TouchableOpacity onPress={startNewChat} style={s.historyToggle}>
            <Text style={s.historyToggleIcon}>＋</Text>
          </TouchableOpacity>
        </View>
      )}

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
              Describe a theme, location, or mood and I'll design the checkpoints and drop them on the map.
            </Text>
            <View style={s.starters}>
              {STARTERS.map((starter, i) => (
                <TouchableOpacity key={i} style={s.starterBtn} onPress={() => send(starter)}>
                  <Text style={s.starterText}>{starter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg, i) => (
          <View key={i}>
            <View style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
              {msg.role === 'assistant' && <Text style={s.bubbleLabel}>HuntBot</Text>}
              {msg.role === 'user' ? (
                <Text style={s.bubbleTextUser}>{msg.content}</Text>
              ) : (
                <Markdown style={markdownStyles(colors)}>{msg.content}</Markdown>
              )}
            </View>

            {msg.role === 'assistant' && msg.huntData?.checkpoints?.length > 0 && (
              <View style={s.actionRow}>
                <View style={s.pinBadge}>
                  <Text style={s.pinBadgeText}>📍 {msg.huntData.checkpoints.length} checkpoints on map</Text>
                </View>
                {savedIds[i] === 'saved' ? (
                  <View style={s.savedBadge}><Text style={s.savedBadgeText}>✓ Saved to library</Text></View>
                ) : savedIds[i] === 'dismissed' ? (
                  <View style={s.dismissedBadge}><Text style={s.dismissedBadgeText}>Dismissed</Text></View>
                ) : (
                  <View style={s.thumbRow}>
                    <TouchableOpacity style={s.thumbBtn} onPress={() => saveHunt(i, msg.huntData)} disabled={savedIds[i] === 'saving'}>
                      {savedIds[i] === 'saving'
                        ? <ActivityIndicator size="small" color={palette.campfire} />
                        : <Text style={s.thumbIcon}>👍</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={s.thumbBtn} onPress={() => dismissHunt(i)}>
                      <Text style={s.thumbIcon}>👎</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[s.bubble, s.bubbleBot]}>
            <Text style={s.bubbleLabel}>HuntBot</Text>
            <ActivityIndicator size="small" color={palette.campfire} style={{ marginTop: 4 }} />
          </View>
        )}
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Ask HuntBot anything…  (Shift+Enter for new line)"
          placeholderTextColor={palette.stone}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={Platform.OS !== 'web' ? () => send() : undefined}
          blurOnSubmit={false}
          editable={!loading}
          onKeyPress={Platform.OS === 'web' ? (e) => {
            if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
              e.preventDefault?.();
              send();
            }
          } : undefined}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
        >
          <Text style={s.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // ─── Web layout: sidebar + chat side by side ─────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={s.webContainer}>
        {sidebar}
        <View style={s.webChat}>
          {/* Web header showing active conversation title */}
          <View style={s.webHeader}>
            <Text style={s.webHeaderTitle}>🤖 HuntBot</Text>
            <Text style={s.webHeaderSub} numberOfLines={1}>
              {conversations.find((c) => c.id === activeId)?.title || 'New chat'}
            </Text>
          </View>
          {chatArea}
        </View>
      </View>
    );
  }

  // ─── Mobile layout: overlay sidebar ──────────────────────────────────────
  return (
    <KeyboardAvoidingView style={s.container} behavior="padding">
      {showSidebar && (
        <TouchableOpacity style={s.sidebarOverlay} onPress={() => setShowSidebar(false)} activeOpacity={1}>
          <View onStartShouldSetResponder={() => true}>
            {sidebar}
          </View>
        </TouchableOpacity>
      )}
      {chatArea}
    </KeyboardAvoidingView>
  );
}

// Markdown styles scoped to match the bot bubble and design system
function markdownStyles(colors) {
  return {
    body: { color: colors.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
    heading1: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.textPrimary, marginTop: 8, marginBottom: 4 },
    heading2: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.textPrimary, marginTop: 6, marginBottom: 4 },
    heading3: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: palette.campfire, marginTop: 6, marginBottom: 2 },
    strong: { fontFamily: 'Inter_700Bold' },
    em: { fontStyle: 'italic' },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginBottom: 2 },
    bullet_list_icon: { color: palette.campfire, marginTop: 4 },
    code_inline: { fontFamily: 'Inter_400Regular', backgroundColor: colors.surfaceAlt || '#f0ede8', borderRadius: 4, paddingHorizontal: 4, fontSize: 12, color: palette.forest },
    code_block: { fontFamily: 'Inter_400Regular', backgroundColor: colors.surfaceAlt || '#f0ede8', borderRadius: 8, padding: 10, fontSize: 12, color: palette.forest },
    blockquote: { borderLeftWidth: 3, borderLeftColor: palette.campfire, paddingLeft: 10, opacity: 0.85 },
    hr: { backgroundColor: colors.border, marginVertical: 8 },
    paragraph: { marginBottom: 6, marginTop: 0 },
    link: { color: palette.campfire },
  };
}

function makeStyles(colors) {
  return StyleSheet.create({
    // ── Shared
    container: { flex: 1, backgroundColor: colors.background },

    // ── Web shell
    webContainer: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
    webChat: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
    webHeader: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    webHeaderTitle: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
    webHeaderSub: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginTop: 2 },

    // ── Mobile header
    mobileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    mobileHeaderTitle: { flex: 1, fontSize: fontSize.body, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary, textAlign: 'center' },
    historyToggle: { padding: spacing.sm },
    historyToggleIcon: { fontSize: 20, color: colors.textSecondary },

    // ── Sidebar
    sidebar: {
      width: 200,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.surface,
      paddingTop: spacing.sm,
    },
    sidebarMobile: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      width: 260,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    sidebarOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    newChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.sm,
      marginBottom: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: palette.campfire,
      backgroundColor: palette.campfire + '12',
    },
    newChatIcon: { fontSize: 16, color: palette.campfire, fontFamily: 'Inter_700Bold' },
    newChatText: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: palette.campfire },
    convList: { flex: 1 },
    convItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.xs,
      marginBottom: 2,
    },
    convItemActive: { backgroundColor: palette.campfire + '18' },
    convTitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.textPrimary, lineHeight: 16 },
    convTitleActive: { fontFamily: 'Inter_600SemiBold', color: palette.campfire },
    convMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    convDate: { fontSize: 10, fontFamily: 'Inter_400Regular', color: colors.textSecondary },
    convDelete: { fontSize: 10, color: colors.textSecondary, paddingHorizontal: 2 },

    // ── Feed
    feed: { flex: 1 },
    feedContent: { padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },

    emptyState: { flex: 1, alignItems: 'center', paddingTop: spacing.xl },
    emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
    emptyTitle: { fontSize: fontSize.card, fontFamily: 'Inter_700Bold', color: colors.textPrimary, marginBottom: spacing.xs },
    emptyDesc: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, maxWidth: 280 },
    starters: { width: '100%', gap: spacing.sm },
    starterBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.base },
    starterText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', color: colors.textPrimary },

    bubble: { marginBottom: spacing.xs, maxWidth: '88%', borderRadius: borderRadius.lg, padding: spacing.base },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: palette.forest, borderBottomRightRadius: 4 },
    bubbleBot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
    bubbleLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: palette.campfire, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    bubbleText: { fontSize: fontSize.caption, fontFamily: 'Inter_400Regular', lineHeight: 20 },
    bubbleTextUser: { color: '#FFFFFF' },
    bubbleTextBot: { color: colors.textPrimary },

    actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md, marginLeft: 2 },
    pinBadge: { backgroundColor: palette.campfire + '18', borderRadius: borderRadius.md, borderWidth: 1, borderColor: palette.campfire + '40', paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
    pinBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: palette.campfire },
    thumbRow: { flexDirection: 'row', gap: spacing.xs },
    thumbBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
    thumbIcon: { fontSize: 16 },
    savedBadge: { backgroundColor: '#1A3C3418', borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#1A3C3440', paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
    savedBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: palette.forest },
    dismissedBadge: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
    dismissedBadgeText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.textSecondary },

    inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
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
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.campfire, justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: palette.stone },
    sendIcon: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  });
}
