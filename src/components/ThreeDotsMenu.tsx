'use client';

import { useState, useEffect, useRef } from 'react';

interface ThreeDotsMenuProps {
    onLogout: () => void;
}

export default function ThreeDotsMenu({ onLogout }: ThreeDotsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstalled(false);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            console.log('App installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-glass"
                style={{
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px',
                    height: '40px'
                }}
                aria-label="Меню"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="glass-card"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        minWidth: '220px',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    {deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="menu-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s',
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📱</span>
                            <span>Установить приложение</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onLogout();
                            setIsOpen(false);
                        }}
                        className="menu-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>🚪</span>
                        <span>Выйти</span>
                    </button>
                </div>
            )}

            <style>{`
                .menu-item:hover {
                    background: rgba(0, 0, 0, 0.05) !important;
                }
            `}</style>
        </div>
    );
}
