'use client';

import { useState, useEffect } from 'react';

interface Transaction {
    id: number;
    date: string;
    type: string;
    amount: number;
    description: string;
    category: string;
}

interface CashModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CashModal({ isOpen, onClose }: CashModalProps) {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [mode, setMode] = useState<'view' | 'add'>('view');
    const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cash');
            const data = await res.json();
            setBalance(data.balance || 0);
            setTransactions(data.transactions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
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
                    category: 'Manual'
                })
            });

            if (res.ok) {
                setAmount('');
                setDescription('');
                setMode('view');
                fetchData(); // Refresh list
            }
        } catch (e) {
            console.error(e);
        }
    };

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
            <div className="glass-card" style={{ width: '100%', maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                    <h2>💰 Касса</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Balance */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Текущий баланс</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: balance >= 0 ? '#4ade80' : '#f87171', textShadow: '0 0 20px rgba(74, 222, 128, 0.2)' }}>
                        {balance.toLocaleString()} грн
                    </div>
                </div>

                {/* Content */}
                {mode === 'view' ? (
                    <>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
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
                                            <div style={{ fontSize: '0.8rem', color: 'gray' }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div style={{ color: t.type === 'Income' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                            {t.type === 'Income' ? '+' : '-'}{t.amount} грн
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    /* Add Form */
                    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
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
                                    border: 'none'
                                }}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
