import { useEffect, useRef } from 'react';

// Publisher ID is set directly in index.html <script> and mirrored here for
// the data-ad-client attribute on each <ins> tag.
const PUB_ID = 'ca-pub-4943024009014829';

/**
 * AdUnit – wrapper for a single Google AdSense `<ins>` placement.
 *
 * Usage:  <AdUnit slot="1234567890" />
 *
 * Replace the `slot` prop value with your real ad unit slot ID from
 * the AdSense dashboard. The component silently no-ops when an ad
 * blocker is active.
 */
export function AdUnit({ slot, format = 'auto', className = '' }) {
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        pushed.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // ad blocker or not yet loaded — silently ignore
        }
    }, []);

    return (
        <div className={`ad-unit ${className}`.trim()}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={PUB_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
