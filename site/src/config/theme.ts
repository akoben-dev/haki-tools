// The site's live colour theme. Chosen 2026-11-19: 11, Tidewater & Gold.
// To switch, change DEFAULT_THEME_ID to another id from themes.json.
// The other themes stay available for testing on any build via ?themes=1.
import themes from './themes.json';

export const DEFAULT_THEME_ID = 'tide-gold';
export const defaultTheme = themes.find((t) => t.id === DEFAULT_THEME_ID) ?? themes[0];
