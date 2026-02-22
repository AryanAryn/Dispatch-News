import { fmtTime } from '../../utils/time';

export function EditorialCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <div className="editorial-card" onClick={() => onOpen(article)}>
            <div className="card-kicker">{article.source?.name ?? 'Analysis'}</div>
            <div className="card-title">{article.title}</div>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
            <div className="card-time">{fmtTime(article.publishedAt)}</div>
        </div>
    );
}
