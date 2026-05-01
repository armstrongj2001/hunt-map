const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Query OpenStreetMap Overpass API for named features within radiusMeters of a point
export async function queryOverpass(lat, lng, radiusMeters = 150) {
  const query = `
    [out:json][timeout:10];
    (
      node["name"]["amenity"](around:${radiusMeters},${lat},${lng});
      node["name"]["historic"](around:${radiusMeters},${lat},${lng});
      node["name"]["tourism"](around:${radiusMeters},${lat},${lng});
      node["name"]["leisure"](around:${radiusMeters},${lat},${lng});
      node["name"]["man_made"](around:${radiusMeters},${lat},${lng});
      node["name"]["artwork_type"](around:${radiusMeters},${lat},${lng});
      way["name"]["amenity"](around:${radiusMeters},${lat},${lng});
      way["name"]["historic"](around:${radiusMeters},${lat},${lng});
      way["name"]["tourism"](around:${radiusMeters},${lat},${lng});
      way["name"]["leisure"](around:${radiusMeters},${lat},${lng});
    );
    out center 10;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    const data = await res.json();
    return (data.elements || [])
      .filter(el => el.tags?.name)
      .map(el => ({
        id: `osm-${el.id}`,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.historic || el.tags.tourism || el.tags.leisure || el.tags.man_made || 'landmark',
        source: 'OpenStreetMap',
        latitude: el.lat ?? el.center?.lat,
        longitude: el.lon ?? el.center?.lon,
        description: el.tags.description || el.tags['description:en'] || null,
      }))
      .filter(l => l.latitude && l.longitude);
  } catch {
    return [];
  }
}

// Query Google Places Nearby Search within radiusMeters
export async function queryGooglePlaces(lat, lng, radiusMeters = 150) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&key=${GOOGLE_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.results || []).slice(0, 8).map(p => ({
      id: `gp-${p.place_id}`,
      name: p.name,
      type: p.types?.[0]?.replace(/_/g, ' ') || 'place',
      source: 'Google Places',
      latitude: p.geometry.location.lat,
      longitude: p.geometry.location.lng,
      description: p.vicinity || null,
      rating: p.rating || null,
    }));
  } catch {
    return [];
  }
}

// Query Wikipedia for articles near a point
export async function queryWikipedia(lat, lng, radiusMeters = 300) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lng}&gsradius=${radiusMeters}&gslimit=5&format=json&origin=*`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.query?.geosearch || []).map(item => ({
      id: `wiki-${item.pageid}`,
      name: item.title,
      type: 'wikipedia',
      source: 'Wikipedia',
      latitude: item.lat,
      longitude: item.lon,
      description: `Wikipedia article — ${item.dist}m away`,
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
    }));
  } catch {
    return [];
  }
}

// Run all three queries in parallel and deduplicate by name
export async function queryNearbyLandmarks(lat, lng) {
  const [osm, google, wiki] = await Promise.all([
    queryOverpass(lat, lng),
    queryGooglePlaces(lat, lng),
    queryWikipedia(lat, lng),
  ]);

  const all = [...osm, ...google, ...wiki];

  // Deduplicate: keep first occurrence of each name (case-insensitive)
  const seen = new Set();
  return all.filter(l => {
    const key = l.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
