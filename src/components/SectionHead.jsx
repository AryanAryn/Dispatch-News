export function SectionHead({ label, note }) {
    return (
        <div className="section-head">
            <h2>{label}</h2>
            <div className="rule" />
            {note && <span className="section-note">{note}</span>}
        </div>
    );
}
