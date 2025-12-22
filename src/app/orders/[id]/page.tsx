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
    serviceDetails?: string;
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

    // Services state
    const [serviceItems, setServiceItems] = useState<{ id: number, value: string, masterId: number | null, masterName: string, price: string }[]>([]);
    const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([]);
    const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState<string[]>([]);
    const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
    const [activeMasterIndex, setActiveMasterIndex] = useState<number | null>(null);
    const [filteredMasterSuggestions, setFilteredMasterSuggestions] = useState<{ id: number, name: string }[]>([]);

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

                // Parse serviceDetails
                if (data.serviceDetails) {
                    try {
                        const details = JSON.parse(data.serviceDetails);
                        if (Array.isArray(details)) {
                            setServiceItems(details.map((s: any, idx: number) => ({
                                id: Date.now() + idx,
                                value: s.service,
                                masterId: s.masterId,
                                masterName: s.masterName,
                                price: s.price
                            })));
                        } else {
                            setServiceItems([]);
                        }
                    } catch (e) {
                        console.error('Failed to parse serviceDetails', e);
                    }
                } else if (data.services) {
                    setServiceItems([{
                        id: Date.now(),
                        value: data.services,
                        masterId: data.masterId,
                        masterName: '', // Will be resolved if needed
                        price: data.price.toString()
                    }]);
                }
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

    const fetchServiceSuggestions = async () => {
        try {
            const res = await fetch('/api/references?type=SERVICE');
            if (res.ok) {
                const data = await res.json();
                setServiceSuggestions(data.map((item: any) => item.value));
            }
        } catch (e) {
            console.error('Failed to fetch service suggestions', e);
        }
    };

    useEffect(() => {
        fetchOrder();
        fetchMasters();
        fetchServiceSuggestions();
    }, [id]);

    useEffect(() => {
        if (isEditing && serviceItems.length > 0) {
            const total = serviceItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
            if (total > 0) {
                setFormData((prev: any) => ({ ...prev, price: total.toString() }));
            }
        }
    }, [serviceItems, isEditing]);

    const handleSave = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);

        let currentMasterId: number | null = null;
        let currentMasterName: string = '';

        const processedServices = serviceItems
            .filter(item => item.value.trim().length > 0)
            .map(item => {
                if (item.masterName && item.masterName.trim().length > 0) {
                    currentMasterId = item.masterId;
                    currentMasterName = item.masterName;
                }
                return {
                    service: item.value.trim(),
                    masterId: currentMasterId,
                    masterName: currentMasterName,
                    price: item.price || '0'
                };
            });

        const servicesString = processedServices
            .map(s => `${s.service} [${s.masterName || 'Не назначен'}: ${s.price} грн]`)
            .join(', ');

        const submissionData = {
            ...formData,
            services: servicesString,
            serviceDetails: processedServices,
            masterId: processedServices.length > 0 ? processedServices[0].masterId : formData.masterId
        };

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchOrder();
            } else {
                const err = await res.json();
                alert(`Ошибка сохранения: ${err.error || 'Неизвестная ошибка'}`);
            }
        } catch (e) {
            console.error('Failed to save', e);
            alert('Ошибка сети при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleServiceChange = (index: number, val: string) => {
        const newItems = [...serviceItems];
        newItems[index].value = val;
        setServiceItems(newItems);

        if (val.length > 0) {
            const filtered = serviceSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            setFilteredServiceSuggestions(filtered);
            setActiveServiceIndex(index);
        } else {
            setFilteredServiceSuggestions(serviceSuggestions);
        }
    };

    const handleServiceMasterChange = (index: number, val: string) => {
        const newItems = [...serviceItems];
        newItems[index].masterName = val;
        newItems[index].masterId = null;
        setServiceItems(newItems);

        if (val.length > 0) {
            const filtered = masters.filter(m => m.name.toLowerCase().includes(val.toLowerCase()));
            setFilteredMasterSuggestions(filtered);
            setActiveMasterIndex(index);
        } else {
            setFilteredMasterSuggestions(masters);
            setActiveMasterIndex(index);
        }
    };

    const handleServicePriceChange = (index: number, val: string) => {
        const newItems = [...serviceItems];
        newItems[index].price = val;
        setServiceItems(newItems);
    };

    const addServiceField = () => {
        setServiceItems([...serviceItems, { id: Date.now(), value: '', masterId: null, masterName: '', price: '' }]);
    };

    const removeServiceField = (index: number) => {
        if (serviceItems.length > 1) {
            const newItems = [...serviceItems];
            newItems.splice(index, 1);
            setServiceItems(newItems);
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
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        outline: 'none',
        fontSize: '1rem',
        opacity: isEditing ? 1 : 0.9,
        cursor: isEditing ? 'text' : 'default',
        boxShadow: 'var(--shadow-sm)'
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

                    {/* Services Section */}
                    <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Услуги и Мастера</label>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={addServiceField}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >+ Услуга</button>
                            )}
                        </div>

                        {serviceItems.map((item, index) => (
                            <div key={item.id} style={{
                                display: 'grid',
                                gridTemplateColumns: isEditing ? '2fr 1.5fr 1fr 40px' : '2fr 1.5fr 1fr',
                                gap: '0.75rem',
                                marginBottom: '0.75rem',
                                alignItems: 'start'
                            }}>
                                {/* Service Name */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        placeholder="Услуга..."
                                        style={{ ...inputStyle, marginBottom: 0, padding: '0.6rem' }}
                                        value={item.value}
                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                        onFocus={() => {
                                            if (isEditing) {
                                                const filtered = item.value
                                                    ? serviceSuggestions.filter(s => s.toLowerCase().includes(item.value.toLowerCase()))
                                                    : serviceSuggestions;
                                                setFilteredServiceSuggestions(filtered);
                                                setActiveServiceIndex(index);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setActiveServiceIndex(null), 200)}
                                        readOnly={!isEditing}
                                        autoComplete="off"
                                    />
                                    {activeServiceIndex === index && filteredServiceSuggestions.length > 0 && (
                                        <ul className="suggestions-dropdown" style={{ top: '100%', position: 'absolute', zIndex: 10 }}>
                                            {filteredServiceSuggestions.map((suggestion, i) => (
                                                <li key={i} onClick={() => {
                                                    const newItems = [...serviceItems];
                                                    newItems[index].value = suggestion;
                                                    setServiceItems(newItems);
                                                    setActiveServiceIndex(null);
                                                }}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Master */}
                                <div style={{ position: 'relative' }}>
                                    {(() => {
                                        let inheritedMasterName = '';
                                        if (!item.masterName) {
                                            for (let i = index; i >= 0; i--) {
                                                if (serviceItems[i].masterName) {
                                                    inheritedMasterName = serviceItems[i].masterName;
                                                    break;
                                                }
                                            }
                                        }

                                        return (
                                            <input
                                                placeholder={isEditing ? (inheritedMasterName || "Мастер...") : "-"}
                                                style={{
                                                    ...inputStyle,
                                                    marginBottom: 0,
                                                    padding: '0.6rem',
                                                    fontStyle: !item.masterName && inheritedMasterName ? 'italic' : 'normal',
                                                    opacity: !item.masterName && inheritedMasterName ? 0.7 : 1
                                                }}
                                                value={item.masterName}
                                                onChange={(e) => handleServiceMasterChange(index, e.target.value)}
                                                onFocus={() => {
                                                    if (isEditing) {
                                                        const filtered = item.masterName
                                                            ? masters.filter(m => m.name.toLowerCase().includes(item.masterName.toLowerCase()))
                                                            : masters;
                                                        setFilteredMasterSuggestions(filtered);
                                                        setActiveMasterIndex(index);
                                                    }
                                                }}
                                                onBlur={() => setTimeout(() => setActiveMasterIndex(null), 200)}
                                                readOnly={!isEditing}
                                                autoComplete="off"
                                            />
                                        );
                                    })()}
                                    {activeMasterIndex === index && filteredMasterSuggestions.length > 0 && (
                                        <ul className="suggestions-dropdown" style={{ top: '100%', position: 'absolute', zIndex: 10 }}>
                                            {filteredMasterSuggestions.map((m) => (
                                                <li key={m.id} onClick={() => {
                                                    const newItems = [...serviceItems];
                                                    newItems[index].masterName = m.name;
                                                    newItems[index].masterId = m.id;
                                                    setServiceItems(newItems);
                                                    setActiveMasterIndex(null);
                                                }}>{m.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <input
                                        type="number"
                                        placeholder="Цена"
                                        style={{ ...inputStyle, marginBottom: 0, padding: '0.6rem' }}
                                        value={item.price}
                                        onChange={(e) => handleServicePriceChange(index, e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                {/* Remove Button */}
                                {isEditing && serviceItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeServiceField(index)}
                                        style={{
                                            border: 'none',
                                            padding: 0,
                                            background: '#fee2e2',
                                            color: '#ef4444',
                                            borderRadius: '8px',
                                            height: '38px',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >✕</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Master Primary (Old Field, hidden or read-only) */}
                    <div style={{ display: 'none' }}>
                        <label style={labelStyle}>Основной Мастер</label>
                        <select
                            name="masterId"
                            style={{ ...inputStyle, appearance: 'none' }}
                            value={formData.masterId || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        >
                            <option value="">Выберите мастера</option>
                            {masters.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
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
