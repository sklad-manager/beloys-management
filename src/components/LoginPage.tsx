'use client';

import { useState } from 'react';

interface LoginPageProps {
    onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Неверный пароль');
            }
        } catch (err) {
            setError('Ошибка подключения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        Belous <span className="text-gradient">Management</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Введите пароль для входа</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            autoFocus
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: error ? '1px solid #f87171' : '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            borderRadius: '8px',
                            color: '#f87171',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                }}>
                    🔒 Защищенный доступ
                </div>
            </div>
        </div>
    );
}
