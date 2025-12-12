'use client';

import { useState } from 'react';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function OrderFormModal({ isOpen, onClose, onSubmit }: OrderFormModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        phone: '',
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

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
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
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-subtle)',
        color: 'white',
        marginBottom: '1rem',
        outline: 'none',
        fontSize: '1rem'
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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', margin: '0 1rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Новый Заказ</h2>

                <form onSubmit={handleSubmit}>
                    {/* Клиент */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Имя Клиента</label>
                            <input
                                name="clientName"
                                required
                                placeholder="Иван Иванов"
                                style={inputStyle}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Телефон</label>
                            <input
                                name="phone"
                                required
                                placeholder="+380 (XX) XXX-XX-XX"
                                style={inputStyle}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Обувь */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Тип обуви / Изделия</label>
                            <input
                                name="shoeType"
                                placeholder="Кроссовки, Туфли..."
                                style={inputStyle}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Бренд</label>
                            <input
                                name="brand"
                                placeholder="Nike, Gucci..."
                                style={inputStyle}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Детали */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Цвет</label>
                            <input
                                name="color"
                                placeholder="Черный"
                                style={inputStyle}
                                onChange={handleChange}
                            />
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
                        <label style={labelStyle}>Услуги (через запятую)</label>
                        <textarea
                            name="services"
                            rows={2}
                            placeholder="Чистка, Покраска, Ремонт супинатора..."
                            style={{ ...inputStyle, resize: 'none' }}
                            onChange={handleChange}
                        />
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
            </div>
        </div>
    );
}
