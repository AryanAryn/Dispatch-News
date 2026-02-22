import { fmtTime } from '../../utils/time';

export function CardMeta({ source, time }) {
    return (
        <>
            {source && <div className="card-meta">{source}</div>}
            {time && <div className="card-time">{fmtTime(time)}</div>}
        </>
    );
}
