import { useState, useEffect } from 'react';
import {
    fetchTopHeadlines,
    fetchCategory,
    fetchSearch,
} from '../api/newsApi';

/**
 * Fetch news articles for a given section or search query.
 * Returns { articles, loading, error }.
 */
export function useNews({ section, query }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetch = async () => {
            try {
                let data;
                if (section === 'search' && query) {
                    data = await fetchSearch(query);
                } else if (section === 'home') {
                    data = await fetchTopHeadlines();
                } else {
                    data = await fetchCategory(section);
                }
                if (!cancelled) {
                    setArticles(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message ?? 'Failed to load articles.');
                    setLoading(false);
                }
            }
        };

        fetch();
        return () => { cancelled = true; };
    }, [section, query]);

    return { articles, loading, error };
}
