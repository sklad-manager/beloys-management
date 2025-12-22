import React, { useState, useEffect } from 'react';

interface ClientCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
}

interface OrderHistoryItem {
    id: number;
    createdAt: string;
    description: string;
    shoeType: string;
    price: number;
    status: string;
}

interface ClientData {
    id: number;
    name: string;
    phone: string;
    notes: string | null;
    orders: OrderHistoryItem[];
}

export default function ClientCardModal({ isOpen, onClose, clientId }: ClientCardModalProps) {
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
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-highlight)'
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
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Карточка Клиента</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>
                ) : client ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <span style={labelStyle}>Имя</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{client.name}</div>
                            </div>
                            <div>
                                <span style={labelStyle}>Телефон</span>
                                <div style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{client.phone}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Заметки</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Особенности клиента..."
                            />
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.75rem' }}
                            >
                                {savingNotes ? 'Сохранение...' : 'Сохранить заметку'}
                            </button>
                        </div>

                        <div>
                            <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>История заказов</h3>
                            {client.orders.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>Заказов пока нет</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {client.orders.map(order => (
                                        <div key={order.id} style={{
                                            padding: '1.25rem',
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: '1px solid var(--border-subtle)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                                </div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{order.shoeType}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{order.price} грн</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{order.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#ff6b6b' }}>Не удалось загрузить данные клиента</div>
                )}
            </div>
        </div>
    );
}
