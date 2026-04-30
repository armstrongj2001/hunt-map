import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { Search } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useTheme, spacing, fontSize, borderRadius } from '../theme';
import { palette } from '../theme/colors';
import HuntMap from '../components/HuntMap';
import HuntCard from '../components/HuntCard';

const MOCK_HUNTS = [
  { id: 1, title: 'Denver History Mystery',      creator: 'jobi',      distance: '2.3 mi', rating: 4.5, difficulty: 'Medium', mode: 'Competitive', icon: '🏛️', colorKey: 'mystery'  },
  { id: 2, title: 'Cherry Creek Trail Quest',    creator: 'trailboss', distance: '0.8 mi', rating: 4.8, difficulty: 'Easy',   mode: 'Free Play',   icon: '🌿', colorKey: 'trail'    },
  { id: 3, title: 'Capitol Hill Haunting',        creator: 'ghosthunt', distance: '1.5 mi', rating: 4.2, difficulty: 'Hard',   mode: 'Competitive', icon: '👻', colorKey: 'haunting' },
  { id: 4, title: 'Wash Park Family Adventure',  creator: 'familyfun', distance: '3.1 mi', rating: 4.7, difficulty: 'Easy',   mode: 'Free Play',   icon: '🌳', colorKey: 'family'   },
  { id: 5, title: 'LoDo Pub Crawl Puzzle',        creator: 'barfly',    distance: '2.0 mi', rating: 4.0, difficulty: 'Medium', mode: 'Competitive', icon: '🍺', colorKey: 'pub'      },
  { id: 6, title: "Sloan's Lake Pirate Treasure", creator: 'capnjack',  distance: '4.2 mi', rating: 4.6, difficulty: 'Medium', mode: 'Free Play',   icon: '🏴‍☠️', colorKey: 'pirate'   },
];

const FILTERS = ['All', 'Nearby', 'Popular', 'New', 'Competitive', 'Free Play'];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const s = makeStyles(colors);

  useEffect(() => { requestLocation(); }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
    }
    setLoading(false);
  }

  const filteredHunts = MOCK_HUNTS.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Competitive' && h.mode === 'Competitive') ||
      (activeFilter === 'Free Play' && h.mode === 'Free Play') ||
      ['Nearby', 'Popular', 'New'].includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  if (Platform.OS === 'web') {
    return (
      <WebDiscover
        colors={colors} s={s}
        mapLocation={location} loading={loading}
        search={search} setSearch={setSearch}
        activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        filteredHunts={filteredHunts}
      />
    );
  }

  return (
    <MobileDiscover
      colors={colors} s={s}
      location={location} loading={loading}
      search={search} setSearch={setSearch}
      filteredHunts={filteredHunts}
    />
  );
}

// ── Web layout: map left 60%, feed right 40% ─────────────────────────────────

function WebDiscover({ colors, s, mapLocation, loading, search, setSearch, activeFilter, setActiveFilter, filteredHunts }) {
  return (
    <View style={s.webShell}>

      {/* Map panel — Places Autocomplete is built into HuntMap */}
      <View style={s.webMap}>
        {loading
          ? <View style={s.centered}><ActivityIndicator size="large" color={colors.cta} /></View>
          : <HuntMap location={mapLocation} />
        }
      </View>

      {/* Hunt feed panel */}
      <View style={s.webFeed}>
        <View style={s.searchBar}>
          <Search size={16} strokeWidth={1.5} color={palette.slate} />
          <TextInput
            style={s.searchInput}
            placeholder="Search hunts near you..."
            placeholderTextColor={palette.slate}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterPill, activeFilter === f && s.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={s.feedScroll} contentContainerStyle={s.feedContent} showsVerticalScrollIndicator={false}>
          <Text style={s.feedHeading}>{filteredHunts.length} hunts nearby</Text>
          {filteredHunts.map(hunt => (
            <HuntCard key={hunt.id} hunt={hunt} onPress={() => {}} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Mobile layout: full-screen map + bottom card peek ────────────────────────

function MobileDiscover({ colors, s, location, loading, search, setSearch, filteredHunts }) {
  if (loading) {
    return <View style={s.centered}><ActivityIndicator size="large" color={colors.cta} /></View>;
  }

  return (
    <View style={s.mobileShell}>
      <View style={StyleSheet.absoluteFill}>
        <HuntMap location={location} />
      </View>

      <View style={s.mobileSearch}>
        <Search size={16} strokeWidth={1.5} color={palette.slate} />
        <TextInput
          style={s.searchInput}
          placeholder="Search hunts..."
          placeholderTextColor={palette.slate}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={s.mobileBottom}>
        <View style={s.dragHandle} />
        <Text style={s.feedHeading}>Hunts near you</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: spacing.lg }}>
          {filteredHunts.map(hunt => (
            <View key={hunt.id} style={{ width: 260, marginRight: spacing.md }}>
              <HuntCard hunt={hunt} onPress={() => {}} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    webShell: { flex: 1, flexDirection: 'row', height: '100%' },
    webMap: { flex: 6, height: '100%', position: 'relative' },
    webFeed: { flex: 4, backgroundColor: colors.background, borderLeftWidth: 1, borderLeftColor: colors.border, flexDirection: 'column' },
    searchBar: { flexDirection: 'row', alignItems: 'center', margin: spacing.base, backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
    searchInput: { flex: 1, fontSize: fontSize.body, fontFamily: 'Inter_400Regular', color: colors.textPrimary, outlineStyle: 'none' },
    filterScroll: { maxHeight: 44 },
    filterRow: { paddingHorizontal: spacing.base, gap: spacing.sm, alignItems: 'center' },
    filterPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: fontSize.caption, fontFamily: 'Inter_500Medium', color: colors.textSecondary },
    filterTextActive: { color: '#fff', fontFamily: 'Inter_600SemiBold' },
    feedScroll: { flex: 1 },
    feedContent: { padding: spacing.base, paddingTop: spacing.md },
    feedHeading: { fontSize: fontSize.caption, fontFamily: 'Inter_600SemiBold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
    mobileShell: { flex: 1 },
    mobileSearch: { position: 'absolute', top: spacing.lg, left: spacing.base, right: spacing.base, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    mobileBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: spacing.md, paddingHorizontal: spacing.base, paddingBottom: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
    dragHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  });
}
