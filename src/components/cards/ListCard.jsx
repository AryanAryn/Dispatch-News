import { CardMeta } from './CardMeta';

export function ListCard({ article, onOpen }) {
    if (!article) return null;
    return (
        <div
            className="list-card"
            style={!article.urlToImage ? { gridTemplateColumns: '1fr' } : undefined}
            onClick={() => onOpen(article)}
        >
            <div>
                <CardMeta source={article.source?.name} time={article.publishedAt} />
                <div className="card-title">{article.title}</div>
                {article.description && (
                    <div className="card-desc">{article.description}</div>
                )}
            </div>
            {article.urlToImage && (
                <img
                    src={article.urlToImage}
                    alt=""
                    onError={(e) => {
                        e.target.parentElement.style.gridTemplateColumns = '1fr';
                        e.target.style.display = 'none';
                    }}
                />
            )}
        </div>
    );
}
