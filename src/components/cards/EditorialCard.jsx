import { fmtTime } from '../../utils/time';

export function EditorialCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <article
            className="editorial-card"
            tabIndex="0"
            aria-label={article.title}
            onClick={() => onOpen(article)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(article); } }}
        >
            <div className="card-kicker">{article.source?.name ?? 'Analysis'}</div>
            <h3 className="card-title">{article.title}</h3>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
            <div className="card-time">{fmtTime(article.publishedAt)}</div>
        </article>
    );
}
