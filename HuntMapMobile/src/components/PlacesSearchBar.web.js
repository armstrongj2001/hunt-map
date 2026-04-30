import React, { useEffect, useRef } from 'react';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Loads the Google Maps JS API script once and calls back when ready
function loadGoogleMapsScript(callback) {
  if (window.google?.maps?.places) {
    callback();
    return;
  }
  if (document.querySelector('#google-maps-script')) {
    // Script tag exists but not loaded yet — wait for it
    window.__onGoogleMapsLoaded = callback;
    return;
  }
  window.__onGoogleMapsLoaded = callback;
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=__onGoogleMapsLoaded`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export default function PlacesSearchBar({ onPlaceSelected, placeholder = 'Search places...' }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript(initAutocomplete);
  }, []);

  function initAutocomplete() {
    if (!inputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      // Bias results toward the map's current visible area
      types: ['geocode', 'establishment'],
    });

    // When the user picks a suggestion, extract lat/lng and call back
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry?.location) return;
      onPlaceSelected({
        latitude:  place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        name:      place.name || place.formatted_address || '',
      });
    });
  }

  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>🔍</span>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    padding: '10px 14px',
    gap: 8,
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1C1C1A',
    backgroundColor: 'transparent',
    width: '100%',
  },
};
