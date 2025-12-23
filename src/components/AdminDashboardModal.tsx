import React, { useState, useEffect } from 'react';

interface AdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Master {
    id: number;
    name: string;
    percentage: number;
}

interface EditLog {
    id: number;
    orderNumber: string;
    oldData: any;
    newData: any;
    date: string;
}

export default function AdminDashboardModal({ isOpen, onClose }: AdminDashboardModalProps) {
    const [activeTab, setActiveTab] = useState('masters');
    const [masters, setMasters] = useState<Master[]>([]);
    const [archivedOrders, setArchivedOrders] = useState<any[]>([]);
    const [newMasterName, setNewMasterName] = useState('');
    const [newMasterPercentage, setNewMasterPercentage] = useState('');
    const [loading, setLoading] = useState(false);

    const [salaryLogs, setSalaryLogs] = useState<any[]>([]);
    const [editLogs, setEditLogs] = useState<EditLog[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
        }
    }, [isOpen]);

    const fetchMasters = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/masters');
            if (res.ok) {
                const data = await res.json();
                setMasters(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryLogs = async () => {
        try {
            const res = await fetch('/api/salary-logs');
            if (res.ok) {
                const data = await res.json();
                setSalaryLogs(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchEditLogs = async () => {
        try {
            const res = await fetch('/api/admin/edit-logs');
            if (res.ok) {
                const data = await res.json();
                setEditLogs(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchArchivedOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders?view=archive');
            if (res.ok) {
                const data = await res.json();
                setArchivedOrders(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaster = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/masters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newMasterName,
                    percentage: newMasterPercentage
                })
            });
            if (res.ok) {
                setNewMasterName('');
                setNewMasterPercentage('');
                fetchMasters();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteMaster = async (id: number) => {
        if (!confirm('Удалить мастера?')) return;
        try {
            const res = await fetch(`/api/masters?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchMasters();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to compare and show changes
    const renderChanges = (oldD: any, newD: any) => {
        const changes: string[] = [];
        if (oldD.price !== newD.price) changes.push(`Цена: ${oldD.price} -> ${newD.price}`);
        if (oldD.shoeType !== newD.shoeType) changes.push(`Изделие: ${oldD.shoeType} -> ${newD.shoeType}`);
        if (oldD.brand !== newD.brand) changes.push(`Бренд: ${oldD.brand} -> ${newD.brand}`);
        if (oldD.color !== newD.color) changes.push(`Цвет: ${oldD.color} -> ${newD.color}`);
        if (oldD.quantity !== newD.quantity) changes.push(`Кол-во: ${oldD.quantity} -> ${newD.quantity}`);
        if (oldD.services !== newD.services) changes.push(`Услуги изменены`);
        if (oldD.comment !== newD.comment) changes.push(`Коммент изменен`);

        // Master comparison
        const oldM = Number(oldD.masterId);
        const newM = Number(newD.masterId);
        if (oldM !== newM && !isNaN(newM)) changes.push(`Мастер изменен`);

        if (changes.length === 0) return <span style={{ color: 'gray' }}>Технические изменения</span>;

        return (
            <div style={{ fontSize: '0.85rem' }}>
                {changes.map((c, i) => <div key={i} style={{ marginBottom: '2px' }}>• {c}</div>)}
            </div>
        );
    };

    if (!isOpen) return null;

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(8px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '24px',
        width: '95%',
        maxWidth: '1000px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border-highlight)',
        boxShadow: 'var(--shadow-lg)'
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.75rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: 'var(--text-primary)',
        marginRight: '0.5rem',
        outline: 'none',
        boxShadow: 'var(--shadow-sm)'
    };

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '0.75rem 1.25rem',
        background: isActive ? 'var(--bg-primary)' : 'none',
        border: 'none',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderRadius: '10px 10px 0 0',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s'
    });

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Панель Администратора</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <button style={tabStyle(activeTab === 'masters')} onClick={() => setActiveTab('masters')}>
                        Мастера
                    </button>
                    <button style={tabStyle(activeTab === 'salaries')} onClick={() => { setActiveTab('salaries'); fetchSalaryLogs(); }}>
                        Зарплата
                    </button>
                    <button style={tabStyle(activeTab === 'edits')} onClick={() => { setActiveTab('edits'); fetchEditLogs(); }}>
                        Редактируемые
                    </button>
                    <button style={tabStyle(activeTab === 'archive')} onClick={() => { setActiveTab('archive'); fetchArchivedOrders(); }}>
                        Архив
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'masters' && (
                        <div>
                            <form onSubmit={handleAddMaster} style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <input
                                    placeholder="Имя мастера"
                                    value={newMasterName}
                                    onChange={e => setNewMasterName(e.target.value)}
                                    style={{ ...inputStyle, flex: 2 }}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="% Зарплаты"
                                    value={newMasterPercentage}
                                    onChange={e => setNewMasterPercentage(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                    required
                                />
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>+ Добавить</button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {loading ? <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p> : masters.map(master => (
                                    <div key={master.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        background: 'white',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-subtle)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{master.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{master.percentage}%</div>
                                            <button
                                                onClick={() => handleDeleteMaster(master.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {masters.length === 0 && !loading && (
                                    <p style={{ color: '#8d99ae', textAlign: 'center' }}>Мастеров пока нет</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'salaries' && (
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-primary)' }}>
                                        <th style={{ padding: '1rem' }}>Дата</th>
                                        <th style={{ padding: '1rem' }}>Мастер</th>
                                        <th style={{ padding: '1rem' }}>Заказ</th>
                                        <th style={{ padding: '1rem' }}>Сумма</th>
                                        <th style={{ padding: '1rem' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(log.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{log.master?.name || '-'}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{log.orderNumber}</td>
                                            <td style={{ padding: '1rem', color: '#16a34a', fontWeight: '600' }}>
                                                {log.amount.toFixed(2)} грн
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {log.isPaid ?
                                                    <span style={{ color: '#4ade80', fontSize: '0.8rem', border: '1px solid #4ade80', padding: '2px 8px', borderRadius: '10px' }}>Оплачено</span> :
                                                    <span style={{ color: '#fb923c', fontSize: '0.8rem', border: '1px solid #fb923c', padding: '2px 8px', borderRadius: '10px' }}>Не оплачено</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                    {salaryLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>
                                                Нет начислений
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'edits' && (
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-primary)' }}>
                                        <th style={{ padding: '1rem' }}>Дата / Время</th>
                                        <th style={{ padding: '1rem' }}>Заказ</th>
                                        <th style={{ padding: '1rem' }}>Изменения</th>
                                        <th style={{ padding: '1rem' }}>Тип</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(log.date).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{log.orderNumber}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {renderChanges(log.oldData, log.newData)}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#fb923c' }}>
                                                Редактирование
                                            </td>
                                        </tr>
                                    ))}
                                    {editLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>
                                                Истории изменений нет
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'archive' && (
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-primary)' }}>
                                        <th style={{ padding: '1rem' }}>Дата</th>
                                        <th style={{ padding: '1rem' }}>№</th>
                                        <th style={{ padding: '1rem' }}>Клиент</th>
                                        <th style={{ padding: '1rem' }}>Изделие</th>
                                        <th style={{ padding: '1rem' }}>Сумма</th>
                                        <th style={{ padding: '1rem' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</td></tr>
                                    ) : archivedOrders.map((order) => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderNumber}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>{order.clientName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'gray' }}>{order.phone}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.shoeType}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#4ade80' }}>
                                                {order.price} грн
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    color: '#9ca3af',
                                                    border: '1px solid #4b5563',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {archivedOrders.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>
                                                Архив пуст
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
