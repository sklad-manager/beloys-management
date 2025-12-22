'use client';

import { useState, useEffect, useRef } from 'react';

interface StatusBadgeProps {
    status: string;
    orderId: number;
    onUpdate?: () => void;
    totalPrice?: number;
    prepayment?: number;
    orderNumber?: string;
    onRequestPayment: (orderId: number, orderNumber: string, remainingAmount: number, prepayment: number) => void;
}

const STATUS_OPTIONS = [
    'Принят в работу',
    'Готово',
    'Выдан'
];

export default function StatusBadge({
    status,
    orderId,
    onUpdate,
    totalPrice = 0,
    prepayment = 0,
    orderNumber = '',
    onRequestPayment
}: StatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        setIsOpen(false); // Close dropdown immediately

        if (newStatus === currentStatus) return;

        // If status is "Выдан", trigger payment flow via parent
        if (newStatus === 'Выдан') {
            const remaining = (totalPrice || 0) - (prepayment || 0);
            onRequestPayment(
                orderId,
                orderNumber || '',
                remaining > 0 ? remaining : 0,
                prepayment || 0
            );
            return;
        }

        // Standard status update
        await updateStatus(newStatus);
    };

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setCurrentStatus(newStatus);
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setLoading(false);
        }
    };

    const getStyle = (s: string) => {
        if (s === 'Готово') {
            return {
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#fb923c',
                border: '1px solid rgba(249, 115, 22, 0.3)'
            };
        }
        if (s === 'Выдан') {
            return {
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)'
            };
        }
        return {
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)'
        };
    };

    const style = getStyle(currentStatus);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                style={{
                    ...style,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: loading ? 'wait' : 'pointer',
                    border: 'none',
                    outline: 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                {loading ? '...' : currentStatus}
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    zIndex: 50,
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                    minWidth: 'max-content'
                }}>
                    {STATUS_OPTIONS.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleStatusChange(option)}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: option === currentStatus ? getStyle(option).color : '#e5e5e5',
                                background: option === currentStatus ? 'rgba(255,255,255,0.05)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = option === currentStatus ? 'rgba(255,255,255,0.05)' : 'transparent';
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
