import { NEWS_LS_KEY, NEWS_BASE, EMBED_VEC_LS_KEY } from '../config.js';

/** Key management — stored in localStorage, never in env vars */
export function getStoredKey() { return localStorage.getItem(NEWS_LS_KEY) ?? ''; }
export function setStoredKey(key) { localStorage.setItem(NEWS_LS_KEY, key.trim()); }
export function clearStoredKey() { localStorage.removeItem(NEWS_LS_KEY); }
export function hasApiKey() { return Boolean(getStoredKey()); }

const BASE = NEWS_BASE;

function buildUrl(path, params) {
    const url = new URL(BASE + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
}

async function request(url) {
    const res = await fetch(url, {
        headers: { 'X-Api-Key': getStoredKey() },
    });
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message ?? 'NewsAPI error');
    return (data.articles ?? []).filter(
        (a) => a.title && a.title !== '[Removed]' && a.url
    );
}

// Simple in-memory cache keyed by URL
const cache = new Map();

async function cachedFetch(url) {
    if (cache.has(url)) return cache.get(url);
    const articles = await request(url);
    cache.set(url, articles);
    // Expire cache after 5 minutes
    setTimeout(() => cache.delete(url), 5 * 60 * 1000);
    return articles;
}

export async function fetchTopHeadlines(page = 1) {
    const url = buildUrl('/top-headlines', { language: 'en', pageSize: 40, page });
    return cachedFetch(url);
}

export async function fetchCategory(category, page = 1) {
    const url = buildUrl('/top-headlines', {
        category,
        language: 'en',
        pageSize: 30,
        page,
    });
    return cachedFetch(url);
}

export async function fetchSearch(query, page = 1) {
    const url = buildUrl('/everything', {
        q: query,
        sortBy: 'relevancy',
        pageSize: 20,
        page,
        language: 'en',
    });
    return cachedFetch(url);
}

// ── Semantic embedding cache (localStorage) ─────────────────────────────────

const EMBED_BASE = import.meta.env.DEV
    ? null // CF AI not available locally; dev falls back to TF-IDF
    : (import.meta.env.VITE_PROXY_URL ?? null);

const EMBED_MAX_CACHED = 300; // max article vectors to keep in localStorage

function loadEmbedCache() {
    try { return JSON.parse(localStorage.getItem(EMBED_VEC_LS_KEY) ?? '{}'); }
    catch { return {}; }
}

function saveEmbedCache(cache) {
    const entries = Object.entries(cache);
    // Keep only the most recent N entries to avoid unbounded localStorage growth
    const trimmed = entries.length > EMBED_MAX_CACHED
        ? Object.fromEntries(entries.slice(entries.length - EMBED_MAX_CACHED))
        : Object.fromEntries(entries);
    try { localStorage.setItem(EMBED_VEC_LS_KEY, JSON.stringify(trimmed)); }
    catch { /* storage quota exceeded — skip silently */ }
}

/**
 * Fetch embedding vectors for articles not already in the local cache.
 * Fires against POST /embed on the CF Worker.
 * Returns the full url→vector map (cached + newly fetched).
 * Silently returns the cached-only map when the Worker URL isn't configured (dev).
 */
export async function fetchEmbeddings(articles) {
    const cache = loadEmbedCache();
    if (!EMBED_BASE) return cache;

    const uncached = articles.filter(a => a.url && !cache[a.url]);
    if (!uncached.length) return cache;

    // Process in batches of 25 (safe CF AI limit per call)
    for (let i = 0; i < uncached.length; i += 25) {
        const batch = uncached.slice(i, i + 25);
        try {
            const texts = batch.map(a =>
                `${a.title ?? ''} ${a.description ?? ''}`.slice(0, 512).trim()
            );
            const res = await fetch(`${EMBED_BASE}/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts }),
            });
            if (!res.ok) continue;
            const { vectors } = await res.json();
            batch.forEach((a, idx) => {
                if (vectors?.[idx]) cache[a.url] = vectors[idx];
            });
        } catch { /* network failure — skip batch, degrade gracefully */ }
    }

    saveEmbedCache(cache);
    return cache;
}
