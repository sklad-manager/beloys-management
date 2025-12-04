'use client';

import { useState, useEffect } from 'react';

interface Transaction {
    id: number;
    date: string;
    type: 'Income' | 'Expense';
    category: string;
    description: string;
    amount: number;
    method: 'Cash' | 'Terminal';
}

// Категории трат
const EXPENSE_CATEGORIES = [
    'ЗП',
    'Вода',
    'Интернет',
    'Комуналка',
    'Аренда',
    'Канцтовары',
    'Пополнение',
    'Выдача под отчет',
    'Другое'
];

export default function CashPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Форма новой транзакции
    const [formData, setFormData] = useState({
        type: 'Income' as 'Income' | 'Expense',
        method: 'Cash' as 'Cash' | 'Terminal',
        amount: '',
        category: 'Другое', // Категория траты (только для расходов)
        description: '', // Описание для приходов или комментарий для "Другое"
        date: new Date().toISOString().split('T')[0],
    });

    // Состояние для инвентаризации
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [inventoryData, setInventoryData] = useState({
        actualCash: '',
        actualTerminal: ''
    });

    // Загрузка транзакций
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const response = await fetch('/api/cash');
            const data = await response.json();
            setTransactions(data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            setLoading(false);
        }
    };

    // Расчет балансов
    const calculateBalances = () => {
        let cashBalance = 0;
        let terminalBalance = 0;

        transactions.forEach(t => {
            const amount = t.type === 'Income' ? t.amount : -t.amount;
            if (t.method === 'Cash') {
                cashBalance += amount;
            } else {
                terminalBalance += amount;
            }
        });

        return { cashBalance, terminalBalance, totalBalance: cashBalance + terminalBalance };
    };

    const balances = calculateBalances();

    // Добавление транзакции
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Введите корректную сумму');
            return;
        }

        try {
            const response = await fetch('/api/cash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: formData.date,
                    type: formData.type,
                    category: formData.type === 'Income' ? 'Приход' : formData.category,
                    description: formData.type === 'Income'
                        ? formData.description || 'Приход'
                        : (formData.category === 'Другое' && formData.description ? formData.description : formData.category),
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                }),
            });

            if (response.ok) {
                await loadTransactions();
                setFormData({
                    ...formData,
                    amount: '',
                    category: 'Другое',
                    description: '',
                });
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении транзакции');
        }
    };

    // Обработка инвентаризации
    const handleInventorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const actualCash = parseFloat(inventoryData.actualCash || '0');
        const actualTerminal = parseFloat(inventoryData.actualTerminal || '0');

        const diffCash = actualCash - balances.cashBalance;
        const diffTerminal = actualTerminal - balances.terminalBalance;

        if (diffCash === 0 && diffTerminal === 0) {
            alert('Расхождений не найдено');
            setShowInventoryModal(false);
            return;
        }

        try {
            const promises = [];

            // Корректировка наличных
            if (diffCash !== 0) {
                promises.push(fetch('/api/cash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        type: diffCash > 0 ? 'Income' : 'Expense',
                        category: 'Инвентаризация',
                        description: `Инвентаризация (Нал). Факт: ${actualCash}. Разница: ${diffCash > 0 ? '+' : ''}${diffCash.toFixed(2)}`,
                        amount: Math.abs(diffCash),
                        method: 'Cash',
                    }),
                }));
            }

            // Корректировка безнала
            if (diffTerminal !== 0) {
                promises.push(fetch('/api/cash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        type: diffTerminal > 0 ? 'Income' : 'Expense',
                        category: 'Инвентаризация',
                        description: `Инвентаризация (Безнал). Факт: ${actualTerminal}. Разница: ${diffTerminal > 0 ? '+' : ''}${diffTerminal.toFixed(2)}`,
                        amount: Math.abs(diffTerminal),
                        method: 'Terminal',
                    }),
                }));
            }

            await Promise.all(promises);
            await loadTransactions();
            setShowInventoryModal(false);
            setInventoryData({ actualCash: '', actualTerminal: '' });
            alert('Инвентаризация проведена успешно. Баланс скорректирован.');

        } catch (error) {
            console.error('Ошибка инвентаризации:', error);
            alert('Ошибка при проведении инвентаризации');
        }
    };

    if (loading) {
        return <div className="p-6">Загрузка...</div>;
    }

    // Сортировка транзакций (новые сверху)
    // Сначала по дате, затем по ID для транзакций с одинаковой датой
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.id - a.id; // Если даты одинаковые, сортируем по ID (новые сверху)
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Касса</h1>
                <button
                    onClick={() => setShowInventoryModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Инвентаризация
                </button>
            </div>

            {/* Панель баланса */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Наличные</div>
                    <div className="text-3xl font-bold">{balances.cashBalance.toFixed(2)} ₴</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Безналичные</div>
                    <div className="text-3xl font-bold">{balances.terminalBalance.toFixed(2)} ₴</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Общий баланс</div>
                    <div className="text-3xl font-bold">{balances.totalBalance.toFixed(2)} ₴</div>
                </div>
            </div>

            {/* Форма добавления транзакции */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Новая операция</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Тип операции */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Тип операции</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Income">Приход</option>
                                <option value="Expense">Расход</option>
                            </select>
                        </div>

                        {/* Способ оплаты */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Способ оплаты</label>
                            <select
                                value={formData.method}
                                onChange={(e) => setFormData({ ...formData, method: e.target.value as 'Cash' | 'Terminal' })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Cash">Наличные</option>
                                <option value="Terminal">Безналичные</option>
                            </select>
                        </div>

                        {/* Сумма */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Сумма</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Дата */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Дата</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Категория (только для расходов) или Описание (для приходов) */}
                    {formData.type === 'Expense' ? (
                        <div>
                            <label className="block text-sm font-medium mb-2">Категория</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-2">Описание (необязательно)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Введите описание прихода"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Комментарий (только если расход и категория "Другое") */}
                    {formData.type === 'Expense' && formData.category === 'Другое' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Комментарий</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Укажите детали расхода"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Добавить операцию
                    </button>
                </form>
            </div>

            {/* История транзакций */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-bold">История операций</h2>
                </div>

                {sortedTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Нет транзакций. Добавьте первую операцию.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Дата</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Тип</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Способ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Описание</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Сумма</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transaction.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'Income'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {transaction.type === 'Income' ? '↑ Приход' : '↓ Расход'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.method === 'Cash'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {transaction.method === 'Cash' ? '💵 Нал' : '💳 Безнал'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'Income' ? '+' : '-'}{transaction.amount.toFixed(2)} ₴
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* Модальное окно инвентаризации */}
            {
                showInventoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowInventoryModal(false)}>
                        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Инвентаризация</h2>
                                <button onClick={() => setShowInventoryModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleInventorySubmit} className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <p className="text-sm text-blue-800 mb-2">Текущий расчетный баланс:</p>
                                    <div className="flex justify-between text-sm">
                                        <span>Наличные:</span>
                                        <span className="font-bold">{balances.cashBalance.toFixed(2)} ₴</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Безнал:</span>
                                        <span className="font-bold">{balances.terminalBalance.toFixed(2)} ₴</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Наличные (фактический остаток)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={inventoryData.actualCash}
                                        onChange={(e) => setInventoryData({ ...inventoryData, actualCash: e.target.value })}
                                        placeholder="Введите сумму в кассе"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Безналичные (фактический остаток)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={inventoryData.actualTerminal}
                                        onChange={(e) => setInventoryData({ ...inventoryData, actualTerminal: e.target.value })}
                                        placeholder="Введите сумму на счетах"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium mt-4"
                                >
                                    Подтвердить и выровнять баланс
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
