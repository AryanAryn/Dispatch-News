/**
 * ScoreCard – compact result/fixture card for TheSportsDB events.
 *
 * Expected shape of `event` — from TheSportsDB v1 eventspastleague / eventsnextleague:
 *   idEvent, strHomeTeam, strAwayTeam, intHomeScore, intAwayScore,
 *   dateEvent, strTime, strStatus, strLeague, _leagueName, _sport
 */
export function ScoreCard({ event }) {
    const hasScore =
        event.intHomeScore !== null &&
        event.intHomeScore !== '' &&
        event.intHomeScore !== undefined;

    const dateStr = event.dateEvent
        ? new Date(event.dateEvent).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        : '';

    const timeStr = event.strTime
        ? event.strTime.slice(0, 5) // "HH:MM"
        : '';

    const statusLine = hasScore
        ? (event.strStatus ?? 'Final')
        : [dateStr, timeStr].filter(Boolean).join(' · ');

    return (
        <div className="score-card">
            <div className="score-league">{event._leagueName ?? event.strLeague}</div>
            <div className="score-teams">
                <span className={`score-team${event.intHomeScore > event.intAwayScore && hasScore ? ' score-winner' : ''}`}>
                    {event.strHomeTeam}
                </span>
                <span className="score-vs">
                    {hasScore
                        ? `${event.intHomeScore} – ${event.intAwayScore}`
                        : 'vs'}
                </span>
                <span className={`score-team${event.intAwayScore > event.intHomeScore && hasScore ? ' score-winner' : ''}`}>
                    {event.strAwayTeam}
                </span>
            </div>
            <div className="score-status">{statusLine}</div>
        </div>
    );
}
