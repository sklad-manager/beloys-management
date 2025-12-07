'use client';

import { useState, useEffect } from 'react';
import XLSX from 'xlsx-js-style';

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

    // Состояние для отчета
    const [showDateSelectionModal, setShowDateSelectionModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState({
        type: 'date' as 'date' | 'period',
        date: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // Данные для отчета
    const [reportData, setReportData] = useState<{
        transactions: Transaction[];
        summary: { income: number; expense: number };
    }>({
        transactions: [],
        summary: { income: 0, expense: 0 }
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

    // Генерация отчета
    const handleGenerateReport = () => {
        const filtered = transactions.filter(t => {
            const tDate = t.date.split('T')[0];
            if (reportConfig.type === 'date') {
                return tDate === reportConfig.date;
            }
            if (reportConfig.type === 'period') {
                return tDate >= reportConfig.startDate && tDate <= reportConfig.endDate;
            }
            return true;
        });

        const summary = filtered.reduce((acc, t) => {
            if (t.type === 'Income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });

        setReportData({ transactions: filtered, summary });
        setShowDateSelectionModal(false);
        setShowReportModal(true);
    };

    // Печать отчета
    const handlePrintReport = () => {
        const printContent = document.getElementById('report-content');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Отчет по кассе</title>
                        <style>
                            body { font-family: sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f3f4f6; }
                            .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                            .summary-item { text-align: center; padding: 10px; background: #f9fafb; border-radius: 8px; }
                            .income { color: #16a34a; font-weight: bold; }
                            .expense { color: #dc2626; font-weight: bold; }
                            .header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h2>Отчет по кассе</h2>
                            <p>${reportConfig.type === 'date'
                    ? new Date(reportConfig.date).toLocaleDateString('ru-RU')
                    : `${new Date(reportConfig.startDate).toLocaleDateString('ru-RU')} - ${new Date(reportConfig.endDate).toLocaleDateString('ru-RU')}`
                }</p>
                        </div>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    // Экспорт в Excel
    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Подготовка данных
        const data = [
            ['Дата', 'Тип', 'Категория', 'Описание', 'Наличные', 'Безналичные']
        ];

        reportData.transactions.forEach(t => {
            data.push([
                new Date(t.date).toLocaleDateString('ru-RU'),
                t.type === 'Income' ? 'Приход' : 'Расход',
                t.category,
                t.description,
                t.method === 'Cash' ? t.amount : '',
                t.method === 'Terminal' ? t.amount : ''
            ] as any);
        });

        // Добавление итогов
        data.push(['', '', '', '', '', '']); // Пустая строка
        data.push([
            'ИТОГО:',
            '',
            '',
            '',
            reportData.transactions.filter(t => t.method === 'Cash').reduce((acc, t) => t.type === 'Income' ? acc + t.amount : acc - t.amount, 0),
            reportData.transactions.filter(t => t.method === 'Terminal').reduce((acc, t) => t.type === 'Income' ? acc + t.amount : acc - t.amount, 0)
        ] as any);

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Стилизация
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');

        for (let R = range.s.r; R <= range.e.r; ++R) {
            const typeCellRef = XLSX.utils.encode_cell({ r: R, c: 1 }); // Колонка "Тип" (индекс 1)
            if (!ws[typeCellRef]) continue;

            const cellValue = ws[typeCellRef].v;
            if (cellValue === 'Приход') {
                ws[typeCellRef].s = {
                    font: { color: { rgb: "008000" }, bold: true } // Зеленый
                };
            } else if (cellValue === 'Расход') {
                ws[typeCellRef].s = {
                    font: { color: { rgb: "FF0000" }, bold: true } // Красный
                };
            }
        }

        // Жирный шрифт для заголовков
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerRef = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ws[headerRef]) {
                ws[headerRef].s = { font: { bold: true } };
            }
        }

        // Настройка ширины колонок
        const wscols = [
            { wch: 12 }, // Дата
            { wch: 10 }, // Тип
            { wch: 20 }, // Категория
            { wch: 40 }, // Описание
            { wch: 15 }, // Наличные
            { wch: 15 }  // Безналичные
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Отчет");

        const fileName = `Otchet_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (loading) {
        return <div className="p-6">Загрузка...</div>;
    }

    // Фильтрация транзакций (для основного списка - всегда все)
    // Сортировка транзакций (новые сверху)
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.id - a.id;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Касса</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInventoryModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Инвентаризация
                    </button>
                    <button
                        onClick={() => setShowDateSelectionModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Календарь
                    </button>
                </div>
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
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
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

            {/* Модальное окно выбора даты для отчета */}
            {showDateSelectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDateSelectionModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Выберите период</h2>
                            <button onClick={() => setShowDateSelectionModal(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setReportConfig({ ...reportConfig, type: 'date' })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${reportConfig.type === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Конкретная дата
                                </button>
                                <button
                                    onClick={() => setReportConfig({ ...reportConfig, type: 'period' })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${reportConfig.type === 'period' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Период
                                </button>
                            </div>

                            {reportConfig.type === 'date' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Дата</label>
                                    <input
                                        type="date"
                                        value={reportConfig.date}
                                        onChange={(e) => setReportConfig({ ...reportConfig, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {reportConfig.type === 'period' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">С</label>
                                        <input
                                            type="date"
                                            value={reportConfig.startDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">По</label>
                                        <input
                                            type="date"
                                            value={reportConfig.endDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleGenerateReport}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                            >
                                Показать отчет
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно отчета */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Отчет по кассе</h2>
                                <p className="text-sm text-gray-500">
                                    {reportConfig.type === 'date'
                                        ? new Date(reportConfig.date).toLocaleDateString('ru-RU')
                                        : `${new Date(reportConfig.startDate).toLocaleDateString('ru-RU')} - ${new Date(reportConfig.endDate).toLocaleDateString('ru-RU')}`
                                    }
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintReport}
                                    className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                                    title="Печать"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="text-gray-500 hover:text-green-600 transition-colors p-1"
                                    title="Скачать Excel"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                                <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700 p-1">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div id="report-content" className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 bg-blue-50 grid grid-cols-3 gap-4 border-b shrink-0">
                                <div className="text-center summary-item">
                                    <div className="text-xs text-gray-500 uppercase">Приход</div>
                                    <div className="text-lg font-bold text-green-600 income">+{reportData.summary.income.toFixed(2)} ₴</div>
                                </div>
                                <div className="text-center summary-item">
                                    <div className="text-xs text-gray-500 uppercase">Расход</div>
                                    <div className="text-lg font-bold text-red-600 expense">-{reportData.summary.expense.toFixed(2)} ₴</div>
                                </div>
                                <div className="text-center summary-item">
                                    <div className="text-xs text-gray-500 uppercase">Итог</div>
                                    <div className={`text-lg font-bold ${reportData.summary.income - reportData.summary.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {(reportData.summary.income - reportData.summary.expense) > 0 ? '+' : ''}
                                        {(reportData.summary.income - reportData.summary.expense).toFixed(2)} ₴
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-0 flex-1">
                                {reportData.transactions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Нет операций за выбранный период
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Дата</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Тип</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Способ</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Описание</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Сумма</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reportData.transactions.map((transaction) => (
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
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
