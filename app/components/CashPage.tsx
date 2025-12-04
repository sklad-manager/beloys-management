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
            <h1 className="text-3xl font-bold mb-6">Касса</h1>

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
        </div>
    );
}
