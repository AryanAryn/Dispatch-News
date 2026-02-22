/**
 * Recommendation engine for The Dispatch.
 *
 * Approach:
 *  1. Extract named entities and noun phrases from article text using `compromise`
 *  2. Build a weighted interest profile from reading history with
 *     exponential recency decay (half-life 3 days)
 *  3. Score candidate articles via TF-IDF: term frequency in the article
 *     multiplied by log-inverse-document-frequency across the whole candidate pool
 *  4. Apply source-diversity penalty so the same outlet doesn't dominate
 *  5. Return sorted articles; untouched pass-through when history is empty
 */

import nlp from 'compromise';

// Words that carry no signal for interest matching
const STOP = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'this', 'that', 'these',
    'those', 'it', 'its', 'as', 'but', 'not', 'or', 'and', 'so', 'yet', 'after', 'before',
    'when', 'where', 'who', 'which', 'how', 'what', 'says', 'said', 'year', 'new', 'over',
    'more', 'about', 'also', 'than', 'into', 'up', 'out', 'can', 'one', 'two', 'three',
    'first', 'last', 'next', 'now', 'then', 'here', 'there', 'just', 'even', 'still',
    'only', 'well', 'back', 'good', 'high', 'old', 'same', 'between', 'during', 'while',
    'says', 'say', 'report', 'reports', 'according', 'amid', 'amid', 'around',
    'including', 'across', 'against', 'without', 'within',
]);

/** Extract meaningful terms from a string using NLP + fallback tokeniser */
export function extractTerms(text) {
    if (!text) return [];
    const doc = nlp(text);
    const named = [
        ...doc.people().out('array'),
        ...doc.places().out('array'),
        ...doc.organizations().out('array'),
        ...doc.topics().out('array'),
    ];
    const nouns = doc.nouns().out('array');
    const all = [...named, ...nouns]
        .flatMap(t => t.toLowerCase().split(/\s+/))
        .map(t => t.replace(/[^a-z0-9'-]/g, '').trim())
        .filter(t => t.length > 3 && !STOP.has(t));
    return [...new Set(all)];
}

/** Exponential decay weight — half-life of 3 days */
function recencyWeight(ts) {
    const ageDays = (Date.now() - ts) / 86_400_000;
    return Math.exp(-0.231 * ageDays); // ln(2) / 3
}

/**
 * Build a term → weight map from click history.
 * Each history entry: { title, description, ts, terms? }
 */
export function buildProfile(history) {
    const profile = {};
    for (const item of history) {
        const w = recencyWeight(item.ts);
        const terms = item.terms ?? extractTerms(`${item.title} ${item.description ?? ''}`);
        for (const term of terms) {
            profile[term] = (profile[term] ?? 0) + w;
        }
    }
    return profile;
}

/** Compute IDF for a term across the candidate pool */
function idf(term, articles) {
    const df = articles.reduce((n, a) => {
        const hay = `${a.title} ${a.description ?? ''}`.toLowerCase();
        return hay.includes(term) ? n + 1 : n;
    }, 0);
    return Math.log((articles.length + 1) / (df + 1)) + 1;
}

/** Score a single article against a profile */
function score(article, profile, articles, idfCache) {
    const text = `${article.title} ${article.description ?? ''}`;
    const terms = extractTerms(text);
    let s = 0;
    for (const term of terms) {
        if (!profile[term]) continue;
        if (!idfCache[term]) idfCache[term] = idf(term, articles);
        s += profile[term] * idfCache[term];
    }
    return s;
}

/**
 * Rank articles by personalised relevance with source diversity.
 * Falls back to original order when history is empty.
 */
export function rankArticles(articles, history) {
    if (!history.length) return articles;

    const profile = buildProfile(history);
    if (!Object.keys(profile).length) return articles;

    const idfCache = {};

    // Score every article
    const scored = articles.map(a => ({
        ...a,
        _score: score(a, profile, articles, idfCache),
    }));

    // First pass sort by raw score
    scored.sort((a, b) => b._score - a._score);

    // Second pass: source-diversity re-ranking
    // Each additional article from the same source gets a 22% penalty
    const sourceSeen = {};
    return scored
        .map(a => {
            const src = a.source?.name ?? 'unknown';
            const n = sourceSeen[src] ?? 0;
            sourceSeen[src] = n + 1;
            return { ...a, _final: a._score * Math.pow(0.78, n) };
        })
        .sort((a, b) => b._final - a._final);
}

/** Top interest labels for display (top 6 by weight) */
export function topInterests(history) {
    const profile = buildProfile(history);
    return Object.entries(profile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([term]) => term);
}
