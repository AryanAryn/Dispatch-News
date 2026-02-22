import { CardMeta } from './CardMeta';

export function ColCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <div className="col-card" onClick={() => onOpen(article)}>
            <CardMeta source={article.source?.name} time={article.publishedAt} />
            <div className="card-title">{article.title}</div>
            {article.description && (
                <div className="card-desc">{article.description}</div>
            )}
        </div>
    );
}
