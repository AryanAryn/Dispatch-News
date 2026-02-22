import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { extractTerms, topInterests } from '../utils/recommend';
import { HISTORY_LS_KEY, SUPPRESSED_LS_KEY } from '../config.js';

const PersonalizationContext = createContext(null);

export function PersonalizationProvider({ children }) {
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_LS_KEY) ?? '[]');
        } catch {
            return [];
        }
    });

    const [suppressedTerms, setSuppressedTerms] = useState(() => {
        try {
            const arr = JSON.parse(localStorage.getItem(SUPPRESSED_LS_KEY) ?? '[]');
            return new Set(arr);
        } catch {
            return new Set();
        }
    });

    /** Record a clicked article in history */
    const trackRead = useCallback((article) => {
        const terms = extractTerms(
            `${article.title ?? ''} ${article.description ?? ''}`
        );
        const entry = {
            title: article.title,
            description: article.description,
            source: article.source?.name,
            url: article.url,
            ts: Date.now(),
            terms,
        };
        setHistory((prev) => {
            const next = [entry, ...prev.filter((h) => h.url !== entry.url)].slice(
                0,
                120
            );
            localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    /** Remove all stored history */
    const clearHistory = useCallback(() => {
        localStorage.removeItem(HISTORY_LS_KEY);
        setHistory([]);
    }, []);

    /** Suppress a specific interest term from scoring and display */
    const suppressTerm = useCallback((term) => {
        setSuppressedTerms((prev) => {
            const next = new Set(prev);
            next.add(term);
            localStorage.setItem(SUPPRESSED_LS_KEY, JSON.stringify([...next]));
            return next;
        });
    }, []);

    /** Full reset — clears reading history and all suppressed terms */
    const clearAllRecommendations = useCallback(() => {
        localStorage.removeItem(HISTORY_LS_KEY);
        localStorage.removeItem(SUPPRESSED_LS_KEY);
        setHistory([]);
        setSuppressedTerms(new Set());
    }, []);

    const interests = useMemo(
        () => topInterests(history, suppressedTerms),
        [history, suppressedTerms]
    );

    return (
        <PersonalizationContext.Provider
            value={{ history, trackRead, clearHistory, interests, suppressedTerms, suppressTerm, clearAllRecommendations }}
        >
            {children}
        </PersonalizationContext.Provider>
    );
}

export function usePersonalization() {
    const ctx = useContext(PersonalizationContext);
    if (!ctx) throw new Error('usePersonalization must be inside PersonalizationProvider');
    return ctx;
}
