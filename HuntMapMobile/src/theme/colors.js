// HuntMap color system — sourced from the design brief
// Always import colors from here, never hardcode hex values in components

export const palette = {
  // Brand
  forest:    '#1A3C34',
  evergreen: '#2D6A4F',
  gold:      '#D4A847',
  campfire:  '#E8734A',

  // Neutrals
  parchment: '#F7F5F0',
  white:     '#FFFFFF',
  charcoal:  '#1C1C1A',
  slate:     '#5F5E5A',
  stone:     '#B4B2A9',
  sand:      '#D6D3CB',

  // Semantic
  trailBlue:    '#3B82F6',
  successGreen: '#22C55E',
  warningAmber: '#F59E0B',
  errorRed:     '#EF4444',
};

export const lightTheme = {
  // Backgrounds
  background:     palette.parchment,
  surface:        palette.white,
  surfaceAlt:     palette.parchment,
  navBackground:  palette.white,
  sidebarBg:      palette.forest,

  // Text
  textPrimary:    palette.charcoal,
  textSecondary:  palette.slate,
  textInverse:    palette.white,
  textOnBrand:    palette.white,

  // Brand
  primary:        palette.forest,
  secondary:      palette.evergreen,
  accent:         palette.gold,
  cta:            palette.campfire,

  // Borders
  border:         palette.sand,
  borderStrong:   palette.stone,

  // Semantic
  success:        palette.successGreen,
  warning:        palette.warningAmber,
  error:          palette.errorRed,
  info:           palette.trailBlue,

  // Map pins
  pinDefault:     palette.evergreen,
  pinActive:      palette.campfire,
  pinCompleted:   palette.gold,
  pinPlayer:      palette.trailBlue,

  // Tab bar
  tabActive:      palette.evergreen,
  tabInactive:    palette.stone,
  tabBorder:      palette.sand,
};

export const darkTheme = {
  // Backgrounds
  background:     '#1C1C1A',
  surface:        '#2C2C2A',
  surfaceAlt:     '#3C3C3A',
  navBackground:  '#2C2C2A',
  sidebarBg:      '#0F1F1B',

  // Text
  textPrimary:    '#F5F5F3',
  textSecondary:  '#A8A8A4',
  textInverse:    palette.charcoal,
  textOnBrand:    palette.white,

  // Brand (same — they pop on dark)
  primary:        palette.forest,
  secondary:      palette.evergreen,
  accent:         palette.gold,
  cta:            palette.campfire,

  // Borders
  border:         '#3C3C3A',
  borderStrong:   '#5F5E5A',

  // Semantic
  success:        palette.successGreen,
  warning:        palette.warningAmber,
  error:          palette.errorRed,
  info:           palette.trailBlue,

  // Map pins (same)
  pinDefault:     palette.evergreen,
  pinActive:      palette.campfire,
  pinCompleted:   palette.gold,
  pinPlayer:      palette.trailBlue,

  // Tab bar
  tabActive:      palette.gold,
  tabInactive:    '#5F5E5A',
  tabBorder:      '#3C3C3A',
};
