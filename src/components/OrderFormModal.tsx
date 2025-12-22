'use client';

import React, { useState, useEffect } from 'react';
import ClientCardModal from './ClientCardModal';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function OrderFormModal({ isOpen, onClose, onSubmit }: OrderFormModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        phone: '',
        clientId: null as number | null,
        shoeType: '',
        brand: '',
        color: '',
        services: '',
        price: '',
        prepayment: '',
        paymentMethod: 'Cash',
        comment: '',

        quantity: 1,
        masterId: null as number | null,
        masterName: ''
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
    const [serviceItems, setServiceItems] = useState<{ id: number, value: string }[]>([{ id: Date.now(), value: '' }]);
    const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([]);
    const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState<string[]>([]);
    const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);

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

    useEffect(() => {
        if (isOpen) {
            setFormData({
                clientName: '',
                phone: '',
                clientId: null,
                shoeType: '',
                brand: '',
                color: '',
                services: '',
                price: '',
                prepayment: '',
                paymentMethod: 'Cash',
                comment: '',
                quantity: 1,
                masterId: null,
                masterName: ''
            });
            setServiceItems([{ id: Date.now(), value: '' }]);
            setFoundClient(null);
            setClientSuggestions([]);
            setShowClientSuggestions(false);

            setFilteredMasterSuggestions([]);
            setShowMasterSuggestions(false);

            setFilteredSuggestions([]);
            setShowSuggestions(false);
            setShowSuggestions(false);

            setFilteredColorSuggestions([]);
            setShowColorSuggestions(false);

            setFilteredBrandSuggestions([]);
            setShowBrandSuggestions(false);
        }
    }, [isOpen]);

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
        fetchReferences();
    }, []);

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

    const selectClient = (client: { id: number, name: string, phone: string }) => {
        setFormData({
            ...formData,
            clientName: client.name,
            phone: client.phone,
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

    const addServiceField = () => {
        setServiceItems([...serviceItems, { id: Date.now(), value: '' }]);
    };

    const selectServiceSuggestion = (value: string) => {
        if (activeServiceIndex !== null) {
            const newItems = [...serviceItems];
            newItems[activeServiceIndex].value = value;
            setServiceItems(newItems);
            setActiveServiceIndex(null);
        }
    };

    const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, masterName: value, masterId: null });

        if (value.length > 0) {
            const filtered = masters.filter(item =>
                item.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredMasterSuggestions(filtered);
            setShowMasterSuggestions(true);
        } else {
            setShowMasterSuggestions(false);
        }
    };

    const selectMaster = (master: { id: number, name: string }) => {
        setFormData({ ...formData, masterName: master.name, masterId: master.id });
        setShowMasterSuggestions(false);
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

        // Construct services string
        const servicesString = serviceItems
            .map(item => item.value.trim())
            .filter(val => val.length > 0)
            .join(', ');

        await onSubmit({ ...formData, services: servicesString });
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
            background: 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-card full-screen-modal" style={{
                width: '100vw',
                height: '100vh',
                maxWidth: 'none',
                maxHeight: 'none',
                overflowY: 'auto',
                margin: 0,
                padding: '2rem 5% 4rem 5%',
                borderRadius: 0,
                background: 'var(--bg-secondary)',
                border: 'none',
                position: 'relative',
                zIndex: 1001
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
                `}</style>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    maxWidth: '1400px',
                    margin: '0 auto 3rem auto'
                }}>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: '800', margin: 0 }}>Новый Заказ</h2>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                    <label style={labelStyle}>Телефон</label>
                                    <input
                                        name="phone"
                                        placeholder="0991234567"
                                        style={inputStyle}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        autoComplete="off"
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
                                            const filtered = formData.shoeType
                                                ? shoeTypeSuggestions.filter(item => item.toLowerCase().includes(formData.shoeType.toLowerCase()))
                                                : shoeTypeSuggestions;
                                            setFilteredSuggestions(filtered);
                                            setShowSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        autoComplete="off"
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
                                            const filtered = formData.brand
                                                ? brandSuggestions.filter(item => item.toLowerCase().includes(formData.brand.toLowerCase()))
                                                : brandSuggestions;
                                            setFilteredBrandSuggestions(filtered);
                                            setShowBrandSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                                        autoComplete="off"
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
                                            const filtered = formData.color
                                                ? colorSuggestions.filter(item => item.toLowerCase().includes(formData.color.toLowerCase()))
                                                : colorSuggestions;
                                            setFilteredColorSuggestions(filtered);
                                            setShowColorSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowColorSuggestions(false), 200)}
                                        autoComplete="off"
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
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Услуги</label>
                                {serviceItems.map((item, index) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', position: 'relative' }}>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <input
                                                placeholder="Чистка, Покраска, Ремонт..."
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                                value={item.value}
                                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                                onFocus={() => {
                                                    const filtered = item.value
                                                        ? serviceSuggestions.filter(s => s.toLowerCase().includes(item.value.toLowerCase()))
                                                        : serviceSuggestions;
                                                    setFilteredServiceSuggestions(filtered);
                                                    setActiveServiceIndex(index);
                                                }}
                                                onBlur={() => setTimeout(() => setActiveServiceIndex(null), 200)}
                                                autoComplete="off"
                                            />
                                            {activeServiceIndex === index && filteredServiceSuggestions.length > 0 && (
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
                                                    {filteredServiceSuggestions.map((suggestion, i) => (
                                                        <li
                                                            key={i}
                                                            onClick={() => selectServiceSuggestion(suggestion)}
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
                                        {serviceItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeServiceField(index)}
                                                className="btn"
                                                style={{ padding: '0 1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '10px' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addServiceField}
                                    className="btn btn-glass"
                                    style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.9rem', borderRadius: '10px' }}
                                >
                                    + Добавить услугу
                                </button>
                            </div>

                            {/* Мастер */}
                            <div style={{ position: 'relative' }}>
                                <label style={labelStyle}>Мастер</label>
                                <input
                                    name="masterName"
                                    placeholder="Выберите мастера"
                                    style={inputStyle}
                                    value={formData.masterName}
                                    onChange={handleMasterChange}
                                    onFocus={() => {
                                        const filtered = formData.masterName
                                            ? masters.filter(item => item.name.toLowerCase().includes(formData.masterName.toLowerCase()))
                                            : masters;
                                        setFilteredMasterSuggestions(filtered);
                                        setShowMasterSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowMasterSuggestions(false), 200)}
                                    autoComplete="off"
                                />
                                {showMasterSuggestions && filteredMasterSuggestions.length > 0 && (
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
                                        {filteredMasterSuggestions.map((master) => (
                                            <li
                                                key={master.id}
                                                onClick={() => selectMaster(master)}
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
                                                <div style={{ fontWeight: '600' }}>{master.name}</div>
                                            </li>
                                        ))}
                                    </ul>
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
                                    {loading ? 'Сохранение...' : 'Создать Заказ'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn btn-glass"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                <ClientCardModal
                    isOpen={isClientModalOpen}
                    onClose={() => setIsClientModalOpen(false)}
                    clientId={foundClient?.id || null}
                />
            </div>
        </div>
    );
}
