import { createContext, useContext, useState, useCallback } from 'react';
import { extractTerms, topInterests } from '../utils/recommend';
import { HISTORY_LS_KEY } from '../config.js';

const PersonalizationContext = createContext(null);

export function PersonalizationProvider({ children }) {
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_LS_KEY) ?? '[]');
        } catch {
            return [];
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

    const interests = topInterests(history);

    return (
        <PersonalizationContext.Provider
            value={{ history, trackRead, clearHistory, interests }}
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
