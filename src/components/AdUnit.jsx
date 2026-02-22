import { useEffect, useRef } from 'react';

/**
 * AdUnit – wrapper for a single Google AdSense `<ins>` placement.
 *
 * Usage:
 *   <AdUnit slot="1234567890" />
 *
 * Setup:
 *   1. Add the AdSense <script> to index.html (already done).
 *   2. Set VITE_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX in .env
 *   3. Replace the `slot` prop value with your real ad unit slot ID.
 *
 * The component is safe to render even when an ad blocker is active;
 * the push() call is wrapped in try/catch.
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

    const pubId =
        import.meta.env.VITE_ADSENSE_PUB_ID ?? 'ca-pub-XXXXXXXXXXXXXXXXX';

    return (
        <div className={`ad-unit ${className}`.trim()}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={pubId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
