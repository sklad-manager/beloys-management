'use client';

import { useState } from 'react';
import SearchableSelect from './SearchableSelect';
import { SHOE_TYPES, BRANDS, COLORS, SERVICES } from '../data/references';

interface OrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (orderData: any) => void;
}

interface Service {
    id: string;
    name: string;
}

export default function OrderFormModal({ isOpen, onClose, onSubmit }: OrderFormModalProps) {
    const [formData, setFormData] = useState({
        client: '',
        phone: '',
        shoeCount: '1',
        shoeType: '',
        brand: '',
        color: '',
        comment: ''
    });

    const [services, setServices] = useState<Service[]>([{ id: '1', name: '' }]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleServiceChange = (id: string, value: string) => {
        setServices(prev =>
            prev.map(service => (service.id === id ? { ...service, name: value } : service))
        );
    };

    const addService = () => {
        const newId = (Math.max(...services.map(s => parseInt(s.id))) + 1).toString();
        setServices(prev => [...prev, { id: newId, name: '' }]);
    };

    const removeService = (id: string) => {
        if (services.length > 1) {
            setServices(prev => prev.filter(service => service.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const orderData = {
            ...formData,
            services: services.filter(s => s.name).map(s => s.name),
            dateReceived: new Date().toISOString(),
        };

        onSubmit(orderData);

        // Сброс формы
        setFormData({
            client: '',
            phone: '',
            shoeCount: '1',
            shoeType: '',
            brand: '',
            color: '',
            comment: ''
        });
        setServices([{ id: '1', name: '' }]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
                {/* Заголовок */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-slate-700">Новый заказ</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Клиент */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Клиент:</label>
                            <input
                                type="text"
                                value={formData.client}
                                onChange={(e) => handleInputChange('client', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Телефон */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Телефон:</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Количество обуви */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Количество обуви:</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.shoeCount}
                                onChange={(e) => handleInputChange('shoeCount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Вид обуви */}
                        <div>
                            <SearchableSelect
                                label="Вид обуви"
                                options={SHOE_TYPES}
                                value={formData.shoeType}
                                onChange={(value) => handleInputChange('shoeType', value)}
                                placeholder="Выберите вид обуви"
                            />
                        </div>

                        {/* Бренд */}
                        <div>
                            <SearchableSelect
                                label="Бренд"
                                options={BRANDS}
                                value={formData.brand}
                                onChange={(value) => handleInputChange('brand', value)}
                                placeholder="Выберите бренд"
                            />
                        </div>

                        {/* Цвет */}
                        <div>
                            <SearchableSelect
                                label="Цвет"
                                options={COLORS}
                                value={formData.color}
                                onChange={(value) => handleInputChange('color', value)}
                                placeholder="Выберите цвет"
                            />
                        </div>
                    </div>

                    {/* Услуги */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-slate-700">Услуги:</label>
                            <button
                                type="button"
                                onClick={addService}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Добавить услугу
                            </button>
                        </div>

                        <div className="space-y-3">
                            {services.map((service) => (
                                <div key={service.id} className="flex gap-2">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label=""
                                            options={SERVICES}
                                            value={service.name}
                                            onChange={(value) => handleServiceChange(service.id, value)}
                                            placeholder="Выберите услугу"
                                        />
                                    </div>
                                    {services.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeService(service.id)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors self-end"
                                            title="Удалить услугу"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Комментарий */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Комментарий:</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Дополнительная информация..."
                        />
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Принять заказ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
