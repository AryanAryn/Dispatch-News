import { NEWS_LS_KEY, NEWS_BASE } from '../config.js';

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
