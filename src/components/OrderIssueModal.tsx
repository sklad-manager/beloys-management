'use client';

import React, { useState, useEffect } from 'react';

interface OrderIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, method: 'Cash' | 'Terminal') => void;
    totalPrice: number;
    prepayment: number;
    orderNumber: string;
}

export default function OrderIssueModal({
    isOpen,
    onClose,
    onConfirm,
    totalPrice,
    prepayment,
    orderNumber
}: OrderIssueModalProps) {
    const remaining = totalPrice - prepayment;
    const [amount, setAmount] = useState(remaining > 0 ? remaining : 0);
    const [method, setMethod] = useState<'Cash' | 'Terminal'>('Cash');

    useEffect(() => {
        if (isOpen) {
            const rem = totalPrice - prepayment;
            setAmount(rem > 0 ? rem : 0);
            setMethod('Cash');
        }
    }, [isOpen, totalPrice, prepayment]);

    if (!isOpen) return null;

    const isFullyPaid = remaining <= 0;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            animation: 'modalFadeIn 0.3s ease'
        }}>
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '24px',
                padding: '2rem',
                width: '90%',
                maxWidth: '440px',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                animation: 'modalSlideUp 0.3s ease'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold'
                    }}>📦</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Выдача заказа</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>№ {orderNumber}</p>
                </div>

                {/* Financial Summary */}
                <div style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>Сумма заказа:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{totalPrice} грн</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>Оплачено:</span>
                        <span style={{ color: '#16a34a', fontWeight: '600' }}>{prepayment} грн</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-subtle)'
                    }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>Осталось оплатить:</span>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            color: isFullyPaid ? '#16a34a' : '#ef4444'
                        }}>
                            {remaining > 0 ? remaining : 0} грн
                        </span>
                    </div>
                </div>

                {/* Form Logic */}
                {!isFullyPaid ? (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Сумма доплаты</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    background: '#ffffff',
                                    border: '1px solid var(--border-highlight)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    outline: 'none',
                                    textAlign: 'center',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setMethod('Cash')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: method === 'Cash' ? '2px solid #22c55e' : '1px solid var(--border-subtle)',
                                    background: method === 'Cash' ? '#f0fdf4' : 'white',
                                    color: method === 'Cash' ? '#16a34a' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    boxShadow: method === 'Cash' ? 'none' : 'var(--shadow-sm)'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>💵</span>
                                Наличные
                            </button>
                            <button
                                onClick={() => setMethod('Terminal')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: method === 'Terminal' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                                    background: method === 'Terminal' ? '#f5f3ff' : 'white',
                                    color: method === 'Terminal' ? '#4f46e5' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    boxShadow: method === 'Terminal' ? 'none' : 'var(--shadow-sm)'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>💳</span>
                                Терминал
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        background: '#f0fdf4',
                        borderRadius: '16px',
                        border: '1px dashed #bbf7d0',
                        marginBottom: '2rem',
                        color: '#16a34a',
                        fontSize: '0.95rem'
                    }}>
                        ✅ Заказ полностью оплачен.<br />
                        Можно выдавать.
                    </div>
                )}

                {/* Footer Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'white',
                            border: '1px solid var(--border-highlight)',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={() => onConfirm(isFullyPaid ? 0 : amount, method)}
                        style={{
                            flex: 2,
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            color: 'white',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                        }}
                    >
                        {isFullyPaid ? 'Выдать заказ' : 'Оплатить и выдать'}
                    </button>
                </div>

                <style>{`
                    @keyframes modalFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes modalSlideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
}
