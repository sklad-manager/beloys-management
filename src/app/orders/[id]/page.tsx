'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import OrderIssueModal from '@/components/OrderIssueModal';

interface Order {
    id: number;
    orderNumber: string;
    clientName: string;
    phone: string;
    shoeType: string;
    brand: string;
    color: string;
    price: number;
    status: string;
    createdAt: string;
    completedAt?: string;
    services: string;
    comment?: string;
    prepaymentCash: number;
    prepaymentTerminal: number;
    paymentFullCash: number;
    paymentFullTerminal: number;
    masterId?: number;
    quantity: number;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ totalPrice: 0, prepayment: 0 });

    const [formData, setFormData] = useState<any>({});
    const [masters, setMasters] = useState<{ id: number, name: string }[]>([]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                setFormData({
                    clientName: data.clientName,
                    phone: data.phone,
                    shoeType: data.shoeType,
                    brand: data.brand,
                    color: data.color,
                    services: data.services,
                    price: data.price,
                    comment: data.comment,
                    masterId: data.masterId,
                    status: data.status,
                    quantity: data.quantity || 1
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMasters = async () => {
        try {
            const res = await fetch('/api/masters');
            if (res.ok) {
                setMasters(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchOrder();
        fetchMasters();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchOrder();
            } else {
                const err = await res.json();
                alert(`Ошибка сохранения: ${err.error || 'Неизвестная ошибка'}`);
                console.error('Save failed:', err);
            }
        } catch (e) {
            console.error('Failed to save', e);
            alert('Ошибка сети при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePaymentConfirm = async (amount: number, method: 'Cash' | 'Terminal') => {
        try {
            const res = await fetch(`/api/orders/${id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentAmount: amount,
                    paymentMethod: method
                }),
            });

            if (res.ok) {
                setPaymentModalOpen(false);
                fetchOrder(); // Refresh status
            } else {
                alert('Ошибка при проведении платежа');
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка сети');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Загрузка...</div>;
    if (!order) return <div className="container py-8 text-center text-xl">Заказ не найден</div>;

    // Styles exactly from OrderFormModal
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-subtle)',
        color: 'white',
        marginBottom: '1rem',
        outline: 'none',
        fontSize: '1rem',
        opacity: isEditing ? 1 : 0.8, // Slight visual cue, but keeps the "look"
        cursor: isEditing ? 'text' : 'default'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
    };

    return (
        <main className="container py-8 px-4" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Control Bar */}
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    ← Назад
                </button>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            ✏️ Редактировать
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="btn btn-glass"
                                disabled={saving}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                {saving ? '...' : '💾'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Card mimicking Modal */}
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                    Заказ #{order.orderNumber}
                </h2>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <StatusBadge
                        status={order.status}
                        orderId={order.id}
                        onUpdate={fetchOrder}
                        totalPrice={order.price}
                        prepayment={order.prepaymentCash + order.prepaymentTerminal}
                        orderNumber={order.orderNumber}
                        onRequestPayment={(oid, onum, remaining, prep) => {
                            setPaymentDetails({ totalPrice: remaining + prep, prepayment: prep });
                            setPaymentModalOpen(true);
                        }}
                    />
                </div>

                <form onSubmit={handleSave}>
                    {/* Client */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Имя клиента</label>
                            <input
                                name="clientName"
                                style={inputStyle}
                                value={formData.clientName}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Телефон</label>
                            <input
                                name="phone"
                                style={inputStyle}
                                value={formData.phone}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Shoe Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Тип обуви / Изделия</label>
                            <input
                                name="shoeType"
                                style={inputStyle}
                                value={formData.shoeType}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Бренд</label>
                            <input
                                name="brand"
                                style={inputStyle}
                                value={formData.brand}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Color / Quantity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Цвет</label>
                            <input
                                name="color"
                                style={inputStyle}
                                value={formData.color}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Количество</label>
                            <input
                                name="quantity"
                                type="number"
                                style={inputStyle}
                                value={formData.quantity}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <label style={labelStyle}>Услуги</label>
                        <input // Using input to match look, or textarea if multiple lines needed. Modal uses inputs per service.
                            // Merging services to one text string for simple reading/editing here as per previous logic, 
                            // or we should replicate the dynamic list. 
                            // The image shows "Услуги" and then text. If editable, it's easier to keep as one block or reuse the dynamic list logic.
                            // For "exact look" of the image, the image shows "Чистка, Покраска..." in one box. So one input/textarea is fine.
                            name="services"
                            style={inputStyle}
                            value={formData.services}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>

                    {/* Master */}
                    <div>
                        <label style={labelStyle}>Мастер</label>
                        {isEditing ? (
                            <select
                                name="masterId"
                                style={{ ...inputStyle, appearance: 'none' }} // Basic style
                                value={formData.masterId || ''}
                                onChange={handleChange}
                            >
                                <option value="" style={{ color: 'black' }}>Выберите мастера</option>
                                {masters.map(m => (
                                    <option key={m.id} value={m.id} style={{ color: 'black' }}>{m.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                value={masters.find(m => m.id === Number(formData.masterId))?.name || 'Не назначен'}
                                style={inputStyle}
                                readOnly
                            />
                        )}
                    </div>

                    {/* Comment */}
                    {formData.comment && (
                        <div>
                            <label style={labelStyle}>Комментарий</label>
                            <input
                                name="comment"
                                style={inputStyle}
                                value={formData.comment}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                    )}

                    {/* Financials in the same style */}
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Стоимость</label>
                                <input
                                    name="price"
                                    type="number"
                                    style={{ ...inputStyle, fontWeight: 'bold' }}
                                    value={formData.price}
                                    onChange={handleChange}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Оплачено</label>
                                <input
                                    value={`${order.prepaymentCash + order.prepaymentTerminal + order.paymentFullCash + order.paymentFullTerminal} грн`}
                                    style={{ ...inputStyle, color: '#4ade80' }}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {order && (
                <OrderIssueModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirm}
                    totalPrice={paymentDetails.totalPrice}
                    prepayment={paymentDetails.prepayment}
                    orderNumber={order.orderNumber}
                />
            )}
        </main>
    );
}
