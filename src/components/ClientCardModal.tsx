import React, { useState, useEffect } from 'react';

interface ClientCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
}

interface OrderHistoryItem {
    id: number;
    orderNumber: string;
    createdAt: string;
    shoeType: string;
    brand: string;
    color: string;
    services: string;
    price: number;
    status: string;
}

interface ClientData {
    id: number;
    name: string;
    phone: string;
    phone2: string | null;
    notes: string | null;
    orders: OrderHistoryItem[];
}

interface ClientCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
    onViewOrder?: (orderId: number) => void;
}

export default function ClientCardModal({ isOpen, onClose, clientId, onViewOrder }: ClientCardModalProps) {
    const [client, setClient] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        if (isOpen && clientId) {
            fetchClientData(clientId);
        } else {
            setClient(null);
            setNotes('');
        }
    }, [isOpen, clientId]);

    const fetchClientData = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
                setNotes(data.notes || '');
            }
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!client) return;
        setSavingNotes(true);
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });
            if (res.ok) {
                // Success
            }
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSavingNotes(false);
        }
    };

    if (!isOpen) return null;

    const fullscreenStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        color: 'var(--text-primary)',
        overflowY: 'auto'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        marginBottom: '1rem',
        outline: 'none',
        boxShadow: 'var(--shadow-sm)'
    };

    return (
        <div style={fullscreenStyle} onClick={onClose}>
            <div style={containerStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>Карточка Клиента</h2>
                        {client && <span style={{ padding: '0.4rem 0.8rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600' }}>#{client.id}</span>}
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-glass"
                        style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            padding: 0
                        }}
                    >✕</button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        <div className="loader" style={{ marginBottom: '1rem' }}></div>
                        Загрузка данных клиента...
                    </div>
                ) : client ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                        {/* Sidebar: Info and Notes */}
                        <div>
                            <div style={{
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '2rem',
                                borderRadius: '24px',
                                border: '1px solid var(--border-highlight)',
                                boxShadow: 'var(--shadow-md)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <span style={labelStyle}>Имя</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{client.name}</div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <span style={labelStyle}>Телефон 1</span>
                                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '700' }}>{client.phone}</div>
                                </div>
                                {client.phone2 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <span style={labelStyle}>Телефон 2 (доп)</span>
                                        <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '700' }}>{client.phone2}</div>
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem' }}>
                                    <label style={labelStyle}>Заметки</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', border: '1px solid var(--border-subtle)' }}
                                        placeholder="Особенности клиента, предпочтения..."
                                    />
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', fontWeight: '600' }}
                                    >
                                        {savingNotes ? 'Сохранение...' : 'Обновить заметку'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content: History */}
                        <div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '1.5rem',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                🕒 История заказов
                                <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                    {client.orders.length}
                                </span>
                            </h3>

                            {client.orders.length === 0 ? (
                                <div style={{
                                    padding: '3rem',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '24px',
                                    border: '1px dashed var(--border-subtle)',
                                    color: 'var(--text-muted)'
                                }}>
                                    Заказов пока нет
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {client.orders.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => onViewOrder && onViewOrder(order.id)}
                                            style={{
                                                padding: '1.5rem',
                                                backgroundColor: 'white',
                                                borderRadius: '20px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                border: '1px solid var(--border-subtle)',
                                                boxShadow: 'var(--shadow-sm)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>#{order.orderNumber}</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{order.shoeType}</span>
                                                    {order.brand && <span style={{ color: 'var(--text-secondary)' }}> • {order.brand}</span>}
                                                    {order.color && <span style={{ color: 'var(--text-secondary)' }}> • {order.color}</span>}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {order.services}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                                                <div style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '1.25rem', marginBottom: '0.4rem' }}>{order.price} грн</div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '8px',
                                                    backgroundColor: order.status === 'Закрыт' ? '#e2e8f0' : order.status === 'Выполнен' ? '#dcfce7' : '#fef9c3',
                                                    color: order.status === 'Закрыт' ? '#64748b' : order.status === 'Выполнен' ? '#166534' : '#854d0e',
                                                    display: 'inline-block'
                                                }}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '5rem' }}>Не удалось загрузить данные клиента</div>
                )}
            </div>
        </div>
    );
}
