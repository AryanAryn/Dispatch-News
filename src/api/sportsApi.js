/**
 * TheSportsDB API wrapper.
 *
 * Free public key: "3"  →  https://www.thesportsdb.com/api/v1/json/3/
 * Set VITE_SPORTSDB_KEY in .env for a paid key.
 *
 * Vite dev-server proxies  /sportsdb  →  https://www.thesportsdb.com
 * so CORS is handled in development.
 */

const KEY = import.meta.env.VITE_SPORTSDB_KEY ?? '3';
// Dev: use Vite proxy; Production: call TheSportsDB directly (CORS-open endpoint).
const BASE = import.meta.env.DEV
    ? `/sportsdb/api/v1/json/${KEY}`
    : `https://www.thesportsdb.com/api/v1/json/${KEY}`;

// ─── Simple cache ─────────────────────────────────────────────────────────────
const _cache = new Map();

async function cachedFetch(url) {
    if (_cache.has(url)) return _cache.get(url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TheSportsDB ${res.status}`);
    const data = await res.json();
    _cache.set(url, data);
    setTimeout(() => _cache.delete(url), 5 * 60 * 1000);
    return data;
}

// ─── Well-known league IDs ────────────────────────────────────────────────────
export const LEAGUES = [
    { id: 4328, name: 'Premier League', sport: 'soccer' },
    { id: 4480, name: 'Champions League', sport: 'soccer' },
    { id: 4387, name: 'NBA', sport: 'basketball' },
    { id: 4391, name: 'NFL', sport: 'football' },
    { id: 4424, name: 'MLB', sport: 'baseball' },
];

// ─── API calls ────────────────────────────────────────────────────────────────

/** Fetch the last ≤15 completed events for a league */
export async function fetchRecentEvents(leagueId) {
    const data = await cachedFetch(`${BASE}/eventspastleague.php?id=${leagueId}`);
    return (data.events ?? []).filter(Boolean);
}

/** Fetch the next ≤5 upcoming events for a league */
export async function fetchNextEvents(leagueId) {
    const data = await cachedFetch(`${BASE}/eventsnextleague.php?id=${leagueId}`);
    return (data.events ?? []).filter(Boolean);
}

/**
 * Text-search events by team / tournament name.
 * Returns [] rather than throwing on no-match responses.
 */
export async function searchEvents(query) {
    if (!query) return [];
    const data = await cachedFetch(
        `${BASE}/searchevents.php?e=${encodeURIComponent(query)}`
    );
    return (data.event ?? []).filter(Boolean);
}
