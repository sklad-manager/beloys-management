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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: '#16213e',
        padding: '2rem',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#8d99ae',
        fontSize: '0.9rem'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: '1rem',
        marginBottom: '1rem',
        outline: 'none',
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Карточка Клиента</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>
                ) : client ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <span style={labelStyle}>Имя</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{client.name}</div>
                            </div>
                            <div>
                                <span style={labelStyle}>Телефон</span>
                                <div style={{ fontSize: '1.2rem', color: '#4cc9f0' }}>{client.phone}</div>
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
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: savingNotes ? '#555' : '#4cc9f0',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: savingNotes ? 'default' : 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {savingNotes ? 'Сохранение...' : 'Сохранить заметку'}
                            </button>
                        </div>

                        <div>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>История заказов</h3>
                            {client.orders.length === 0 ? (
                                <p style={{ color: '#8d99ae' }}>Заказов пока нет</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {client.orders.map(order => (
                                        <div key={order.id} style={{
                                            padding: '1rem',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', color: '#8d99ae' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                                </div>
                                                <div>{order.shoeType}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', color: '#4cc9f0' }}>{order.price} грн</div>
                                                <div style={{ fontSize: '0.8rem', color: '#8d99ae' }}>{order.status}</div>
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
