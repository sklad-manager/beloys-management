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
        if (oldD.comment !== newD.comment) changes.push(`Коммент изменен`);
        if (oldD.masterId !== newD.masterId) changes.push(`Мастер изменен`);

        if (changes.length === 0) return <span style={{ color: 'gray' }}>Незначительные изменения</span>;

        return (
            <div style={{ fontSize: '0.85rem' }}>
                {changes.map((c, i) => <div key={i}>{c}</div>)}
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(5px)'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: '#16213e',
        padding: '2rem',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '900px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.1)'
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        marginRight: '0.5rem',
        outline: 'none'
    };

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '0.5rem 1rem',
        background: 'none',
        border: 'none',
        color: isActive ? '#4cc9f0' : '#8d99ae',
        borderBottom: isActive ? '2px solid #4cc9f0' : 'none',
        cursor: 'pointer',
        fontSize: '1.1rem'
    });

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#fff' }}>Панель Администратора</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button style={tabStyle(activeTab === 'masters')} onClick={() => setActiveTab('masters')}>
                        Мастера
                    </button>
                    <button style={tabStyle(activeTab === 'salaries')} onClick={() => { setActiveTab('salaries'); fetchSalaryLogs(); }}>
                        Зарплата
                    </button>
                    <button style={tabStyle(activeTab === 'edits')} onClick={() => { setActiveTab('edits'); fetchEditLogs(); }}>
                        Редактируемые
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'masters' && (
                        <div>
                            <form onSubmit={handleAddMaster} style={{ display: 'flex', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
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
                                {loading ? <p style={{ color: '#8d99ae' }}>Загрузка...</p> : masters.map(master => (
                                    <div key={master.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ fontWeight: 'bold' }}>{master.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{ color: '#4cc9f0' }}>{master.percentage}%</div>
                                            <button
                                                onClick={() => handleDeleteMaster(master.id)}
                                                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.2rem' }}
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
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e5e5' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Дата</th>
                                        <th style={{ padding: '1rem' }}>Мастер</th>
                                        <th style={{ padding: '1rem' }}>Заказ</th>
                                        <th style={{ padding: '1rem' }}>Сумма</th>
                                        <th style={{ padding: '1rem' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(log.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{log.master?.name || '-'}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{log.orderNumber}</td>
                                            <td style={{ padding: '1rem', color: '#4ade80' }}>
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
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e5e5' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Дата / Время</th>
                                        <th style={{ padding: '1rem' }}>Заказ</th>
                                        <th style={{ padding: '1rem' }}>Изменения</th>
                                        <th style={{ padding: '1rem' }}>Тип</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                </div>
            </div>
        </div>
    );
}
