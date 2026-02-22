// ─── App-wide configuration constants ────────────────────────────────────────

// ── Site identity — update these when forking ────────────────────────────────
export const SITE_NAME = 'The Dispatch';
export const SITE_OWNER = 'Aryan';
/** GitHub repository URL */
export const GITHUB_REPO = 'https://github.com/AryanAryn/Dispatch-News';
/** GitHub profile URL */
export const GITHUB_PROFILE = 'https://github.com/AryanAryn';
/** Contact email address */
export const CONTACT_EMAIL = 'mr.aryan.aoa@gmail.com';

// ── Google AdSense ───────────────────────────────────────────────────────────
export const ADSENSE_PUB_ID = 'ca-pub-4943024009014829';

// ── NewsAPI ──────────────────────────────────────────────────────────────────
/** localStorage key where the user's NewsAPI key is stored */
export const NEWS_LS_KEY = 'dispatch_newsapi_key';

/** localStorage key where reading history is stored */
export const HISTORY_LS_KEY = 'dispatch_history';

/**
 * NewsAPI base URL.
 * Dev:  Vite's dev-server proxy forwards /newsapi → newsapi.org (no CORS).
 * Prod: Cloudflare Worker CORS proxy URL supplied via VITE_PROXY_URL.
 */
export const NEWS_BASE = import.meta.env.DEV
    ? '/newsapi/v2'
    : `${import.meta.env.VITE_PROXY_URL ?? ''}/v2`;

// ── TheSportsDB ──────────────────────────────────────────────────────────────
/** API key — free public key is "3"; override with VITE_SPORTSDB_KEY */
export const SPORTS_KEY = import.meta.env.VITE_SPORTSDB_KEY ?? '3';

/**
 * TheSportsDB base URL.
 * Dev:  Vite proxy forwards /sportsdb → thesportsdb.com (no CORS).
 * Prod: Call TheSportsDB directly — its endpoint is CORS-open for free keys.
 */
export const SPORTS_BASE = import.meta.env.DEV
    ? `/sportsdb/api/v1/json/${SPORTS_KEY}`
    : `https://www.thesportsdb.com/api/v1/json/${SPORTS_KEY}`;

/** Well-known league IDs tracked in the scores band */
export const LEAGUES = [
    { id: 4328, name: 'Premier League', sport: 'soccer' },
    { id: 4480, name: 'Champions League', sport: 'soccer' },
    { id: 4387, name: 'NBA', sport: 'basketball' },
    { id: 4391, name: 'NFL', sport: 'football' },
    { id: 4424, name: 'MLB', sport: 'baseball' },
];

/**
 * Navigation sections — maps URL slug → display label → NewsAPI category key.
 * URL:  news.aryanaryn.me/#/technology
 * slug: 'technology'  label: 'Technology'  apiKey: 'technology'
 * 'world' maps to NewsAPI 'general'; 'culture' maps to 'entertainment'.
 */
export const NAV_SECTIONS = [
    { slug: 'home', label: 'Home', apiKey: 'home' },
    { slug: 'world', label: 'World', apiKey: 'general' },
    { slug: 'business', label: 'Business', apiKey: 'business' },
    { slug: 'technology', label: 'Technology', apiKey: 'technology' },
    { slug: 'science', label: 'Science', apiKey: 'science' },
    { slug: 'health', label: 'Health', apiKey: 'health' },
    { slug: 'sports', label: 'Sports', apiKey: 'sports' },
    { slug: 'culture', label: 'Culture', apiKey: 'entertainment' },
];
