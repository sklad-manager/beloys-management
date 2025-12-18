'use client';

import React, { useState, useEffect } from 'react';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, method: 'Cash' | 'Terminal') => void;
    totalPrice: number;
    prepayment: number;
    orderNumber: string;
}

export default function PaymentConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    totalPrice,
    prepayment,
    orderNumber
}: PaymentConfirmationModalProps) {
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState<'Cash' | 'Terminal'>('Cash');

    const remaining = totalPrice - prepayment;

    useEffect(() => {
        if (isOpen) {
            setAmount(remaining > 0 ? remaining : 0);
            setMethod('Cash');
        }
    }, [isOpen, remaining]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 3000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: '#16213e',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '850px',
                maxHeight: '95vh', // Safe maximum height
                display: 'flex',
                flexDirection: 'row',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                overflow: 'hidden', // Contain internal scrolls
                animation: 'slideUp 0.3s ease-out',
                position: 'relative',
                flexWrap: 'wrap'
            }}>

                {/* LEFT SIDE: INFO & SUMMARY */}
                <div style={{
                    flex: '1',
                    minWidth: '300px',
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '0.5rem',
                            lineHeight: 1.2
                        }}>
                            Выдача<br />
                            <span style={{
                                background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Заказа</span>
                        </h2>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            color: '#a78bfa',
                            fontFamily: 'monospace',
                            fontSize: '1rem'
                        }}>
                            #{orderNumber}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                            <span>Сумма заказа</span>
                            <span style={{ color: 'white' }}>{totalPrice} грн</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
                            <span>Предоплата</span>
                            <span style={{ color: '#fb923c' }}>−{prepayment} грн</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>К оплате</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa' }}>
                                {remaining} <span style={{ fontSize: '1.5rem' }}>грн</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: CONTROLS */}
                <div style={{
                    flex: '1.2',
                    minWidth: '320px',
                    padding: '2.5rem',
                    background: '#1a1a2e',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Сумма к списанию</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            style={{
                                width: '100%',
                                background: '#16213e',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Способ оплаты</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setMethod('Cash')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: method === 'Cash' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                    background: method === 'Cash' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    color: method === 'Cash' ? '#10b981' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>💵</span>
                                <span style={{ fontWeight: '600' }}>Наличные</span>
                            </button>
                            <button
                                onClick={() => setMethod('Terminal')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: method === 'Terminal' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                                    background: method === 'Terminal' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    color: method === 'Terminal' ? '#8b5cf6' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>💳</span>
                                <span style={{ fontWeight: '600' }}>Терминал</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={() => onConfirm(amount, method)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            Провести {amount} грн
                        </button>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
