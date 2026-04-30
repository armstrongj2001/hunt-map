import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Free tile sources — no API key required for any of these
const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>, &copy; OpenStreetMap contributors',
  },
};

const MAP_TYPES = [
  { key: 'standard',  label: 'Default'   },
  { key: 'satellite', label: 'Satellite' },
  { key: 'terrain',   label: 'Terrain'   },
];

function LeafletCSS() {
  useEffect(() => {
    if (document.querySelector('#leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);
  return null;
}

function fixLeafletIcon() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14);
  }, [center]);
  return null;
}

export default function HuntMap({ location, markers = [], onMapPress }) {
  const [mapType, setMapType] = useState('standard');
  fixLeafletIcon();

  const center = location
    ? [location.latitude, location.longitude]
    : [39.7392, -104.9903];

  const tile = TILE_LAYERS[mapType];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}>
      <LeafletCSS />
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        onClick={onMapPress}
      >
        <TileLayer key={mapType} attribution={tile.attribution} url={tile.url} />
        <MapUpdater center={center} />

        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {markers.map((marker, i) => (
          <Marker key={i} position={[marker.latitude, marker.longitude]}>
            <Popup>{marker.title || `Checkpoint ${i + 1}`}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating toggle — top-right corner, above the map (z-index > leaflet's 400) */}
      <div style={toggleStyles.wrapper}>
        {MAP_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMapType(key)}
            style={{
              ...toggleStyles.btn,
              ...(mapType === key ? toggleStyles.btnActive : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const toggleStyles = {
  wrapper: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  btn: {
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    color: '#5F5E5A',
    cursor: 'pointer',
    transition: 'background 150ms ease',
  },
  btnActive: {
    backgroundColor: '#1A3C34',
    color: '#FFFFFF',
  },
};
