import { ScoreCard } from './ScoreCard';

/**
 * ScoresBand – horizontally-scrollable strip of score cards.
 *
 * Props:
 *   events   – array of TheSportsDB events
 *   title    – section label
 *   note     – right-side annotation (e.g. "Today · Yesterday")
 */
export function ScoresBand({ events, title = 'Scores & Results', note = 'Today · Recent' }) {
    if (!events || !events.length) return null;

    return (
        <div className="scores-band">
            <div className="scores-band-header">
                <span className="scores-band-title">{title}</span>
                <span className="scores-band-note">{note}</span>
            </div>
            <div className="scores-scroll">
                {events.map((e) => (
                    <ScoreCard key={e.idEvent} event={e} />
                ))}
            </div>
        </div>
    );
}
