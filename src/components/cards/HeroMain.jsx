import { CardMeta } from './CardMeta';

export function HeroMain({ article, onOpen }) {
    if (!article) return null;
    return (
        <div className="hero-main" onClick={() => onOpen(article)}>
            {article.urlToImage && (
                <img
                    src={article.urlToImage}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            )}
            <div className="card-body">
                <CardMeta source={article.source?.name} time={article.publishedAt} />
                <div className="card-title">{article.title}</div>
                {article.description && (
                    <div className="card-desc">{article.description}</div>
                )}
            </div>
        </div>
    );
}
