import { useNavigate } from 'react-router-dom';
import { SITE_NAME, CONTACT_EMAIL } from '../config.js';
import { Masthead } from '../components/Masthead';

export function TermsPage() {
    const navigate = useNavigate();
    return (
        <>
            <Masthead
                activeSlug=""
                onNavigate={(slug) => navigate(slug === 'home' ? '/' : `/${slug}`)}
                onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />

            <div className="content-wrapper">
                <div className="static-page">
                    <h1 className="static-page-title">Terms of Service</h1>
                    <p className="static-page-meta">Effective February 22, 2026</p>

                    <section className="static-section">
                        <h2>§ 1 — Acceptance</h2>
                        <p>
                            By accessing or using {SITE_NAME} (“the Service”), you accept these Terms in full.
                            If you do not agree, do not use the Service.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 2 — Description of service</h2>
                        <p>
                            {SITE_NAME} aggregates publicly available news headlines from third-party APIs
                            (NewsAPI, TheSportsDB). All article content remains the property of its
                            original publisher. The Service provides links to source articles and does
                            not reproduce full article text.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 3 — Your API key</h2>
                        <p>
                            Use of the Service requires a valid{' '}
                            <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>{' '}
                            key obtained under NewsAPI’s own Terms of Service.
                            You are solely responsible for compliance with NewsAPI’s terms,
                            including applicable rate limits and attribution requirements.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 4 — Intellectual property</h2>
                        <p>
                            The app’s source code is released under the{' '}
                            <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.
                            Article content, images, and headlines displayed are © their respective publishers
                            and are shown for informational purposes only.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 5 — Disclaimer of warranties</h2>
                        <p className="static-allcaps">
                            The service is provided “as is” and “as available” without warranty of any kind,
                            express or implied, including but not limited to warranties of merchantability,
                            fitness for a particular purpose, or uninterrupted availability. We make no
                            representations regarding the accuracy or completeness of third-party news content.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 6 — Limitation of liability</h2>
                        <p className="static-allcaps">
                            To the maximum extent permitted by applicable law, we shall not be liable
                            for any indirect, incidental, special, exemplary, or consequential damages
                            arising out of or in connection with your use of the service.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 7 — Acceptable use</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>use the Service for any unlawful purpose;</li>
                            <li>circumvent, disable, or interfere with security features of the Service;</li>
                            <li>use the Service in violation of NewsAPI’s or TheSportsDB’s terms of service.</li>
                        </ul>
                    </section>

                    <section className="static-section">
                        <h2>§ 8 — Modifications</h2>
                        <p>
                            We may revise these Terms at any time. Continued use of the Service
                            after a change constitutes acceptance of the revised Terms.
                        </p>
                    </section>

                    <section className="static-section">
                        <h2>§ 9 — Contact</h2>
                        <p>
                            Questions regarding these Terms:{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                        </p>
                    </section>
                </div>
            </div>

            <footer>
                <div className="f-logo">{SITE_NAME}</div>
                <p>Powered by NewsAPI · All articles © their respective publishers</p>
                <nav className="footer-nav">
                    <a href="#/about">About</a>
                    <a href="#/contact">Contact</a>
                    <a href="#/privacy">Privacy policy</a>
                    <a href="#/terms">Terms of service</a>
                </nav>
            </footer>
        </>
    );
}
