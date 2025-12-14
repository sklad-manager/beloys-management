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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(5px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: '#16213e',
        padding: '2rem',
        borderRadius: '16px',
        width: '300px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Вход Админ</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: '#1a1a2e',
                            color: '#fff',
                            marginBottom: '1rem',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                    {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
}
