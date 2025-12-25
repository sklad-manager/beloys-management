import React, { useState, useEffect } from 'react';

interface SecretAdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SecretAdminDashboardModal({ isOpen, onClose }: SecretAdminDashboardModalProps) {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch some "secret" or advanced stats
            fetch('/api/admin/cashflow?year=' + new Date().getFullYear() + '&month=' + (new Date().getMonth() + 1))
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

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
        padding: '2rem',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <div style={overlayStyle}>
            <header style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                        Executive Dashboard
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Конфиденциально • Управление активами</p>
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
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                                <button style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Скачать отчет (PDF)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
