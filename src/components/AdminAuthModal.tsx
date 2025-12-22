import React, { useState } from 'react';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded password for now
        if (password === '1234') {
            onSuccess();
            setPassword('');
            setError('');
        } else {
            setError('Неверный пароль');
        }
    };

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(8px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-secondary)',
        padding: '2.5rem',
        borderRadius: '24px',
        width: '340px',
        textAlign: 'center',
        border: '1px solid var(--border-highlight)',
        boxShadow: 'var(--shadow-lg)'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Админ-панель</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            outline: 'none',
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-sm)',
                            textAlign: 'center'
                        }}
                        autoFocus
                    />
                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
}
