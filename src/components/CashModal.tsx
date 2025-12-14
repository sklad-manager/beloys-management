'use client';

import { useState, useEffect } from 'react';

interface Transaction {
    id: number;
    date: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    method: string;
}

interface CashModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CashModal({ isOpen, onClose }: CashModalProps) {
    const [cashBalance, setCashBalance] = useState(0);
    const [terminalBalance, setTerminalBalance] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [mode, setMode] = useState<'view' | 'add' | 'report' | 'inventory'>('view');
    const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Terminal'>('Cash');

    // Report State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    // Inventory State
    const [actualCash, setActualCash] = useState('');
    const [actualTerminal, setActualTerminal] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cash');
            const data = await res.json();
            setCashBalance(data.cashBalance || 0);
            setTerminalBalance(data.terminalBalance || 0);
            setTotalBalance(data.totalBalance || 0);
            setTransactions(data.transactions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setMode('view');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        try {
            const res = await fetch('/api/cash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: txType,
                    amount,
                    description,
                    category: 'Manual',
                    method: paymentMethod
                })
            });

            if (res.ok) {
                setAmount('');
                setDescription('');
                setPaymentMethod('Cash');
                setMode('view');
                fetchData(); // Refresh list
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCorrection = async (type: 'Cash' | 'Terminal', actual: number, expected: number) => {
        const diff = actual - expected;
        if (Math.abs(diff) < 0.01) return;

        try {
            await fetch('/api/cash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: diff > 0 ? 'Income' : 'Expense',
                    amount: Math.abs(diff),
                    description: `Корректировка инвентаризации (${type === 'Cash' ? 'Наличные' : 'Терминал'})`,
                    category: 'Inventory',
                    method: type
                })
            });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const submitInventory = async () => {
        if (actualCash) {
            await handleCorrection('Cash', parseFloat(actualCash), cashBalance);
        }
        if (actualTerminal) {
            await handleCorrection('Terminal', parseFloat(actualTerminal), terminalBalance);
        }
        setActualCash('');
        setActualTerminal('');
        setMode('view');
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            setFilteredTransactions(transactions);
            return;
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filtered = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= start && txDate <= end;
        });

        setFilteredTransactions(filtered);
    };

    const setQuickFilter = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    useEffect(() => {
        if (mode === 'report') {
            applyDateFilter();
        }
    }, [startDate, endDate, transactions, mode]);

    if (!isOpen) return null;

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
            <div className="glass-card" style={{ width: '100%', maxWidth: '1100px', height: '97vh', display: 'flex', flexDirection: 'column', position: 'relative', margin: '0 1rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                    <h2>💰 Касса</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Balance Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {/* Cash Balance */}
                    <div style={{
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💵</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Наличные</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
                            {cashBalance.toLocaleString()} грн
                        </div>
                    </div>

                    {/* Terminal Balance */}
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💳</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Терминал</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a5b4fc' }}>
                            {terminalBalance.toLocaleString()} грн
                        </div>
                    </div>

                    {/* Total Balance */}
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Общий</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalBalance >= 0 ? '#fbbf24' : '#f87171' }}>
                            {totalBalance.toLocaleString()} грн
                        </div>
                    </div>
                </div>

                {/* Content */}
                {mode === 'view' ? (
                    <>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => { setMode('add'); setTxType('Income'); }}
                                className="btn"
                                style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}
                            >
                                + Внести
                            </button>
                            <button
                                onClick={() => { setMode('add'); setTxType('Expense'); }}
                                className="btn"
                                style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}
                            >
                                - Изъять
                            </button>
                            <button
                                onClick={() => { setMode('report'); setQuickFilter(0); }}
                                className="btn btn-glass"
                            >
                                📈 Отчет
                            </button>
                            <button
                                onClick={() => setMode('inventory')}
                                className="btn btn-glass"
                            >
                                📊 Инвентаризация
                            </button>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
                            {transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'gray', marginTop: '2rem' }}>История пуста</div>
                            ) : (
                                transactions.map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{t.description || 'Без описания'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'gray' }}>{formatDate(t.date)}</div>
                                        </div>
                                        <div style={{ color: t.type === 'Income' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                            {t.type === 'Income' ? '+' : '-'}{t.amount} грн
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : mode === 'add' ? (
                    /* Add Form */
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center', color: txType === 'Income' ? '#4ade80' : '#f87171' }}>
                                {txType === 'Income' ? 'Внесение денег' : 'Изъятие денег'}
                            </h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Сумма</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    autoFocus
                                    required
                                    style={{
                                        width: '100%', padding: '1rem', fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Комментарий / Причина</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={txType === 'Income' ? 'Например: Пополнение, Оплата...' : 'Например: Аренда, Закупка...'}
                                    required
                                    style={{
                                        width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white'
                                    }}
                                />
                            </div>

                            {/* Payment Method Selection */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Способ оплаты</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Cash')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: paymentMethod === 'Cash' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: paymentMethod === 'Cash' ? '2px solid #4ade80' : '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            color: paymentMethod === 'Cash' ? '#4ade80' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <div>💵</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>Наличные</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Terminal')}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: paymentMethod === 'Terminal' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: paymentMethod === 'Terminal' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                                            borderRadius: '12px',
                                            color: paymentMethod === 'Terminal' ? '#a5b4fc' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <div>💳</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>Терминал</div>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setMode('view')}
                                    className="btn btn-glass"
                                    style={{ flex: 1 }}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{
                                        flex: 2,
                                        background: txType === 'Income' ? '#4ade80' : '#f87171',
                                        color: 'black',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    ✓ Выполнить
                                </button>
                            </div>
                        </form>
                    </div>
                ) : mode === 'report' ? (
                    /* Report View */
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📈 Отчет по кассе</h3>



                        {/* Date Inputs */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'gray', marginBottom: '0.3rem' }}>От</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'gray', marginBottom: '0.3rem' }}>До</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#4ade80' }}>Приход:</span>
                                <span style={{ fontWeight: 'bold' }}>+{filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} грн</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#f87171' }}>Расход:</span>
                                <span style={{ fontWeight: 'bold' }}>-{filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} грн</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Итого за период:</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>
                                    {(filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0) - filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0)).toLocaleString()} грн
                                </span>
                            </div>
                        </div>

                        {/* Filtered List */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {filteredTransactions.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{t.description || 'Без описания'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{formatDate(t.date)} • {t.method === 'Terminal' ? '💳' : '💵'}</div>
                                    </div>
                                    <div style={{ color: t.type === 'Income' ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {t.type === 'Income' ? '+' : '-'}{t.amount}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setMode('view')} className="btn btn-glass" style={{ width: '100%', marginTop: '1rem' }}>
                            Назад
                        </button>
                    </div>
                ) : (
                    /* Inventory Mode */
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#a5b4fc' }}>📊 Инвентаризация</h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1.5rem', background: 'rgba(74, 222, 128, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ color: '#4ade80', margin: 0 }}>💵 Наличные</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'gray' }}>По системе: {cashBalance.toLocaleString()} грн</div>
                                </div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Фактический остаток:</label>
                                <input
                                    type="number"
                                    value={actualCash}
                                    onChange={e => setActualCash(e.target.value)}
                                    placeholder={cashBalance.toString()}
                                    style={{
                                        width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '1.2rem'
                                    }}
                                />
                                {actualCash && (
                                    <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.9rem' }}>
                                        Расхождение:
                                        <span style={{
                                            color: (parseFloat(actualCash) - cashBalance) >= 0 ? '#4ade80' : '#f87171',
                                            fontWeight: 'bold', marginLeft: '0.5rem'
                                        }}>
                                            {(parseFloat(actualCash) - cashBalance) > 0 ? '+' : ''}
                                            {(parseFloat(actualCash) - cashBalance).toLocaleString()} грн
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ color: '#a5b4fc', margin: 0 }}>💳 Терминал</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'gray' }}>По системе: {terminalBalance.toLocaleString()} грн</div>
                                </div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Фактический остаток:</label>
                                <input
                                    type="number"
                                    value={actualTerminal}
                                    onChange={e => setActualTerminal(e.target.value)}
                                    placeholder={terminalBalance.toString()}
                                    style={{
                                        width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white', fontSize: '1.2rem'
                                    }}
                                />
                                {actualTerminal && (
                                    <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.9rem' }}>
                                        Расхождение:
                                        <span style={{
                                            color: (parseFloat(actualTerminal) - terminalBalance) >= 0 ? '#4ade80' : '#f87171',
                                            fontWeight: 'bold', marginLeft: '0.5rem'
                                        }}>
                                            {(parseFloat(actualTerminal) - terminalBalance) > 0 ? '+' : ''}
                                            {(parseFloat(actualTerminal) - terminalBalance).toLocaleString()} грн
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setMode('view')}
                                className="btn btn-glass"
                                style={{ flex: 1 }}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={submitInventory}
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                            >
                                ✓ Завершить инвентаризацию
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
