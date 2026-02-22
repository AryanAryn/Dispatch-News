import { useState, useEffect } from 'react';
import { fetchRecentEvents, fetchNextEvents, LEAGUES } from '../api/sportsApi';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isRecent(dateStr, maxAgeDays) {
    if (!dateStr) return false;
    return Date.now() - new Date(dateStr).getTime() < maxAgeDays * ONE_DAY_MS;
}

/**
 * Fetch recent + upcoming sports events across all featured leagues.
 *
 * @param {object}  opts
 * @param {number}  opts.maxAgeDays  – only return past events this many days old (default 1)
 * @param {boolean} opts.includeNext – also fetch next upcoming events (default false)
 */
export function useSports({ maxAgeDays = 1, includeNext = false } = {}) {
    const [recent, setRecent] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const recentResults = await Promise.allSettled(
                    LEAGUES.map((l) =>
                        fetchRecentEvents(l.id).then((evs) =>
                            evs.map((e) => ({
                                ...e,
                                _leagueName: l.name,
                                _sport: l.sport,
                            }))
                        )
                    )
                );

                const nextResults = includeNext
                    ? await Promise.allSettled(
                        LEAGUES.map((l) =>
                            fetchNextEvents(l.id).then((evs) =>
                                evs.map((e) => ({
                                    ...e,
                                    _leagueName: l.name,
                                    _sport: l.sport,
                                }))
                            )
                        )
                    )
                    : [];

                if (cancelled) return;

                const recentAll = recentResults
                    .filter((r) => r.status === 'fulfilled')
                    .flatMap((r) => r.value)
                    .filter((e) => isRecent(e.dateEvent, maxAgeDays))
                    .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent));

                const nextAll = nextResults
                    .filter((r) => r.status === 'fulfilled')
                    .flatMap((r) => r.value)
                    .sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent));

                setRecent(recentAll);
                setUpcoming(nextAll);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [maxAgeDays, includeNext]);

    return { recent, upcoming, loading, error };
}
