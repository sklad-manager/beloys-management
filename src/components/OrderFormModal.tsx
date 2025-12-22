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
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', margin: '0 1rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Новый Заказ</h2>

                <form onSubmit={handleSubmit}>
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
                                            padding: '0 0.5rem',
                                            fontSize: '1.2rem',
                                            background: '#4cc9f0',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
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
                                    background: '#1a1a2e',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    zIndex: 1002,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {clientSuggestions.map((client) => (
                                        <li
                                            key={client.id}
                                            onClick={() => selectClient(client)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                color: 'var(--text-primary)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{client.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#8d99ae' }}>{client.phone}</div>
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
                                    if (formData.shoeType) {
                                        const filtered = shoeTypeSuggestions.filter(item =>
                                            item.toLowerCase().includes(formData.shoeType.toLowerCase())
                                        );
                                        setFilteredSuggestions(filtered);
                                        setShowSuggestions(true);
                                    } else {
                                        setFilteredSuggestions(shoeTypeSuggestions);
                                        setShowSuggestions(true);
                                    }
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
                                    background: '#1a1a2e',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    zIndex: 1001,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() => selectSuggestion(suggestion)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                color: 'var(--text-primary)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
                                    if (formData.brand) {
                                        const filtered = brandSuggestions.filter(item =>
                                            item.toLowerCase().includes(formData.brand.toLowerCase())
                                        );
                                        setFilteredBrandSuggestions(filtered);
                                        setShowBrandSuggestions(true);
                                    } else {
                                        setFilteredBrandSuggestions(brandSuggestions);
                                        setShowBrandSuggestions(true);
                                    }
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
                                    background: '#1a1a2e',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    zIndex: 1001,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {filteredBrandSuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() => selectBrandSuggestion(suggestion)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                color: 'var(--text-primary)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
                                    if (formData.color) {
                                        const filtered = colorSuggestions.filter(item =>
                                            item.toLowerCase().includes(formData.color.toLowerCase())
                                        );
                                        setFilteredColorSuggestions(filtered);
                                        setShowColorSuggestions(true);
                                    } else {
                                        setFilteredColorSuggestions(colorSuggestions);
                                        setShowColorSuggestions(true);
                                    }
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
                                    background: '#1a1a2e',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    zIndex: 1001,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {filteredColorSuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() => selectColorSuggestion(suggestion)}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                color: 'var(--text-primary)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
                            <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', position: 'relative' }}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        placeholder="Чистка, Покраска, Ремонт..."
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                        value={item.value}
                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                        onFocus={() => {
                                            if (item.value) {
                                                const filtered = serviceSuggestions.filter(s =>
                                                    s.toLowerCase().includes(item.value.toLowerCase())
                                                );
                                                setFilteredServiceSuggestions(filtered);
                                                setActiveServiceIndex(index);
                                            } else {
                                                setFilteredServiceSuggestions(serviceSuggestions);
                                                setActiveServiceIndex(index);
                                            }
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
                                            background: '#1a1a2e',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '8px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            zIndex: 1001,
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                        }}>
                                            {filteredServiceSuggestions.map((suggestion, i) => (
                                                <li
                                                    key={i}
                                                    onClick={() => selectServiceSuggestion(suggestion)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
                                        style={{ padding: '0 1rem', background: 'rgba(255,0,0,0.2)', color: '#ff6b6b' }}
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
                            style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.9rem' }}
                        >
                            + Добавить услугу
                        </button>
                    </div>

                    {/* Мастер */}
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <label style={labelStyle}>Мастер</label>
                        <input
                            name="masterName"
                            placeholder="Выберите мастера"
                            style={inputStyle}
                            value={formData.masterName}
                            onChange={handleMasterChange}
                            onFocus={() => {
                                if (formData.masterName) {
                                    const filtered = masters.filter(item =>
                                        item.name.toLowerCase().includes(formData.masterName.toLowerCase())
                                    );
                                    setFilteredMasterSuggestions(filtered);
                                } else {
                                    setFilteredMasterSuggestions(masters);
                                }
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
                                background: '#1a1a2e',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                zIndex: 1002,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                            }}>
                                {filteredMasterSuggestions.map((master) => (
                                    <li
                                        key={master.id}
                                        onClick={() => selectMaster(master)}
                                        style={{
                                            padding: '0.75rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            color: 'var(--text-primary)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{master.name}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Деньги */}
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Итоговая Цена</label>
                                <input
                                    name="price"
                                    type="number"
                                    placeholder="0"
                                    required
                                    style={{ ...inputStyle, marginBottom: 0, borderColor: 'var(--accent-primary)' }}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Предоплата</label>
                                <input
                                    name="prepayment"
                                    type="number"
                                    placeholder="0"
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Способ</label>
                                <select name="paymentMethod" style={{ ...inputStyle, marginBottom: 0 }} onChange={handleChange}>
                                    <option value="Cash" style={{ color: 'black' }}>Наличные</option>
                                    <option value="Terminal" style={{ color: 'black' }}>Карта / Терминал</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Комментарий</label>
                        <input
                            name="comment"
                            placeholder="Доп. информация..."
                            style={inputStyle}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-glass"
                            style={{ flex: 1 }}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                        >
                            {loading ? 'Сохранение...' : 'Создать Заказ'}
                        </button>
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
