const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;

// In development the Vite dev-server proxies /newsapi → https://newsapi.org.
// In production (GitHub Pages / any static host) we call the API directly.
// Note: NewsAPI requires server-side calls for production; set up a proxy or
// serverless function if you hit CORS errors after deploying.
const BASE = import.meta.env.DEV
    ? '/newsapi/v2'
    : 'https://newsapi.org/v2';

function buildUrl(path, params) {
    const url = new URL(BASE + path, window.location.origin);
    Object.entries({ ...params, apiKey: API_KEY }).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
}

async function request(url) {
    const res = await fetch(url);
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

export function hasApiKey() {
    return Boolean(API_KEY && API_KEY !== 'your_newsapi_key_here');
}
