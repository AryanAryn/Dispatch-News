import { CardMeta } from './CardMeta';

export function ColCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <article
            className="col-card"
            tabIndex="0"
            aria-label={article.title}
            onClick={() => onOpen(article)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(article); } }}
        >
            <CardMeta source={article.source?.name} time={article.publishedAt} />
            <h3 className="card-title">{article.title}</h3>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
        </article>
    );
}
