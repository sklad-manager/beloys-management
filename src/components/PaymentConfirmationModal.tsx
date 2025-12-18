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
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '24px',
                padding: '1.5rem',
                width: '90%',
                maxWidth: '520px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.05)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header with gradient */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '0.5rem'
                    }}>✨</div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.25rem'
                    }}>Выдача заказа</h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'monospace'
                    }}>№ {orderNumber}</p>
                </div>

                {/* Financial Summary */}
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                        <span>Общая сумма:</span>
                        <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{totalPrice} грн</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                        <span>Предоплата:</span>
                        <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>−{prepayment} грн</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '2px solid rgba(139, 92, 246, 0.3)',
                        fontSize: '1.25rem',
                        fontWeight: '700'
                    }}>
                        <span style={{ color: '#a78bfa' }}>К оплате:</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>{remaining} грн</span>
                    </div>
                </div>

                {/* Amount Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '500'
                    }}>Сумма платежа</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.4)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Payment Method Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '500'
                    }}>Способ оплаты</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setMethod('Cash')}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '16px',
                                border: method === 'Cash' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)',
                                background: method === 'Cash'
                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
                                    : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: method === 'Cash' ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: method === 'Cash' ? '0 8px 16px rgba(16, 185, 129, 0.2)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (method !== 'Cash') {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (method !== 'Cash') {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💵</div>
                            <div style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: method === 'Cash' ? '#10b981' : 'rgba(255,255,255,0.6)'
                            }}>Наличные</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMethod('Terminal')}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '16px',
                                border: method === 'Terminal' ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.1)',
                                background: method === 'Terminal'
                                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                    : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: method === 'Terminal' ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: method === 'Terminal' ? '0 8px 16px rgba(139, 92, 246, 0.2)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (method !== 'Terminal') {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (method !== 'Terminal') {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                            <div style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: method === 'Terminal' ? '#8b5cf6' : 'rgba(255,255,255,0.6)'
                            }}>Терминал</div>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                        }}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={() => onConfirm(amount, method)}
                        style={{
                            flex: 2,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                    >
                        ✓ Провести платеж
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
