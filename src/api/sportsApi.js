/**
 * TheSportsDB API wrapper.
 * Base URL and league list are configured in src/config.js.
 */

import { SPORTS_BASE, LEAGUES as _LEAGUES } from '../config.js';

export { _LEAGUES as LEAGUES };
const BASE = SPORTS_BASE;

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
