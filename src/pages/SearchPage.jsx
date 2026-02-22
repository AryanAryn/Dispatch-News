import { useState, useEffect } from 'react';
import { SectionHead } from '../components/SectionHead';
import { ListCard } from '../components/cards/ListCard';
import { ScoresBand } from '../components/sports/ScoresBand';
import { searchEvents } from '../api/sportsApi';

// Keywords that suggest a sports-related query
const SPORTS_TERMS = new Set([
    'sport', 'sports', 'football', 'soccer', 'basketball', 'baseball', 'nba', 'nfl',
    'mlb', 'premier', 'league', 'champions', 'championship', 'match', 'game', 'score',
    'goal', 'touchdown', 'playoffs', 'tournament', 'cup', 'fifa', 'nhl', 'hockey',
    'tennis', 'wimbledon', 'formula', 'f1', 'racing', 'golf', 'pga', 'ufc', 'boxing',
    'athlete', 'player', 'team', 'manager', 'coach', 'transfer', 'fixture', 'result',
]);

function isSportsQuery(q) {
    return q.toLowerCase().split(/\s+/).some((w) => SPORTS_TERMS.has(w));
}

export function SearchPage({ query, articles, onOpen }) {
    const [sportEvents, setSportEvents] = useState([]);

    useEffect(() => {
        if (!isSportsQuery(query)) {
            setSportEvents([]);
            return;
        }
        let cancelled = false;
        searchEvents(query)
            .then((evs) => { if (!cancelled) setSportEvents(evs.slice(0, 12)); })
            .catch(() => { if (!cancelled) setSportEvents([]); });
        return () => { cancelled = true; };
    }, [query]);

    return (
        <>
            <SectionHead
                label={`Results for "${query}"`}
                note={`${articles.length} stories`}
            />

            {/* Sports score results (when query looks sport-related) */}
            {sportEvents.length > 0 && (
                <div className="sports-search-section">
                    <SectionHead label="Match scores" note="From TheSportsDB" />
                    <ScoresBand events={sportEvents} title="" note="" />
                </div>
            )}

            {articles.length === 0 && (
                <p
                    style={{
                        fontFamily: 'var(--ui)',
                        fontSize: 14,
                        color: 'var(--mid)',
                        padding: '24px 0',
                    }}
                >
                    No results found.
                </p>
            )}
            <div className="article-list">
                {articles.map((a) => (
                    <ListCard key={a.url} article={a} onOpen={onOpen} />
                ))}
            </div>
        </>
    );
}

