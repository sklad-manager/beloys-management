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

    const navBtnStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.75rem 1.5rem',
        background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.7)',
        color: active ? 'white' : 'var(--text-secondary)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: active ? 'var(--accent-glow)' : 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    });

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* Header */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: '1.25rem 2rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '45px',
                        height: '45px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                    }}>💰</div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '-0.02em' }}>Касса и Финансы</h2>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Управление денежными потоками</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0,0,0,0.05)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                >&times;</button>
            </header>

            <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Balance Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2.5rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>💵</div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#065f46', fontWeight: '600' }}>Наличные</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>
                                    {cashBalance.toLocaleString()} <span style={{ fontSize: '1.1rem' }}>грн</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>💳</div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#3730a3', fontWeight: '600' }}>Терминал</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4f46e5' }}>
                                    {terminalBalance.toLocaleString()} <span style={{ fontSize: '1.1rem' }}>грн</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>📈</div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: '600' }}>Общий остаток</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: totalBalance >= 0 ? '#d97706' : '#dc2626' }}>
                                    {totalBalance.toLocaleString()} <span style={{ fontSize: '1.1rem' }}>грн</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(0,0,0,0.03)',
                        padding: '0.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        gap: '0.5rem',
                        width: 'fit-content',
                        margin: '0 auto 2.5rem auto'
                    }}>
                        <button onClick={() => setMode('view')} style={navBtnStyle(mode === 'view')}>🕒 История</button>
                        <button onClick={() => { setMode('add'); setTxType('Income'); }} style={navBtnStyle(mode === 'add' && txType === 'Income')}>💰 Пополнение</button>
                        <button onClick={() => { setMode('add'); setTxType('Expense'); }} style={navBtnStyle(mode === 'add' && txType === 'Expense')}>📉 Списание</button>
                        <button onClick={() => setMode('report')} style={navBtnStyle(mode === 'report')}>📊 Отчеты</button>
                        <button onClick={() => setMode('inventory')} style={navBtnStyle(mode === 'inventory')}>📋 Ревизия</button>
                    </div>

                    {/* Content Section */}
                    <div style={{ position: 'relative' }}>
                        {mode === 'view' && (
                            <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.5)' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Последние операции</h3>
                                </div>
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {transactions.length === 0 ? (
                                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Здесь пока нет записей...
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <th style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ДАТА</th>
                                                    <th style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ОПИСАНИЕ</th>
                                                    <th style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>МЕТОД</th>
                                                    <th style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>СУММА</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map(t => (
                                                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} className="table-row-hover">
                                                        <td style={{ padding: '1rem 2rem', fontSize: '0.9rem' }}>{formatDate(t.date)}</td>
                                                        <td style={{ padding: '1rem 2rem' }}>
                                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{t.description || 'Ручная операция'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.category}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem 2rem' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: t.method === 'Terminal' ? '#eef2ff' : '#f0fdf4',
                                                                color: t.method === 'Terminal' ? '#4f46e5' : '#16a34a'
                                                            }}>{t.method === 'Terminal' ? '💳 Карта' : '💵 Нал'}</span>
                                                        </td>
                                                        <td style={{
                                                            padding: '1rem 2rem',
                                                            textAlign: 'right',
                                                            fontWeight: '700',
                                                            color: t.type === 'Income' ? '#22c55e' : '#ef4444',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {mode === 'add' && (
                            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div className="glass-card" style={{ padding: '2.5rem' }}>
                                    <h3 style={{
                                        textAlign: 'center',
                                        marginBottom: '2rem',
                                        color: txType === 'Income' ? '#16a34a' : '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        {txType === 'Income' ? '➕ Пополнение кассы' : '➖ Списание средств'}
                                    </h3>

                                    <form onSubmit={handleSubmit}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Сумма операции</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    className="input"
                                                    type="number"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    required
                                                    autoFocus
                                                    style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', paddingRight: '4rem' }}
                                                />
                                                <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-muted)' }}>грн</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Назначение платежа</label>
                                            <input
                                                className="input"
                                                type="text"
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="Введите причину..."
                                                required
                                            />
                                        </div>

                                        <div style={{ marginBottom: '2.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Источник / Метод</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('Cash')}
                                                    style={{
                                                        flex: 1, padding: '1rem', border: '2px solid',
                                                        borderRadius: '16px', display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: '0.2s',
                                                        borderColor: paymentMethod === 'Cash' ? '#22c55e' : 'var(--border-subtle)',
                                                        background: paymentMethod === 'Cash' ? '#f0fdf4' : 'white',
                                                        color: paymentMethod === 'Cash' ? '#16a34a' : 'var(--text-secondary)'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem' }}>💵</span>
                                                    <span style={{ fontWeight: '600' }}>Наличные</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('Terminal')}
                                                    style={{
                                                        flex: 1, padding: '1rem', border: '2px solid',
                                                        borderRadius: '16px', display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: '0.2s',
                                                        borderColor: paymentMethod === 'Terminal' ? '#6366f1' : 'var(--border-subtle)',
                                                        background: paymentMethod === 'Terminal' ? '#eef2ff' : 'white',
                                                        color: paymentMethod === 'Terminal' ? '#4f46e5' : 'var(--text-secondary)'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                                                    <span style={{ fontWeight: '600' }}>Терминал</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="button" onClick={() => setMode('view')} className="btn btn-glass" style={{ flex: 1 }}>Отмена</button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                style={{
                                                    flex: 2,
                                                    background: txType === 'Income' ? 'linear-gradient(to right, #22c55e, #16a34a)' : 'linear-gradient(to right, #ef4444, #dc2626)',
                                                    border: 'none',
                                                    fontWeight: '700'
                                                }}
                                            >Подтвердить операцию</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {mode === 'report' && (
                            <div className="animate-fade-in glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3>Финансовый отчет</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setQuickFilter(0)} style={{ ...navBtnStyle(startDate === (new Date().toISOString().split('T')[0])), padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Сегодня</button>
                                        <button onClick={() => setQuickFilter(7)} style={{ ...navBtnStyle(false), padding: '0.4rem 1rem', fontSize: '0.8rem' }}>7 дней</button>
                                        <button onClick={() => setQuickFilter(30)} style={{ ...navBtnStyle(false), padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Месяц</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Начало периода</label>
                                        <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Конец периода</label>
                                        <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ color: '#059669', fontWeight: '600' }}>Общий приход</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>+{filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>грн</span></div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ color: '#dc2626', fontWeight: '600' }}>Общий расход</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>-{filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>грн</span></div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Чистая разница</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{(filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0) - filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0)).toLocaleString()} <span style={{ fontSize: '0.9rem' }}>грн</span></div>
                                    </div>
                                </div>

                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {filteredTransactions.map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{t.description || 'Операция'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(t.date)} • {t.method}</div>
                                            </div>
                                            <div style={{ color: t.type === 'Income' ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                                                {t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString()} грн
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {mode === 'inventory' && (
                            <div className="animate-fade-in glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦 Ревизия кассы</h3>
                                    <p>Сверьте фактическую сумму в кассе с данными программы</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                    <div style={{ padding: '2rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '24px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <span style={{ fontWeight: '600' }}>💵 Наличные</span>
                                            <span style={{ color: 'var(--text-muted)' }}>В системе: {cashBalance}</span>
                                        </div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Фактически:</label>
                                        <input
                                            className="input"
                                            type="number"
                                            value={actualCash}
                                            onChange={e => setActualCash(e.target.value)}
                                            placeholder={cashBalance.toString()}
                                            style={{ fontSize: '1.5rem', fontWeight: '700', textAlign: 'center' }}
                                        />
                                        {actualCash && (
                                            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                                Разница: <span style={{ fontWeight: '700', color: (parseFloat(actualCash) - cashBalance) >= 0 ? '#16a34a' : '#ef4444' }}>
                                                    {(parseFloat(actualCash) - cashBalance) > 0 ? '+' : ''}
                                                    {(parseFloat(actualCash) - cashBalance).toLocaleString()} грн
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <span style={{ fontWeight: '600' }}>💳 Терминал</span>
                                            <span style={{ color: 'var(--text-muted)' }}>В системе: {terminalBalance}</span>
                                        </div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Фактически:</label>
                                        <input
                                            className="input"
                                            type="number"
                                            value={actualTerminal}
                                            onChange={e => setActualTerminal(e.target.value)}
                                            placeholder={terminalBalance.toString()}
                                            style={{ fontSize: '1.5rem', fontWeight: '700', textAlign: 'center' }}
                                        />
                                        {actualTerminal && (
                                            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                                Разница: <span style={{ fontWeight: '700', color: (parseFloat(actualTerminal) - terminalBalance) >= 0 ? '#16a34a' : '#ef4444' }}>
                                                    {(parseFloat(actualTerminal) - terminalBalance) > 0 ? '+' : ''}
                                                    {(parseFloat(actualTerminal) - terminalBalance).toLocaleString()} грн
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setMode('view')} className="btn btn-glass" style={{ flex: 1 }}>Завтра</button>
                                    <button onClick={submitInventory} className="btn btn-primary" style={{ flex: 2, fontWeight: '700' }}>Завершить ревизию</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .table-row-hover:hover {
                    background: rgba(0,0,0,0.02);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
