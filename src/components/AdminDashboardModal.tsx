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

    // Salary Filtering
    const [salaryStart, setSalaryStart] = useState('');
    const [salaryEnd, setSalaryEnd] = useState('');

    // Administration State
    const [staff, setStaff] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffRate, setNewStaffRate] = useState('');

    // Shift Form State
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
    const [shiftStart, setShiftStart] = useState('09:00');
    const [shiftEnd, setShiftEnd] = useState('18:00');
    const [shiftAmount, setShiftAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) setStaff(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchShifts = async () => {
        try {
            const res = await fetch('/api/admin/staff-shifts');
            if (res.ok) setShifts(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStaffName, defaultRate: newStaffRate })
            });
            if (res.ok) {
                setNewStaffName('');
                setNewStaffRate('');
                fetchStaff();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteStaff = async (id: number) => {
        if (!confirm('Удалить сотрудника?')) return;
        try {
            await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
            fetchStaff();
        } catch (e) { console.error(e); }
    };

    const handleAddShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaffId) return;

        // Calculate hours roughly
        const h1 = parseInt(shiftStart.split(':')[0]);
        const m1 = parseInt(shiftStart.split(':')[1]);
        const h2 = parseInt(shiftEnd.split(':')[0]);
        const m2 = parseInt(shiftEnd.split(':')[1]);
        const totalHours = (h2 + m2 / 60) - (h1 + m1 / 60);

        try {
            const res = await fetch('/api/admin/staff-shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staffId: selectedStaffId,
                    date: shiftDate,
                    startTime: shiftStart,
                    endTime: shiftEnd,
                    hours: totalHours,
                    amount: shiftAmount || 0
                })
            });
            if (res.ok) {
                setShiftAmount('');
                fetchShifts();
            }
        } catch (e) { console.error(e); }
    };

    const handlePayStaff = async (staffId: number, name: string, amount: number, ids: number[]) => {
        if (!confirm(`Выплатить ${amount} грн сотруднику ${name}?`)) return;
        try {
            const res = await fetch('/api/admin/staff-shifts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftIds: ids, totalAmount: amount, staffName: name })
            });
            if (res.ok) {
                alert('Выплата произведена');
                fetchShifts();
            }
        } catch (e) { console.error(e); }
    };

    const handlePaySalary = async (masterId: number, masterName: string, amount: number, logIds: number[]) => {
        if (amount <= 0) return;
        if (!confirm(`Выплатить ${amount.toFixed(2)} грн мастеру ${masterName}?`)) return;

        try {
            const res = await fetch('/api/salary-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logIds, masterId, amount, masterName })
            });

            if (res.ok) {
                alert('Выплата оформлена');
                fetchSalaryLogs();
            } else {
                alert('Ошибка при оформлении выплаты');
            }
        } catch (e) {
            console.error(e);
            alert('Сетевая ошибка');
        }
    };

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
                    <button style={tabStyle(activeTab === 'administration')} onClick={() => { setActiveTab('administration'); fetchStaff(); fetchShifts(); }}>
                        Администрация
                    </button>
                    <button style={tabStyle(activeTab === 'edits')} onClick={() => { setActiveTab('edits'); fetchEditLogs(); }}>
                        Редактируемые
                    </button>
                    <button style={tabStyle(activeTab === 'archive')} onClick={() => { setActiveTab('archive'); fetchArchivedOrders(); }}>
                        Архив
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'administration' && (
                        <div>
                            {/* Management Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
                                {/* Staff List */}
                                <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>👥 Сотрудники</h3>
                                    <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <input className="input" placeholder="Имя" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required />
                                        <input className="input" type="number" placeholder="Ставка (грн)" value={newStaffRate} onChange={e => setNewStaffRate(e.target.value)} required />
                                        <button className="btn btn-primary" type="submit">+ Добавить</button>
                                    </form>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {staff.map(s => (
                                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                                                <span>{s.name} ({s.defaultRate}₴)</span>
                                                <button onClick={() => handleDeleteStaff(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shift Logging */}
                                <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⏳ График и Зарплата</h3>
                                    <form onSubmit={handleAddShift} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <select className="input" value={selectedStaffId} onChange={e => {
                                            setSelectedStaffId(e.target.value);
                                            const s = staff.find(x => x.id === parseInt(e.target.value));
                                            if (s) setShiftAmount(s.defaultRate.toString());
                                        }} required>
                                            <option value="">Выберите сотрудника</option>
                                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <input className="input" type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input className="input" type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
                                            <input className="input" type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
                                        </div>
                                        <input className="input" type="number" placeholder="Сумма к начислению" value={shiftAmount} onChange={e => setShiftAmount(e.target.value)} required />
                                        <button className="btn btn-primary" type="submit" style={{ gridColumn: 'span 2' }}>✓ Записать выход</button>
                                    </form>

                                    {/* Unpaid Summary */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {staff.map(s => {
                                            const unpaid = shifts.filter(x => x.staffId === s.id && !x.isPaid);
                                            const total = unpaid.reduce((acc, x) => acc + x.amount, 0);
                                            if (total === 0) return null;
                                            return (
                                                <div key={s.id} style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#166534' }}>{s.name}</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', margin: '4px 0' }}>{total} грн</div>
                                                    <button onClick={() => handlePayStaff(s.id, s.name, total, unpaid.map(u => u.id))} className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}>Выплатить</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Shift History */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                <label>Период истории:</label>
                                <input type="date" value={salaryStart} onChange={e => setSalaryStart(e.target.value)} style={inputStyle} />
                                <input type="date" value={salaryEnd} onChange={e => setSalaryEnd(e.target.value)} style={inputStyle} />
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                <thead style={{ background: 'var(--bg-primary)' }}>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '1rem' }}>Дата</th>
                                        <th style={{ padding: '1rem' }}>Сотрудник</th>
                                        <th style={{ padding: '1rem' }}>Время</th>
                                        <th style={{ padding: '1rem' }}>Сумма</th>
                                        <th style={{ padding: '1rem' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shifts
                                        .filter(x => {
                                            const d = new Date(x.date);
                                            const s = salaryStart ? d >= new Date(salaryStart) : true;
                                            const e = salaryEnd ? d <= new Date(salaryEnd + 'T23:59:59') : true;
                                            return s && e;
                                        })
                                        .map(sh => (
                                            <tr key={sh.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '1rem' }}>{new Date(sh.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem' }}>{sh.staff?.name}</td>
                                                <td style={{ padding: '1rem' }}>{sh.startTime} - {sh.endTime} ({sh.hours?.toFixed(1)}ч)</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{sh.amount} грн</td>
                                                <td style={{ padding: '1rem' }}>
                                                    {sh.isPaid ?
                                                        <span style={{ color: '#22c55e', fontSize: '0.8rem', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px' }}>Оплачено</span> :
                                                        <span style={{ color: '#f59e0b', fontSize: '0.8rem', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px' }}>Ожидает</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}

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
                            {/* Date Filter */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>С:</label>
                                    <input type="date" value={salaryStart} onChange={e => setSalaryStart(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>По:</label>
                                    <input type="date" value={salaryEnd} onChange={e => setSalaryEnd(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                                </div>
                            </div>

                            {/* Summary by Master (Only Unpaid) */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>💰 К выплате (неоплаченные)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {masters.map(m => {
                                        const unpaidLogs = salaryLogs.filter(log => {
                                            const isMaster = log.masterId === m.id;
                                            const isUnpaid = !log.isPaid;
                                            const logDate = new Date(log.date);
                                            const isAfterStart = salaryStart ? logDate >= new Date(salaryStart) : true;
                                            const isBeforeEnd = salaryEnd ? logDate <= new Date(salaryEnd + 'T23:59:59') : true;
                                            return isMaster && isUnpaid && isAfterStart && isBeforeEnd;
                                        });

                                        const total = unpaidLogs.reduce((acc, log) => acc + log.amount, 0);
                                        const ids = unpaidLogs.map(l => l.id);

                                        if (total <= 0) return null;

                                        return (
                                            <div key={m.id} style={{
                                                background: 'white', border: '1px solid var(--border-subtle)',
                                                padding: '1rem', borderRadius: '16px', display: 'flex',
                                                justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{m.name}</div>
                                                    <div style={{ color: '#16a34a', fontWeight: 'bold' }}>{total.toFixed(2)} грн</div>
                                                </div>
                                                <button
                                                    onClick={() => handlePaySalary(m.id, m.name, total, ids)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    Выплатить
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📜 История начислений</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Дата</th>
                                        <th style={{ padding: '1rem' }}>Мастер</th>
                                        <th style={{ padding: '1rem' }}>Заказ</th>
                                        <th style={{ padding: '1rem' }}>Сумма</th>
                                        <th style={{ padding: '1rem' }}>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryLogs
                                        .filter(log => {
                                            const logDate = new Date(log.date);
                                            const isAfterStart = salaryStart ? logDate >= new Date(salaryStart) : true;
                                            const isBeforeEnd = salaryEnd ? logDate <= new Date(salaryEnd + 'T23:59:59') : true;
                                            return isAfterStart && isBeforeEnd;
                                        })
                                        .map((log) => (
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
                                                        <span style={{ color: '#22c55e', fontSize: '0.75rem', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px', border: '1px solid #dcfce7' }}>Оплачено</span> :
                                                        <span style={{ color: '#f59e0b', fontSize: '0.75rem', background: '#fffbeb', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fef3c7' }}>В ожидании</span>
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
