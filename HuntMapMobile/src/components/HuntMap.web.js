import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Autocomplete,
} from '@react-google-maps/api';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ['places'];

// Default center: Denver, CO
const DEFAULT_CENTER = { lat: 39.7392, lng: -104.9903 };
const DEFAULT_ZOOM = 13;

// Minimal map style — keeps Google's controls but removes clutter
const mapOptions = {
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 9, // RIGHT_BOTTOM
  },
  streetViewControl: true,
  zoomControl: true,
  fullscreenControl: false,
  myLocationButton: true,
};

// Reverse geocode a LatLng using the Geocoding API
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    const data = await res.json();
    return data.results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function HuntMap({
  location,           // { latitude, longitude } — GPS position (blue dot)
  focusLocation,      // { latitude, longitude } — fly here without showing a marker
  markers = [],       // [{ latitude, longitude, title, id }] — read-only pins
  onMarkerPress,      // (marker) => void — called when a read-only pin is clicked
  onMapPress,         // (lat, lng) => void — called when user clicks map (Create page)
  droppedPins = [],   // [{ latitude, longitude, address }] — draggable checkpoint pins
  onPinDrop,          // ({ latitude, longitude, address }) => void — new pin dropped/dragged
  onPinRemove,        // (index) => void — pin removed
  showPinDrop = false,// true on Create page
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });

  // Stable map ref — never triggers re-render
  const mapRef = useRef(null);

  // Autocomplete instance ref
  const autocompleteRef = useRef(null);

  // InfoWindow state: which dropped pin is selected
  const [activePin, setActivePin] = useState(null);

  // Visual marker for the current search result
  const [searchPin, setSearchPin] = useState(null);

  // Hide search bar when street view is open (it covers the back button)
  const [streetViewVisible, setStreetViewVisible] = useState(false);

  // Current location button state
  const [locating, setLocating] = useState(false);

  // Fly to GPS location when it changes
  const prevLocation = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !location) return;
    const { latitude: lat, longitude: lng } = location;
    const prev = prevLocation.current;
    if (prev && prev.latitude === lat && prev.longitude === lng) return;
    prevLocation.current = location;
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, [location]);

  // Fly to an arbitrary location (e.g. selected hunt card) without showing a marker
  const prevFocus = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return;
    const { latitude: lat, longitude: lng } = focusLocation;
    const prev = prevFocus.current;
    if (prev && prev.latitude === lat && prev.longitude === lng) return;
    prevFocus.current = focusLocation;
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, [focusLocation]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    // Explicitly set center on mount — defaultCenter isn't reliable in @react-google-maps/api
    const initialCenter = location
      ? { lat: location.latitude, lng: location.longitude }
      : DEFAULT_CENTER;
    map.setCenter(initialCenter);
    map.setZoom(location ? 14 : DEFAULT_ZOOM);

    const sv = map.getStreetView();
    sv.addListener('visible_changed', () => {
      setStreetViewVisible(sv.getVisible());
    });
  }, []); // stable — captures nothing, uses refs/defaults

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  async function handleMapClick(e) {
    if (!showPinDrop || !onPinDrop) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await reverseGeocode(lat, lng);
    onPinDrop({ latitude: lat, longitude: lng, address });
  }

  async function handlePinDragEnd(e, index) {
    if (!onPinDrop) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await reverseGeocode(lat, lng);
    onPinDrop({ latitude: lat, longitude: lng, address }, index);
  }

  function flyToCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Flag to prevent geocode fallback running at the same time as onPlaceChanged
  const placeSelectedRef = useRef(false);

  function handlePlaceSelected() {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    placeSelectedRef.current = true;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(15);
    setSearchPin({ lat, lng });
    // Reset flag after this tick
    setTimeout(() => { placeSelectedRef.current = false; }, 0);
  }

  // Geocode fallback when user presses Enter without picking from dropdown
  async function handleSearchKeyDown(e) {
    if (e.key !== 'Enter') return;
    // Wait a tick so onPlaceChanged fires first if it's going to
    await new Promise(r => setTimeout(r, 50));
    if (placeSelectedRef.current) return;
    const query = e.target.value?.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`
      );
      const data = await res.json();
      const result = data.results?.[0];
      if (!result?.geometry?.location) return;
      const { lat, lng } = result.geometry.location;
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(15);
      setSearchPin({ lat, lng });
    } catch {
      // silent fail
    }
  }

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : DEFAULT_CENTER;

  if (!isLoaded) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#5F5E5A' }}>Loading map…</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Floating Places Autocomplete — hidden during street view */}
      {!streetViewVisible && (
        <div style={searchBarStyle}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>🔍</span>
          <Autocomplete
            onLoad={(ac) => { autocompleteRef.current = ac; }}
            onPlaceChanged={handlePlaceSelected}
            options={{ types: ['geocode', 'establishment'] }}
          >
            <input
              type="text"
              placeholder="Search a location…"
              style={searchInputStyle}
              onKeyDown={handleSearchKeyDown}
            />
          </Autocomplete>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={showPinDrop ? handleMapClick : undefined}
        cursor={showPinDrop ? 'crosshair' : undefined}
      >
        {/* User GPS position */}
        {location && (
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            title="You are here"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* Search result — dropped pin shape, click to dismiss */}
        {searchPin && (
          <Marker
            position={{ lat: searchPin.lat, lng: searchPin.lng }}
            title="Dropped pin — click to dismiss"
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
                  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26S32 28 32 16C32 7.16 24.84 0 16 0z" fill="#E8734A"/>
                  <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
                </svg>`
              )}`,
              scaledSize: { width: 32, height: 42 },
              anchor: { x: 16, y: 42 },
            }}
            onClick={() => setSearchPin(null)}
          />
        )}

        {/* Read-only hunt markers — forest green pins, clickable */}
        {markers.map((m, i) => (
          <Marker
            key={m.id ?? i}
            position={{ lat: m.latitude, lng: m.longitude }}
            title={m.title}
            onClick={() => onMarkerPress?.(m)}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
                  <path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 25 15 25S30 26.25 30 15C30 6.72 23.28 0 15 0z" fill="#1A3C34"/>
                  <circle cx="15" cy="15" r="6" fill="white" opacity="0.9"/>
                </svg>`
              )}`,
              scaledSize: { width: 30, height: 40 },
              anchor: { x: 15, y: 40 },
            }}
          />
        ))}

        {/* Draggable checkpoint pins (Create page) */}
        {droppedPins.map((pin, i) => (
          <Marker
            key={`pin-${i}`}
            position={{ lat: pin.latitude, lng: pin.longitude }}
            draggable
            onDragEnd={(e) => handlePinDragEnd(e, i)}
            onClick={() => setActivePin(activePin === i ? null : i)}
            label={{ text: `${i + 1}`, color: '#fff', fontWeight: 'bold', fontSize: '13px' }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
                  <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#E8734A"/>
                  <circle cx="18" cy="18" r="10" fill="white" opacity="0.9"/>
                </svg>
              `)}`,
              scaledSize: { width: 36, height: 44 },
              anchor: { x: 18, y: 44 },
            }}
          >
            {activePin === i && (
              <InfoWindow onCloseClick={() => setActivePin(null)}>
                <div style={infoBubbleStyle}>
                  <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 13, color: '#1C1C1A' }}>
                    Checkpoint {i + 1}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#5F5E5A', maxWidth: 220 }}>
                    {pin.address}
                  </p>
                  {onPinRemove && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPinRemove(i); setActivePin(null); }}
                      style={removeButtonStyle}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>

      {/* Current location button — bottom-left, clear of Google's controls */}
      {!streetViewVisible && (
        <button
          onClick={flyToCurrentLocation}
          disabled={locating}
          title="Fly to my current location"
          style={locateBtnStyle(locating)}
        >
          {locating ? '…' : '◎'}
        </button>
      )}

      {/* Hint overlay when pin-drop mode is active and no pins yet */}
      {showPinDrop && droppedPins.length === 0 && (
        <div style={hintStyle} onClick={(e) => e.stopPropagation()}>
          <span>📍 Click the map to drop a checkpoint</span>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: 400,
  position: 'relative',
};

const searchBarStyle = {
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  width: 340,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.97)',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  padding: '10px 14px',
  gap: 8,
};

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: 15,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#1C1C1A',
  backgroundColor: 'transparent',
  width: '100%',
  minWidth: 0,
};

const infoBubbleStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  padding: '4px 2px',
};

function locateBtnStyle(locating) {
  return {
    position: 'absolute',
    bottom: 120,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    cursor: locating ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: locating ? '#9CA3AF' : '#1A3C34',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    fontFamily: 'system-ui, sans-serif',
  };
}

const removeButtonStyle = {
  border: 'none',
  background: '#E8734A',
  color: '#fff',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const hintStyle = {
  position: 'absolute',
  bottom: 80,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  backgroundColor: 'rgba(255,255,255,0.92)',
  borderRadius: 10,
  padding: '10px 18px',
  fontSize: 13,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 600,
  color: '#1C1C1A',
  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
};
