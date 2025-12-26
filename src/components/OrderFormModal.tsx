'use client';

import React, { useState, useEffect } from 'react';
import ClientCardModal from './ClientCardModal';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    orderId?: number | null;
    isReadOnly?: boolean;
}

export default function OrderFormModal({ isOpen, onClose, onSubmit, orderId, isReadOnly = false }: OrderFormModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        phone: '',
        phone2: '',
        clientId: null as number | null,
        shoeType: '',
        brand: '',
        color: '',
        services: '',
        price: '',
        prepayment: '',
        paymentMethod: 'Cash',
        comment: '',
        quantity: 1
    });

    const [shoeTypeSuggestions, setShoeTypeSuggestions] = useState<string[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [colorSuggestions, setColorSuggestions] = useState<string[]>([]);
    const [filteredColorSuggestions, setFilteredColorSuggestions] = useState<string[]>([]);
    const [showColorSuggestions, setShowColorSuggestions] = useState(false);

    const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
    const [filteredBrandSuggestions, setFilteredBrandSuggestions] = useState<string[]>([]);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

    // Services state
    const [serviceItems, setServiceItems] = useState<{ id: number, value: string, masterId: number | null, masterName: string, price: string }[]>([
        { id: Date.now(), value: '', masterId: null, masterName: '', price: '' }
    ]);
    const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([]);
    const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState<string[]>([]);
    const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
    const [activeMasterIndex, setActiveMasterIndex] = useState<number | null>(null);

    // Masters State
    const [masters, setMasters] = useState<{ id: number, name: string }[]>([]);
    const [filteredMasterSuggestions, setFilteredMasterSuggestions] = useState<{ id: number, name: string }[]>([]);
    const [showMasterSuggestions, setShowMasterSuggestions] = useState(false);

    // Client Search State
    const [clientSuggestions, setClientSuggestions] = useState<{ id: number, name: string, phone: string }[]>([]);
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [foundClient, setFoundClient] = useState<{ id: number, name: string } | null>(null);

    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);

    // Secondary View Only Modal state
    const [viewOnlyOrderId, setViewOnlyOrderId] = useState<number | null>(null);
    const [isViewOnlyOpen, setIsViewOnlyOpen] = useState(false);

    const fetchOrderDetails = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrderNumber(data.orderNumber);
                setFormData({
                    clientName: data.clientName,
                    phone: data.phone,
                    phone2: data.phone2 || '',
                    clientId: data.clientId,
                    shoeType: data.shoeType,
                    brand: data.brand,
                    color: data.color,
                    services: data.services,
                    price: data.price.toString(),
                    prepayment: (data.prepaymentCash + data.prepaymentTerminal).toString(),
                    paymentMethod: data.prepaymentTerminal > 0 ? 'Terminal' : 'Cash',
                    comment: data.comment || '',
                    quantity: data.quantity || 1
                });

                if (data.serviceDetails) {
                    try {
                        const details = JSON.parse(data.serviceDetails);
                        if (Array.isArray(details)) {
                            setServiceItems(details.map((s: any, idx: number) => {
                                // Explicitly resolve master name if missing but ID is present
                                let mName = s.masterName || '';
                                if (!mName && s.masterId && masters.length > 0) {
                                    const match = masters.find(m => m.id === s.masterId);
                                    if (match) mName = match.name;
                                }
                                return {
                                    id: Date.now() + idx,
                                    value: s.service,
                                    masterId: s.masterId,
                                    masterName: mName,
                                    price: s.price
                                };
                            }));
                        }
                    } catch (e) { console.error(e); }
                } else {
                    // Fallback for older orders
                    let mName = '';
                    if (data.masterId && masters.length > 0) {
                        const match = masters.find(m => m.id === data.masterId);
                        if (match) mName = match.name;
                    }
                    setServiceItems([{ id: Date.now(), value: data.services, masterId: data.masterId, masterName: mName, price: data.price.toString() }]);
                }
                setFoundClient(data.clientId ? { id: data.clientId, name: data.clientName } : null);
            }
        } catch (e) {
            console.error('Failed to fetch order details', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (orderId) {
                fetchOrderDetails(orderId);
            } else {
                setOrderNumber(null);
                setFormData({
                    clientName: '',
                    phone: '',
                    phone2: '',
                    clientId: null,
                    shoeType: '',
                    brand: '',
                    color: '',
                    services: '',
                    price: '',
                    prepayment: '',
                    paymentMethod: 'Cash',
                    comment: '',
                    quantity: 1
                });
                setServiceItems([{ id: Date.now(), value: '', masterId: null, masterName: '', price: '' }]);
                setFoundClient(null);
                setClientSuggestions([]);
                setShowClientSuggestions(false);
                setFilteredMasterSuggestions([]);
                setShowMasterSuggestions(false);
                setFilteredSuggestions([]);
                setShowSuggestions(false);
                setFilteredColorSuggestions([]);
                setShowColorSuggestions(false);
                setFilteredBrandSuggestions([]);
                setShowBrandSuggestions(false);
            }
        }
    }, [isOpen, orderId, masters]); // Add masters to ensure we can resolve names when editing

    useEffect(() => {
        const fetchReferences = async () => {
            try {
                // Fetch Shoe Types
                const resShoes = await fetch('/api/references?type=SHOE_TYPE');
                if (resShoes.ok) {
                    const data = await resShoes.json();
                    setShoeTypeSuggestions(data.map((item: any) => item.value));
                }

                // Fetch Colors
                const resColors = await fetch('/api/references?type=COLOR');
                if (resColors.ok) {
                    const data = await resColors.json();
                    setColorSuggestions(data.map((item: any) => item.value));
                }

                // Fetch Brands
                const resBrands = await fetch('/api/references?type=BRAND');
                if (resBrands.ok) {
                    const data = await resBrands.json();
                    setBrandSuggestions(data.map((item: any) => item.value));
                }

                // Fetch Services
                const resServices = await fetch('/api/references?type=SERVICE');
                if (resServices.ok) {
                    const data = await resServices.json();
                    setServiceSuggestions(data.map((item: any) => item.value));
                }

                // Fetch Masters
                const resMasters = await fetch('/api/masters');
                if (resMasters.ok) {
                    const data = await resMasters.json();
                    setMasters(data);
                }
            } catch (e) {
                console.error('Failed to fetch references', e);
            }

        };
        if (isOpen) {
            fetchReferences();
        }
    }, [isOpen]);

    // Auto-sum prices from services
    useEffect(() => {
        const total = serviceItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
        if (total > 0) {
            setFormData(prev => ({ ...prev, price: total.toString() }));
        }
    }, [serviceItems]);

    const handleShoeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, shoeType: value });

        if (value.length > 0) {
            const filtered = shoeTypeSuggestions.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, color: value });

        if (value.length > 0) {
            const filtered = colorSuggestions.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredColorSuggestions(filtered);
            setShowColorSuggestions(true);
        } else {
            setShowColorSuggestions(false);
        }
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, brand: value });

        if (value.length > 0) {
            const filtered = brandSuggestions.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredBrandSuggestions(filtered);
            setShowBrandSuggestions(true);
        } else {
            setShowBrandSuggestions(false);
        }
    };

    const selectSuggestion = (value: string) => {
        setFormData({ ...formData, shoeType: value });
        setShowSuggestions(false);
    };

    const selectColorSuggestion = (value: string) => {
        setFormData({ ...formData, color: value });
        setShowColorSuggestions(false);
    };

    const selectBrandSuggestion = (value: string) => {
        setFormData({ ...formData, brand: value });
        setShowBrandSuggestions(false);
    };

    // Client Search Handlers
    const searchClients = async (query: string) => {
        if (query.length < 2) {
            setClientSuggestions([]);
            setShowClientSuggestions(false);
            return;
        }
        try {
            const res = await fetch(`/api/clients/search?query=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setClientSuggestions(data);
                setShowClientSuggestions(true);
            }
        } catch (e) {
            console.error('Failed to search clients', e);
        }
    };

    const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, clientName: value, clientId: null });
        setFoundClient(null);
        searchClients(value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, phone: value, clientId: null });
        setFoundClient(null);
        searchClients(value);
    };

    const handlePhone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, phone2: value, clientId: null });
        setFoundClient(null);
        searchClients(value);
    };

    const selectClient = (client: { id: number, name: string, phone: string, phone2?: string }) => {
        setFormData({
            ...formData,
            clientName: client.name,
            phone: client.phone,
            phone2: client.phone2 || '',
            clientId: client.id
        });
        setFoundClient({ id: client.id, name: client.name });
        setShowClientSuggestions(false);
    };

    // Service handlers
    const handleServiceChange = (index: number, value: string) => {
        const newItems = [...serviceItems];
        newItems[index].value = value;
        setServiceItems(newItems);

        if (value.length > 0) {
            const filtered = serviceSuggestions.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredServiceSuggestions(filtered);
            setActiveServiceIndex(index);
        } else {
            setActiveServiceIndex(null);
        }
    };

    const handleServicePriceChange = (index: number, value: string) => {
        const newItems = [...serviceItems];
        newItems[index].price = value;
        setServiceItems(newItems);
    };

    const handleServiceMasterChange = (index: number, value: string) => {
        const newItems = [...serviceItems];
        newItems[index].masterName = value;
        newItems[index].masterId = null;
        setServiceItems(newItems);

        if (value.length > 0) {
            const filtered = masters.filter(item =>
                item.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredMasterSuggestions(filtered);
            setActiveMasterIndex(index);
        } else {
            setFilteredMasterSuggestions(masters);
            setActiveMasterIndex(index);
        }
    };

    const selectMasterSuggestion = (index: number, master: { id: number, name: string }) => {
        const newItems = [...serviceItems];
        newItems[index].masterName = master.name;
        newItems[index].masterId = master.id;
        setServiceItems(newItems);
        setActiveMasterIndex(null);
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


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Resolve implicit masters and construct services data
        let currentMasterId: number | null = null;
        let currentMasterName: string = '';

        const processedServices = serviceItems
            .filter(item => item.value.trim().length > 0)
            .map(item => {
                // If ID is missing but name is present, try to find ID from masters list
                let effectiveMasterId = item.masterId;
                if (!effectiveMasterId && item.masterName) {
                    const match = masters.find(m => m.name.toLowerCase() === item.masterName.toLowerCase());
                    if (match) effectiveMasterId = match.id;
                }

                if (item.masterName && item.masterName.trim().length > 0) {
                    currentMasterId = effectiveMasterId;
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

        const finalData = {
            ...formData,
            services: servicesString,
            masterId: processedServices.length > 0 ? processedServices[0].masterId : null,
            serviceDetails: processedServices
        };

        if (orderId) {
            // Edit existing order
            try {
                const res = await fetch(`/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData)
                });
                if (res.ok) {
                    onSubmit(await res.json());
                } else {
                    const err = await res.json();
                    alert(`Ошибка: ${err.error || 'Не удалось сохранить'}`);
                }
            } catch (e) {
                console.error(e);
                alert('Ошибка сети');
            }
        } else {
            // Create new order
            await onSubmit(finalData);
        }

        setLoading(false);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
        boxShadow: 'var(--shadow-sm)'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary)', // Solid primary background
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflowX: 'hidden'
        }}>
            <div className="full-screen-container" style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                overflowY: 'auto',
                padding: '2rem 5% 5rem 5%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <style>{`
                    .order-grid {
                        display: grid;
                        grid-template-columns: 2fr 0.9fr;
                        gap: 5rem;
                        align-items: start;
                        max-width: 1400px;
                        margin: 0 auto;
                    }
                    @media (max-width: 1100px) {
                        .order-grid {
                            grid-template-columns: 1fr;
                            gap: 2.5rem;
                            max-width: 700px;
                        }
                    }
                    .suggestions-dropdown {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        background: #ffffff;
                        border: '1px solid var(--border-subtle)';
                        border-radius: 12px;
                        max-height: 200px;
                        overflow-y: auto;
                        list-style: none;
                        padding: 0.5rem 0;
                        margin: 0;
                        z-index: 1005;
                        box-shadow: var(--shadow-lg);
                    }
                    .suggestions-dropdown li {
                        padding: 0.75rem 1rem;
                        cursor: pointer;
                        border-bottom: 1px solid var(--border-subtle);
                        color: var(--text-primary);
                        transition: background 0.2s;
                    }
                    .suggestions-dropdown li:hover {
                        background: var(--bg-primary);
                    }
                `}</style>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    maxWidth: '1400px',
                    margin: '0 auto 3rem auto'
                }}>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: '800', margin: 0 }}>
                        {isReadOnly ? `Просмотр Заказа #${orderNumber ? (parseInt(orderNumber) || orderNumber) : ''}` : (orderId ? `Редактирование #${orderNumber ? (parseInt(orderNumber) || orderNumber) : ''}` : 'Новый Заказ')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-glass"
                        style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}
                    >✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="order-grid">
                        {/* Левая колонка: Информация о заказе */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600' }}>📋 Детали изделия</h3>
                            </div>

                            {/* Клиент */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={labelStyle}>Имя клиента</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            name="clientName"
                                            placeholder="Иван Иванов"
                                            style={inputStyle}
                                            value={formData.clientName}
                                            onChange={handleClientNameChange}
                                            autoComplete="off"
                                            disabled={isReadOnly}
                                            required
                                        />
                                        {foundClient && (
                                            <button
                                                type="button"
                                                onClick={() => setIsClientModalOpen(true)}
                                                className="btn"
                                                style={{
                                                    padding: '0 0.75rem',
                                                    fontSize: '1.2rem',
                                                    background: 'var(--accent-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    height: '46px'
                                                }}
                                                title="Открыть карточку клиента"
                                            >
                                                📋
                                            </button>
                                        )}
                                    </div>
                                    {showClientSuggestions && clientSuggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: '0.5rem 0',
                                            margin: 0,
                                            zIndex: 1002,
                                            boxShadow: 'var(--shadow-lg)'
                                        }}>
                                            {clientSuggestions.map((client) => (
                                                <li
                                                    key={client.id}
                                                    onClick={() => selectClient(client)}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ fontWeight: '600' }}>{client.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.phone}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>Телефон 1</label>
                                    <input
                                        name="phone"
                                        placeholder="0991234567"
                                        style={inputStyle}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        autoComplete="off"
                                        disabled={isReadOnly}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Телефон 2 (доп)</label>
                                    <input
                                        name="phone2"
                                        placeholder="0501234567"
                                        style={inputStyle}
                                        value={formData.phone2}
                                        onChange={handlePhone2Change}
                                        autoComplete="off"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Обувь */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={labelStyle}>Тип обуви / Изделия</label>
                                    <input
                                        name="shoeType"
                                        placeholder="Кроссовки, Туфли..."
                                        style={inputStyle}
                                        value={formData.shoeType}
                                        onChange={handleShoeTypeChange}
                                        onFocus={() => {
                                            if (isReadOnly) return;
                                            const filtered = formData.shoeType
                                                ? shoeTypeSuggestions.filter(item => item.toLowerCase().includes(formData.shoeType.toLowerCase()))
                                                : shoeTypeSuggestions;
                                            setFilteredSuggestions(filtered);
                                            setShowSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        autoComplete="off"
                                        disabled={isReadOnly}
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: '0.5rem 0',
                                            margin: 0,
                                            zIndex: 1001,
                                            boxShadow: 'var(--shadow-lg)'
                                        }}>
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => selectSuggestion(suggestion)}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <label style={labelStyle}>Бренд</label>
                                    <input
                                        name="brand"
                                        placeholder="Nike, Gucci..."
                                        style={inputStyle}
                                        value={formData.brand}
                                        onChange={handleBrandChange}
                                        onFocus={() => {
                                            if (isReadOnly) return;
                                            const filtered = formData.brand
                                                ? brandSuggestions.filter(item => item.toLowerCase().includes(formData.brand.toLowerCase()))
                                                : brandSuggestions;
                                            setFilteredBrandSuggestions(filtered);
                                            setShowBrandSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                                        autoComplete="off"
                                        disabled={isReadOnly}
                                    />
                                    {showBrandSuggestions && filteredBrandSuggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: '0.5rem 0',
                                            margin: 0,
                                            zIndex: 1001,
                                            boxShadow: 'var(--shadow-lg)'
                                        }}>
                                            {filteredBrandSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => selectBrandSuggestion(suggestion)}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Детали */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={labelStyle}>Цвет</label>
                                    <input
                                        name="color"
                                        placeholder="Черный"
                                        style={inputStyle}
                                        value={formData.color}
                                        onChange={handleColorChange}
                                        onFocus={() => {
                                            if (isReadOnly) return;
                                            const filtered = formData.color
                                                ? colorSuggestions.filter(item => item.toLowerCase().includes(formData.color.toLowerCase()))
                                                : colorSuggestions;
                                            setFilteredColorSuggestions(filtered);
                                            setShowColorSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowColorSuggestions(false), 200)}
                                        autoComplete="off"
                                        disabled={isReadOnly}
                                    />
                                    {showColorSuggestions && filteredColorSuggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: '0.5rem 0',
                                            margin: 0,
                                            zIndex: 1001,
                                            boxShadow: 'var(--shadow-lg)'
                                        }}>
                                            {filteredColorSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => selectColorSuggestion(suggestion)}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>Количество</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        defaultValue="1"
                                        style={inputStyle}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Услуги</label>
                                {serviceItems.map((item, index) => (
                                    <div key={item.id} style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(200px, 1.8fr) minmax(120px, 1fr) 100px 40px',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem',
                                        position: 'relative',
                                        alignItems: 'start'
                                    }}>
                                        {/* Услуга */}
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                placeholder="Чистка..."
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                                value={item.value}
                                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                                onFocus={() => {
                                                    if (isReadOnly) return;
                                                    const filtered = item.value
                                                        ? serviceSuggestions.filter(s => s.toLowerCase().includes(item.value.toLowerCase()))
                                                        : serviceSuggestions;
                                                    setFilteredServiceSuggestions(filtered);
                                                    setActiveServiceIndex(index);
                                                }}
                                                onBlur={() => setTimeout(() => setActiveServiceIndex(null), 200)}
                                                autoComplete="off"
                                                disabled={isReadOnly}
                                            />
                                            {activeServiceIndex === index && filteredServiceSuggestions.length > 0 && (
                                                <ul className="suggestions-dropdown">
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

                                        {/* Мастер */}
                                        <div style={{ position: 'relative' }}>
                                            {(() => {
                                                // Find inherited master name for placeholder
                                                let inheritedMasterName = '';
                                                for (let i = index; i >= 0; i--) {
                                                    if (serviceItems[i].masterName) {
                                                        inheritedMasterName = serviceItems[i].masterName;
                                                        break;
                                                    }
                                                }

                                                return (
                                                    <input
                                                        placeholder={inheritedMasterName || "Мастер..."}
                                                        style={{
                                                            ...inputStyle,
                                                            marginBottom: 0,
                                                            fontSize: '0.9rem',
                                                            fontStyle: !item.masterName && inheritedMasterName ? 'italic' : 'normal',
                                                            opacity: !item.masterName && inheritedMasterName ? 0.7 : 1
                                                        }}
                                                        value={item.masterName}
                                                        onChange={(e) => handleServiceMasterChange(index, e.target.value)}
                                                        onFocus={() => {
                                                            if (isReadOnly) return;
                                                            const filtered = item.masterName
                                                                ? masters.filter(m => m.name.toLowerCase().includes(item.masterName.toLowerCase()))
                                                                : masters;
                                                            setFilteredMasterSuggestions(filtered);
                                                            setActiveMasterIndex(index);
                                                        }}
                                                        onBlur={() => setTimeout(() => setActiveMasterIndex(null), 200)}
                                                        autoComplete="off"
                                                        disabled={isReadOnly}
                                                    />
                                                );
                                            })()}
                                            {activeMasterIndex === index && filteredMasterSuggestions.length > 0 && (
                                                <ul className="suggestions-dropdown">
                                                    {filteredMasterSuggestions.map((m) => (
                                                        <li key={m.id} onClick={() => selectMasterSuggestion(index, m)}>{m.name}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Цена услуги */}
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Цена"
                                                style={{ ...inputStyle, marginBottom: 0, fontSize: '0.9rem', padding: '0.75rem 0.5rem' }}
                                                value={item.price}
                                                onChange={(e) => handleServicePriceChange(index, e.target.value)}
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        {serviceItems.length > 1 && !isReadOnly ? (
                                            <button
                                                type="button"
                                                onClick={() => removeServiceField(index)}
                                                className="btn"
                                                style={{
                                                    padding: 0,
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    borderRadius: '10px',
                                                    height: '46px',
                                                    width: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >✕</button>
                                        ) : <div />}
                                    </div>
                                ))}
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={addServiceField}
                                        className="btn btn-glass"
                                        style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.9rem', borderRadius: '10px' }}
                                    >
                                        + Добавить услугу
                                    </button>
                                )}
                            </div>



                            <div>
                                <label style={labelStyle}>Комментарий</label>
                                <input
                                    name="comment"
                                    placeholder="Доп. информация..."
                                    style={inputStyle}
                                    value={formData.comment}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        {/* Правая колонка: Оплата */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            background: 'var(--bg-primary)',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: '700' }}>💰 Оплата</h3>
                            </div>

                            <div>
                                <label style={{ ...labelStyle, fontWeight: '600' }}>Итоговая Цена</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="price"
                                        type="number"
                                        placeholder="0"
                                        required
                                        style={{
                                            ...inputStyle,
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            color: 'var(--accent-primary)',
                                            paddingRight: '3.5rem',
                                            borderColor: 'var(--accent-primary)',
                                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.1)'
                                        }}
                                        onChange={handleChange}
                                        value={formData.price}
                                        disabled={isReadOnly}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        right: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontWeight: '700',
                                        fontSize: '1.2rem',
                                        color: 'var(--accent-primary)'
                                    }}>грн</span>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Предоплата</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="prepayment"
                                        type="number"
                                        placeholder="0"
                                        style={{ ...inputStyle, fontSize: '1.2rem', fontWeight: '600', paddingRight: '3.5rem' }}
                                        onChange={handleChange}
                                        value={formData.prepayment}
                                        disabled={isReadOnly}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        right: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontWeight: '600',
                                        color: 'var(--text-muted)'
                                    }}>грн</span>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Способ оплаты</label>
                                <select
                                    name="paymentMethod"
                                    style={{ ...inputStyle, appearance: 'none', background: 'white url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 1rem center' }}
                                    onChange={handleChange}
                                    value={formData.paymentMethod}
                                    disabled={isReadOnly}
                                >
                                    <option value="Cash">💵 Наличные</option>
                                    <option value="Terminal">💳 Карта / Терминал</option>
                                </select>
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                padding: '1.25rem',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px dashed var(--border-subtle)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Останется оплатить:</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {(Number(formData.price) - Number(formData.prepayment)) || 0} грн
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                                {!isReadOnly ? (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                padding: '1.1rem',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                boxShadow: 'var(--accent-glow)'
                                            }}
                                        >
                                            {loading ? 'Обработка...' : (orderId ? 'Сохранить Изменения' : 'Создать Заказ')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="btn btn-glass"
                                            style={{ width: '100%', padding: '0.75rem' }}
                                        >
                                            Отмена
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1.1rem', fontWeight: '700' }}
                                    >
                                        Закрыть
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
                <ClientCardModal
                    isOpen={isClientModalOpen}
                    onClose={() => setIsClientModalOpen(false)}
                    clientId={foundClient?.id || null}
                    onViewOrder={(id) => {
                        setViewOnlyOrderId(id);
                        setIsViewOnlyOpen(true);
                    }}
                />

                {/* Secondary modal for viewing old orders from history */}
                {isViewOnlyOpen && (
                    <OrderFormModal
                        isOpen={isViewOnlyOpen}
                        onClose={() => {
                            setIsViewOnlyOpen(false);
                            setViewOnlyOrderId(null);
                        }}
                        onSubmit={() => { }} // No-op for read-only
                        orderId={viewOnlyOrderId}
                        isReadOnly={true}
                    />
                )}
            </div>
        </div>
    );
}
