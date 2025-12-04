'use client';

import { useState, useEffect } from 'react';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Master {
    id: number;
    name: string;
    percentage: number;
}

interface ReferenceItem {
    id: number;
    type: string;
    value: string;
}

export default function OrderFormModal({ isOpen, onClose }: OrderFormModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        phone: '',
        quantity: 1,
        shoeType: '',
        brand: '',
        color: '',
        services: [] as string[],
        masterId: '',
        masterPrice: 0,
        materialPrice: 0,
        price: 0,
        prepayment: 0,
        paymentMethod: '',
        status: 'Принят в работу',
        comment: '',
    });

    const [masters, setMasters] = useState<Master[]>([]);
    const [references, setReferences] = useState<ReferenceItem[]>([]);
    const [currentService, setCurrentService] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
            fetchReferences();
        }
    }, [isOpen]);

    // Calculate total price when master price or material price changes
    useEffect(() => {
        const total = formData.masterPrice + formData.materialPrice;
        setFormData(prev => ({ ...prev, price: total }));
    }, [formData.masterPrice, formData.materialPrice]);

    const fetchMasters = async () => {
        try {
            const response = await fetch('/api/masters');
            const data = await response.json();
            setMasters(data);
        } catch (error) {
            console.error('Error fetching masters:', error);
        }
    };

    const fetchReferences = async () => {
        try {
            const response = await fetch('/api/references');
            const data = await response.json();
            setReferences(data);
        } catch (error) {
            console.error('Error fetching references:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'masterPrice' || name === 'materialPrice' || name === 'prepayment'
                ? parseFloat(value) || 0
                : value,
        }));
    };

    const addService = () => {
        if (currentService.trim()) {
            setFormData(prev => ({
                ...prev,
                services: [...prev.services, currentService.trim()],
            }));
            setCurrentService('');
        }
    };

    const removeService = (index: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    services: formData.services.join(', '),
                    masterId: parseInt(formData.masterId),
                }),
            });

            if (response.ok) {
                alert('Заказ успешно добавлен!');
                onClose();
                // Reset form
                setFormData({
                    clientName: '',
                    phone: '',
                    quantity: 1,
                    shoeType: '',
                    brand: '',
                    color: '',
                    services: [],
                    masterId: '',
                    masterPrice: 0,
                    materialPrice: 0,
                    price: 0,
                    prepayment: 0,
                    paymentMethod: '',
                    status: 'Принят в работу',
                    comment: '',
                });
            } else {
                alert('Ошибка при добавлении заказа');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Ошибка при добавлении заказа');
        }
    };

    if (!isOpen) return null;

    const getRefByType = (type: string) => references.filter(r => r.type === type);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Добавить новый заказ</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-center mb-4">Новый заказ</h3>

                    {/* Client Info */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Клиент:</label>
                        <input
                            type="text"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Телефон:</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Shoe Info */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Количество обуви:</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Вид обуви:</label>
                        <input
                            type="text"
                            name="shoeType"
                            value={formData.shoeType}
                            onChange={handleInputChange}
                            list="shoeTypes"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <datalist id="shoeTypes">
                            {getRefByType('SHOE_TYPE').map(item => (
                                <option key={item.id} value={item.value} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Бренд:</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            list="brands"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <datalist id="brands">
                            {getRefByType('BRAND').map(item => (
                                <option key={item.id} value={item.value} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Цвет:</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            list="colors"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <datalist id="colors">
                            {getRefByType('COLOR').map(item => (
                                <option key={item.id} value={item.value} />
                            ))}
                        </datalist>
                    </div>

                    {/* Services */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Услуги:</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentService}
                                onChange={(e) => setCurrentService(e.target.value)}
                                list="services"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Введите услугу"
                            />
                            <datalist id="services">
                                {getRefByType('SERVICE').map(item => (
                                    <option key={item.id} value={item.value} />
                                ))}
                            </datalist>
                        </div>
                        <button
                            type="button"
                            onClick={addService}
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            + Добавить услугу
                        </button>
                        {formData.services.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {formData.services.map((service, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
                                        <span>{service}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeService(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Master */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Мастер:</label>
                        <select
                            name="masterId"
                            value={formData.masterId}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Выберите мастера</option>
                            {masters.map(master => (
                                <option key={master.id} value={master.id}>
                                    {master.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pricing */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Цена мастера (грн.):</label>
                        <input
                            type="number"
                            name="masterPrice"
                            value={formData.masterPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Цена материалов (грн.):</label>
                        <input
                            type="number"
                            name="materialPrice"
                            value={formData.materialPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Итоговая цена (грн.):</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            readOnly
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                        />
                    </div>

                    {/* Payment */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Предоплата (грн.):</label>
                            <input
                                type="number"
                                name="prepayment"
                                value={formData.prepayment}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Способ оплаты:</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Выберите способ</option>
                                <option value="cash">Наличные</option>
                                <option value="terminal">Терминал</option>
                            </select>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Статус заказа:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Принят в работу">Принят в работу</option>
                            <option value="Выполнен">Выполнен</option>
                            <option value="Закрыт">Закрыт</option>
                        </select>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Комментарии:</label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                        Добавить заказ
                    </button>
                </form>
            </div>
        </div>
    );
}
