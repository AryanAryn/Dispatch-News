import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStoredKey } from '../api/newsApi';
import { NEWS_BASE } from '../config.js';

export function AuthPage({ onSave }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [testing, setTesting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = key.trim();
        if (!trimmed) { setError('Please enter your API key.'); return; }
        if (!/^[0-9a-f]{32}$/i.test(trimmed)) {
            setError("That doesn't look like a valid NewsAPI key (32-character hex string).");
            return;
        }

        const canValidateLive = import.meta.env.DEV || Boolean(import.meta.env.VITE_PROXY_URL);
        if (canValidateLive) {
            setTesting(true);
            setError('');
            try {
                const res = await fetch(
                    `${NEWS_BASE}/top-headlines?language=en&pageSize=1`,
                    { headers: { 'X-Api-Key': trimmed } }
                );
                let data;
                try { data = await res.json(); } catch {
                    throw new Error('Unexpected response — proxy may not be reachable.');
                }
                if (data.status !== 'ok') throw new Error(data.message ?? 'Invalid key');
            } catch (err) {
                setError(err.message ?? 'Could not validate key — check it and try again.');
                setTesting(false);
                return;
            } finally {
                setTesting(false);
            }
        }

        setStoredKey(trimmed);
        onSave();
        navigate('/', { replace: true });
    }

    return (
        <div className="auth-page">
            <div className="auth-logo">The Dispatch</div>

            <div className="auth-card">
                <p className="auth-desc">
                    Enter your free{' '}
                    <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer">
                        NewsAPI key
                    </a>{' '}
                    to get started. Your key is stored only in your browser — it never leaves your device.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-row">
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Paste your NewsAPI key…"
                            autoFocus
                            spellCheck={false}
                        />
                        <button type="submit" disabled={testing}>
                            {testing ? 'Checking…' : 'Save key'}
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                </form>

                <p className="auth-hint">
                    Don't have a key?{' '}
                    <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer">
                        Register free at newsapi.org
                    </a>{' '}
                    — takes 30 seconds.
                </p>
            </div>
        </div>
    );
}
