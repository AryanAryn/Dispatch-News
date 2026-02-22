/**
 * Recommendation engine for The Dispatch.
 *
 * Approach:
 *  1. Extract named entities as multi-word phrases (preserving context) and
 *     single high-signal nouns using `compromise` NLP
 *  2. Build a weighted interest profile from reading history with
 *     exponential recency decay (half-life 3 days)
 *  3. Score candidate articles via TF-IDF: term frequency in the article
 *     multiplied by log-inverse-document-frequency across the whole candidate pool
 *  4. Apply source-diversity penalty so the same outlet doesn't dominate
 *  5. Return sorted articles; untouched pass-through when history is empty
 */

import nlp from 'compromise';

// Generic words that carry no signal — verbs, prepositions, determiners, conjunctions
const STOP = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'this', 'that', 'these',
    'those', 'it', 'its', 'as', 'but', 'not', 'or', 'and', 'so', 'yet', 'after', 'before',
    'when', 'where', 'who', 'which', 'how', 'what', 'says', 'said', 'year', 'over',
    'more', 'about', 'also', 'than', 'into', 'up', 'out', 'can', 'now', 'then',
    'here', 'there', 'just', 'even', 'still', 'only', 'well', 'back', 'same',
    'between', 'during', 'while', 'say', 'report', 'reports', 'according', 'amid',
    'around', 'including', 'across', 'against', 'without', 'within', 'make', 'take',
    'come', 'goes', 'going', 'time', 'show', 'shows', 'percent', 'week', 'month',
    'today', 'following', 'number', 'part', 'way', 'days', 'years', 'weeks',
    'months', 'since', 'being', 'both', 'each', 'other', 'than', 'because',
    'through', 'after', 'such', 'some', 'many', 'much', 'very', 'most', 'few',
    // Number words — common in news headlines, zero signal
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'hundred', 'thousand', 'million', 'billion', 'trillion',
    'first', 'second', 'third', 'fourth', 'fifth', 'last', 'next',
    // Generic news adjectives — appear everywhere, distinguish nothing
    'new', 'old', 'high', 'good', 'big', 'top', 'key', 'main', 'major', 'large',
    'small', 'long', 'short', 'full', 'open', 'free', 'late', 'early', 'former',
    'senior', 'junior', 'local', 'global', 'national', 'international', 'federal',
    'public', 'private', 'political', 'military', 'economic', 'social', 'official',
    // Generic role nouns — meaningful only as part of a proper name
    'president', 'minister', 'secretary', 'general', 'colonel', 'director', 'chief',
    'head', 'leader', 'chairman', 'governor', 'senator', 'congressman', 'representative',
    'officer', 'commander', 'judge', 'attorney', 'spokesman', 'spokesperson', 'aide',
    // News-jargon noise
    'news', 'report', 'source', 'sources', 'statement', 'conference', 'comments',
    'comment', 'response', 'claim', 'claims', 'plan', 'plans', 'move', 'deal',
    'talks', 'vote', 'bill', 'court', 'case', 'trial', 'poll', 'data', 'study',
]);

/**
 * Extract meaningful terms from a string.
 *
 * Strategy:
 *  - Named entities (people, places, orgs, topics) are kept as PHRASES so
 *    "Donald Trump" → "donald trump" (not split into ["donald", "trump"]).
 *    This preserves context and prevents standalone role words from floating free.
 *  - Single-word nouns require ≥5 chars to clear common noise (avoids "four",
 *    "aide", "deal", etc. that slip past the stop list).
 *  - All tokens are deduplicated; sub-terms already covered by a phrase are dropped.
 */
export function extractTerms(text) {
    if (!text) return [];
    const doc = nlp(text);

    // Named entity phrases — kept whole, lowercased
    const phrases = [
        ...doc.people().out('array'),
        ...doc.places().out('array'),
        ...doc.organizations().out('array'),
        ...doc.topics().out('array'),
    ].map(p => p.toLowerCase().replace(/[^a-z0-9' -]/g, '').trim())
        .filter(p => p.length > 2);

    // Split phrases into individual clean tokens for stop-word filtering
    const phraseTokens = new Set(
        phrases.flatMap(p => p.split(/\s+/))
    );

    // Single-word nouns NOT already covered by a named-entity phrase
    // Require ≥5 chars to cut noise like "deal", "aide", "four"
    const soloNouns = doc.nouns().out('array')
        .map(n => n.toLowerCase().replace(/[^a-z0-9'-]/g, '').trim())
        .filter(n => n.length >= 5 && !STOP.has(n) && !phraseTokens.has(n));

    // Combine: multi-word phrases first, then remaining solo nouns
    const all = [
        ...phrases.filter(p => {
            const parts = p.split(/\s+/);
            // Keep multi-word phrases unconditionally; single-word phrases need ≥5 chars
            return parts.length > 1
                ? parts.every(w => !STOP.has(w))
                : p.length >= 5 && !STOP.has(p);
        }),
        ...soloNouns,
    ];

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
export function buildProfile(history, suppressed = new Set()) {
    const profile = {};
    for (const item of history) {
        const w = recencyWeight(item.ts);
        const terms = item.terms ?? extractTerms(`${item.title} ${item.description ?? ''}`);
        for (const term of terms) {
            if (suppressed.has(term)) continue;
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
export function rankArticles(articles, history, suppressed = new Set()) {
    if (!history.length) return articles;

    const profile = buildProfile(history, suppressed);
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

/** Top interest labels for display */
export function topInterests(history, suppressed = new Set(), limit = 6) {
    const profile = buildProfile(history, suppressed);
    return Object.entries(profile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([term]) => term);
}

// ── Semantic (embedding-based) ranking ────────────────────────────────────────

/** Cosine similarity between two equal-length vectors */
export function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Average the embedding vectors of the 30 most recently read articles
 * into a single "user taste" profile vector.
 * Returns null when no read articles have cached vectors yet.
 */
export function buildSemanticProfile(history, vectorCache) {
    const vecs = history.slice(0, 30)
        .map(h => vectorCache[h.url])
        .filter(Boolean);
    if (!vecs.length) return null;
    const dim = vecs[0].length;
    const profile = new Array(dim).fill(0);
    for (const v of vecs) {
        for (let i = 0; i < dim; i++) profile[i] += v[i];
    }
    for (let i = 0; i < dim; i++) profile[i] /= vecs.length;
    return profile;
}

/**
 * Rank articles using a blend of semantic cosine similarity and TF-IDF.
 *
 * Blend weights (when both signals are available):
 *   70% semantic cosine similarity  — understands meaning, not just keywords
 *   30% TF-IDF                      — ensures topic labels still have influence
 *
 * Graceful degradation:
 *   - No profile vectors at all  → pure TF-IDF (identical to rankArticles)
 *   - Some articles lack vectors → those score on TF-IDF alone (discounted)
 *   - No reading history         → original order pass-through
 */
export function rankArticlesSemantic(articles, history, vectorCache = {}, suppressed = new Set()) {
    if (!history.length) return articles;

    const profile = buildProfile(history, suppressed);
    const semanticProfile = buildSemanticProfile(history, vectorCache);
    const hasSemantic = Boolean(semanticProfile);
    const hasTfidf = Object.keys(profile).length > 0;

    if (!hasSemantic && !hasTfidf) return articles;

    const idfCache = {};

    const scored = articles.map(a => {
        const tfidfRaw = hasTfidf ? score(a, profile, articles, idfCache) : 0;
        const semanticRaw = (hasSemantic && vectorCache[a.url])
            ? cosineSimilarity(vectorCache[a.url], semanticProfile)
            : null;
        return { ...a, _tfidf: tfidfRaw, _semantic: semanticRaw };
    });

    // Normalise TF-IDF scores to 0–1 range
    const maxTf = Math.max(...scored.map(a => a._tfidf), 1);

    const blended = scored.map(a => {
        const normTf = a._tfidf / maxTf;
        let blendedScore;
        if (a._semantic !== null) {
            blendedScore = 0.7 * a._semantic + 0.3 * normTf;
        } else if (hasSemantic) {
            // Profile exists but this article has no vector yet — discount it
            blendedScore = 0.3 * normTf;
        } else {
            // No semantic signals — pure TF-IDF
            blendedScore = normTf;
        }
        return { ...a, _blended: blendedScore };
    });

    blended.sort((a, b) => b._blended - a._blended);

    // Source-diversity re-ranking (22% penalty per repeat source)
    const sourceSeen = {};
    return blended
        .map(a => {
            const src = a.source?.name ?? 'unknown';
            const n = sourceSeen[src] ?? 0;
            sourceSeen[src] = n + 1;
            return { ...a, _final: a._blended * Math.pow(0.78, n) };
        })
        .sort((a, b) => b._final - a._final);
}
