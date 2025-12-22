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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            animation: 'modalFadeIn 0.3s ease'
        }}>
            <div style={{
                background: '#121212',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2rem',
                width: '90%',
                maxWidth: '440px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>Выдача заказа</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontFamily: 'monospace' }}>№ {orderNumber}</p>
                </div>

                {/* Financial Summary */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>Сумма заказа:</span>
                        <span style={{ color: 'white', fontWeight: '600' }}>{totalPrice} грн</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>Оплачено:</span>
                        <span style={{ color: '#4ade80', fontWeight: '600' }}>{prepayment} грн</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'white' }}>Осталось оплатить:</span>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            color: isFullyPaid ? '#4ade80' : '#f87171'
                        }}>
                            {remaining > 0 ? remaining : 0} грн
                        </span>
                    </div>
                </div>

                {/* Form Logic */}
                {!isFullyPaid ? (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Сумма доплаты</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: 'white',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setMethod('Cash')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: method === 'Cash' ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                                    background: method === 'Cash' ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                    color: method === 'Cash' ? '#4ade80' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
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
                                    border: method === 'Terminal' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                    background: method === 'Terminal' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: method === 'Terminal' ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
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
                        background: 'rgba(74, 222, 128, 0.05)',
                        borderRadius: '16px',
                        border: '1px dashed rgba(74, 222, 128, 0.3)',
                        marginBottom: '2rem',
                        color: '#4ade80',
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
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
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
                            background: isFullyPaid ? '#4ade80' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            color: 'black',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
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
