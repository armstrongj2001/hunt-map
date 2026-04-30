// Web map using react-leaflet with OpenStreetMap tiles (free, no API key needed)
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Inject Leaflet CSS — required for the map to render correctly
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

// Fix Leaflet's default marker icon (broken in bundled environments)
function fixLeafletIcon() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Moves the map view when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center]);
  return null;
}

export default function HuntMap({ location, markers = [], onMapPress }) {
  fixLeafletIcon();

  // Default to Denver if no location provided
  const center = location
    ? [location.latitude, location.longitude]
    : [39.7392, -104.9903];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <LeafletCSS />
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        onClick={onMapPress}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {/* User location marker */}
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Custom checkpoint markers */}
        {markers.map((marker, i) => (
          <Marker key={i} position={[marker.latitude, marker.longitude]}>
            <Popup>{marker.title || `Checkpoint ${i + 1}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
