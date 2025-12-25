import React, { useState, useEffect } from 'react';

interface SecretAdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SystemLog {
    id: number;
    type: string;
    action: string;
    targetId: string;
    details: string;
    oldData: any;
    newData: any;
    operator: string;
    date: string;
}

export default function SecretAdminDashboardModal({ isOpen, onClose }: SecretAdminDashboardModalProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [stats, setStats] = useState<any>(null);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [fixedCosts, setFixedCosts] = useState<any[]>([]);

    // Cashflow Filter
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

    // Fixed Costs State
    const [newFixedCostCategory, setNewFixedCostCategory] = useState('');
    const [newFixedCostAmount, setNewFixedCostAmount] = useState('');

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/admin/cashflow?year=${currentYear}&month=${currentMonth}`);
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchFixedCosts = async () => {
        try {
            const res = await fetch(`/api/admin/fixed-costs?year=${currentYear}&month=${currentMonth}`);
            if (res.ok) setFixedCosts(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchSystemLogs = async () => {
        try {
            const res = await fetch('/api/admin/system-logs');
            if (res.ok) setSystemLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'general' || activeTab === 'cashflow') {
                fetchStats();
                fetchFixedCosts();
            }
            if (activeTab === 'edits') {
                fetchSystemLogs();
            }
        }
    }, [isOpen, activeTab, currentYear, currentMonth]);

    const handleAddFixedCost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/fixed-costs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: currentYear,
                    month: currentMonth,
                    category: newFixedCostCategory,
                    amount: newFixedCostAmount
                })
            });
            if (res.ok) {
                setNewFixedCostCategory('');
                setNewFixedCostAmount('');
                fetchFixedCosts();
                fetchStats();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteFixedCost = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/fixed-costs?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchFixedCosts();
                fetchStats();
            }
        } catch (e) { console.error(e); }
    };

    const handleExportClients = async () => {
        try {
            const res = await fetch('/api/admin/export/clients');
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `clients_backup_${new Date().toLocaleDateString()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (e) { console.error(e); }
    };

    const renderChanges = (log: SystemLog) => {
        if (log.type === 'ORDER' && log.oldData && log.newData) {
            const changes: string[] = [];
            const oldD = log.oldData;
            const newD = log.newData;
            if (oldD.price !== newD.price) changes.push(`Цена: ${oldD.price} -> ${newD.price}`);
            if (oldD.shoeType !== newD.shoeType) changes.push(`Изделие: ${oldD.shoeType} -> ${newD.shoeType}`);
            if (oldD.brand !== newD.brand) changes.push(`Бренд: ${oldD.brand} -> ${newD.brand}`);
            if (oldD.color !== newD.color) changes.push(`Цвет: ${oldD.color} -> ${newD.color}`);
            if (oldD.quantity !== newD.quantity) changes.push(`Кол-во: ${oldD.quantity} -> ${newD.quantity}`);
            if (oldD.status !== newD.status) changes.push(`Статус: ${oldD.status} -> ${newD.status}`);

            if (changes.length === 0) return <span style={{ color: '#94a3b8' }}>{log.details}</span>;
            return (
                <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{log.details}</div>
                    {changes.map((c, i) => <div key={i} style={{ marginBottom: '2px', color: '#60a5fa' }}>• {c}</div>)}
                </div>
            );
        }

        return <span style={{ color: '#f8fafc' }}>{log.details}</span>;
    };

    if (!isOpen) return null;

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#020617', // Very dark slate
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif"
    };

    const headerStyle: React.CSSProperties = {
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(20px)'
    };

    const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '0.6rem 1.2rem',
        background: isActive ? 'linear-gradient(to right, #6366f1, #a855f7)' : 'rgba(255, 255, 255, 0.03)',
        border: isActive ? 'none' : '1px solid #334155',
        color: 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    });

    return (
        <div style={overlayStyle}>
            <header style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                        Executive Dashboard
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>Конфиденциально • Управление активами</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem', borderRadius: '16px', border: '1px solid #334155' }}>
                    <button style={tabButtonStyle(activeTab === 'general')} onClick={() => setActiveTab('general')}>Обзор</button>
                    <button style={tabButtonStyle(activeTab === 'cashflow')} onClick={() => setActiveTab('cashflow')}>Кешфло</button>
                    <button style={tabButtonStyle(activeTab === 'edits')} onClick={() => setActiveTab('edits')}>Логи</button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #334155',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✕
                </button>
            </header>

            <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                    {activeTab === 'general' && (
                        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Выручка (Месяц)</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats?.orders?.totalSum || '...'} ₴</div>
                                    <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem' }}>↑ 12% к прошлому месяцу</div>
                                </div>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Чистая прибыль</div>
                                    {stats && (
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#60a5fa' }}>
                                            {(stats.orders.totalSum - (stats.salaries.masterPaid + stats.salaries.masterDebt + stats.salaries.staffPaid + stats.salaries.staffDebt + stats.expenses.actual + stats.expenses.fixed)).toFixed(0)} ₴
                                        </div>
                                    )}
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>После всех выплат</div>
                                </div>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Заказов в работе</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats?.orders?.totalCount || '...'}</div>
                                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.5rem' }}>Активные сессии</div>
                                </div>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Окупаемость</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                        {stats ? ((stats.orders.totalSum / (stats.salaries.masterPaid + stats.salaries.masterDebt + stats.salaries.staffPaid + stats.salaries.staffDebt + stats.expenses.actual + stats.expenses.fixed)) * 100).toFixed(1) : '...'}%
                                    </div>
                                    <div style={{ color: '#60a5fa', fontSize: '0.8rem', marginTop: '0.5rem' }}>Текущий статус</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '2rem', borderRadius: '24px' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Стратегический обзор</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {['Оптимизация расходов', 'Увеличение среднего чека', 'Масштабирование филиалов', 'Программа лояльности PRO'].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid #334155' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }}></div>
                                                <span style={{ flex: 1 }}>{item}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>В ПЛАНЕ</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
                                        <h3 style={{ margin: '0 0 0.5rem 0' }}>Beloys VIP</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Доступ ко всем секретным функциям разблокирован</p>
                                        <button
                                            onClick={handleExportClients}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
                                            💾 Экспорт базы клиентов (CSV)
                                        </button>
                                        <button style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                            📄 Скачать отчет (PDF)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cashflow' && stats && (
                        <div style={{ animation: 'fadeIn 0.4s ease-out', display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
                            {/* Left: Fixed Costs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '24px' }}>
                                    <h3 style={{ marginTop: 0 }}>📊 Плановые траты (ФИКС)</h3>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <select value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('ru', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                        <input type="number" value={currentYear} onChange={e => setCurrentYear(parseInt(e.target.value))} style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                                    </div>

                                    <form onSubmit={handleAddFixedCost} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <select
                                            value={newFixedCostCategory}
                                            onChange={e => setNewFixedCostCategory(e.target.value)}
                                            style={{ padding: '0.75rem', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                            required
                                        >
                                            <option value="">Выберите категорию</option>
                                            <option value="Аренда">Аренда</option>
                                            <option value="Свет">Свет</option>
                                            <option value="Вода">Вода</option>
                                            <option value="Интернет">Интернет</option>
                                            <option value="Телефон">Телефон</option>
                                            <option value="Топливо">Топливо</option>
                                            <option value="Хоз. нужды">Хоз. нужды</option>
                                            <option value="Маркетинг">Маркетинг</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Сумма"
                                            value={newFixedCostAmount}
                                            onChange={e => setNewFixedCostAmount(e.target.value)}
                                            style={{ padding: '0.75rem', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                            required
                                        />
                                        <button type="submit" style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>+ Добавить в план</button>
                                    </form>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {fixedCosts.map(c => (
                                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid #334155' }}>
                                                <span>{c.category}</span>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{c.amount}₴</span>
                                                    <button onClick={() => handleDeleteFixedCost(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ padding: '12px', borderTop: '2px solid #6366f1', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                            <span>ИТОГО ФИКС:</span>
                                            <span>{stats.expenses.fixed}₴</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Analysis */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid #334155', borderRadius: '24px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Принято заказов</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.orders.totalSum}₴</div>
                                        <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>{stats.orders.totalCount} шт.</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid #334155', borderRadius: '24px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Готово (не забрано)</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.orders.readySum}₴</div>
                                        <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{stats.orders.readyCount} шт.</div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid #334155', borderRadius: '24px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Закрыто (Архив)</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.orders.archivedSum}₴</div>
                                        <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>{stats.orders.archivedCount} шт.</div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '2rem', borderRadius: '24px' }}>
                                    <h3 style={{ marginTop: 0 }}>📊 Финансовый результат</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <h4 style={{ color: '#94a3b8' }}>Расходы текущие:</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>ЗП Мастеров (начислено):</span>
                                                    <span>{(stats.salaries.masterPaid + stats.salaries.masterDebt).toFixed(0)}₴</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>ЗП Админ (начислено):</span>
                                                    <span>{(stats.salaries.staffPaid + stats.salaries.staffDebt).toFixed(0)}₴</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Переменные траты:</span>
                                                    <span>{stats.expenses.actual}₴</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 'bold' }}>
                                                    <span>ИТОГО РАСХОДОВ:</span>
                                                    <span>{(stats.salaries.masterPaid + stats.salaries.masterDebt + stats.salaries.staffPaid + stats.salaries.staffDebt + stats.expenses.actual + stats.expenses.fixed).toFixed(0)}₴</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                                            <h4 style={{ margin: 0 }}>Окупаемость и прогноз</h4>
                                            {(() => {
                                                const totalCosts = stats.salaries.masterPaid + stats.salaries.masterDebt + stats.salaries.staffPaid + stats.salaries.staffDebt + stats.expenses.actual + stats.expenses.fixed;
                                                const currentRevenue = stats.orders.totalSum;
                                                const profit = currentRevenue - totalCosts;

                                                const today = new Date();
                                                const daysPassed = (currentMonth === (today.getMonth() + 1)) ? today.getDate() : 30;
                                                const dailyAvg = currentRevenue / daysPassed;
                                                const breakEvenDay = Math.ceil(totalCosts / dailyAvg);
                                                const projectedRevenue = dailyAvg * 30;
                                                const projectedProfit = projectedRevenue - totalCosts;

                                                return (
                                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Текущая прибыль:</div>
                                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: profit >= 0 ? '#10b981' : '#ef4444' }}>
                                                                {profit.toFixed(0)}₴
                                                            </div>
                                                        </div>

                                                        <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                                                            <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                                                🎯 <b>Точка безубыточности:</b> {breakEvenDay > 31 ? 'В этом месяце не будет' : `${breakEvenDay}-е число`}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem' }}>
                                                                📈 <b>Прогноз на конец месяца:</b> <span style={{ color: projectedProfit >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{projectedProfit.toFixed(0)}₴</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                                            <div style={{
                                                                height: '100%',
                                                                width: `${Math.min(100, (currentRevenue / totalCosts) * 100)}%`,
                                                                background: currentRevenue >= totalCosts ? '#10b981' : '#f59e0b'
                                                            }}></div>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#94a3b8' }}>
                                                            Прогресс окупаемости: {((currentRevenue / totalCosts) * 100).toFixed(1)}%
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'edits' && (
                        <div style={{ animation: 'fadeIn 0.4s ease-out', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', padding: '1.5rem', borderRadius: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                                        <th style={{ padding: '1.25rem' }}>Дата / Время</th>
                                        <th style={{ padding: '1.25rem' }}>Объект</th>
                                        <th style={{ padding: '1.25rem' }}>Действие</th>
                                        <th style={{ padding: '1.25rem' }}>Описание / Изменения</th>
                                        <th style={{ padding: '1.25rem' }}>Исполнитель</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '1.25rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                {new Date(log.date).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{log.type}</div>
                                                {log.targetId || '-'}
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid',
                                                    color: log.action === 'DELETE' ? '#f87171' : log.action === 'CREATE' || log.action === 'ADD' ? '#4ade80' : '#fb923c',
                                                    background: log.action === 'DELETE' ? 'rgba(248, 113, 113, 0.1)' : log.action === 'CREATE' || log.action === 'ADD' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                                                    borderColor: log.action === 'DELETE' ? 'rgba(248, 113, 113, 0.2)' : log.action === 'CREATE' || log.action === 'ADD' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 146, 60, 0.2)'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                {renderChanges(log)}
                                            </td>
                                            <td style={{ padding: '1.25rem', color: '#94a3b8' }}>
                                                {log.operator || 'Система'}
                                            </td>
                                        </tr>
                                    ))}
                                    {systemLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                                Истории событий нет
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </main>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                select, input {
                    outline: none;
                }
                select:focus, input:focus {
                    border-color: #6366f1 !important;
                }
            `}</style>
        </div>
    );
}
