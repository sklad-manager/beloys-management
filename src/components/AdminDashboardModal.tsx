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

    // Month Config
    const [workingDays, setWorkingDays] = useState(22);
    const [currentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
            fetchMonthConfig();
        }
    }, [isOpen, currentMonth]);

    const fetchMonthConfig = async () => {
        try {
            const res = await fetch(`/api/admin/month-config?year=${currentYear}&month=${currentMonth}`);
            if (res.ok) {
                const data = await res.json();
                setWorkingDays(data.workingDays);
            }
        } catch (e) { console.error(e); }
    };

    const saveMonthConfig = async () => {
        try {
            await fetch('/api/admin/month-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: currentYear, month: currentMonth, workingDays })
            });
            alert('Сохранено');
        } catch (e) { console.error(e); }
    };

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
                fetchShifts();
            }
        } catch (e) { console.error(e); }
    };

    const handlePayStaff = async (staffId: number, name: string, amount: number, ids: number[]) => {
        if (!confirm(`Выплатить ${amount.toFixed(2)} грн сотруднику ${name}?`)) return;
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
        backgroundColor: 'var(--bg-secondary)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out'
    };

    const headerStyle: React.CSSProperties = {
        padding: '1.5rem 2rem',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const mainStyle: React.CSSProperties = {
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.75rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: 'var(--text-primary)',
        outline: 'none',
        boxShadow: 'var(--shadow-sm)'
    };

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '0.75rem 1.5rem',
        background: isActive ? 'var(--accent-primary)' : 'transparent',
        border: 'none',
        color: isActive ? 'white' : 'var(--text-secondary)',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    });

    return (
        <div style={overlayStyle}>
            <header style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Панель Администратора</h1>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Управление персоналом, зарплатами и архивом</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '16px' }}>
                    <button style={tabStyle(activeTab === 'masters')} onClick={() => setActiveTab('masters')}>Мастера</button>
                    <button style={tabStyle(activeTab === 'salaries')} onClick={() => { setActiveTab('salaries'); fetchSalaryLogs(); }}>Зарплаты</button>
                    <button style={tabStyle(activeTab === 'administration')} onClick={() => { setActiveTab('administration'); fetchStaff(); fetchShifts(); }}>Администрация</button>
                    <button style={tabStyle(activeTab === 'edits')} onClick={() => { setActiveTab('edits'); fetchEditLogs(); }}>Логи</button>
                    <button style={tabStyle(activeTab === 'archive')} onClick={() => { setActiveTab('archive'); fetchArchivedOrders(); }}>Архив</button>
                </div>
                <button onClick={onClose} className="btn-glass" style={{ width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem' }}>×</button>
            </header>

            <main style={mainStyle}>
                <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    {activeTab === 'administration' && (
                        <div>
                            {/* Monthly Config & Payouts */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>

                                {/* 1. Settings & Staff List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Month Working Days */}
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>📅 Рабочие дни в месяце</h3>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <select value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))} className="input" style={{ flex: 1 }}>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('ru', { month: 'long' })}</option>
                                                ))}
                                            </select>
                                            <input type="number" value={workingDays} onChange={e => setWorkingDays(parseInt(e.target.value))} className="input" style={{ width: '80px' }} />
                                            <button onClick={saveMonthConfig} className="btn btn-primary">✓</button>
                                        </div>
                                    </div>

                                    {/* Staff Management */}
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>👥 Управление персоналом</h3>
                                        <form onSubmit={handleAddStaff} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <input placeholder="Имя сотрудника" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="input" required />
                                            <input type="number" placeholder="Ставка в месяц (грн)" value={newStaffRate} onChange={e => setNewStaffRate(e.target.value)} className="input" required />
                                            <button type="submit" className="btn btn-primary">+ Добавить в штат</button>
                                        </form>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {staff.map(s => (
                                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{s.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.defaultRate} грн/мес</div>
                                                    </div>
                                                    <button onClick={() => handleDeleteStaff(s.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Shift Tracker & Payroll */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>💰 Расчет и Выплата (за период)</h3>

                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'gray' }}>С этой даты:</label>
                                                <input type="date" value={salaryStart} onChange={e => setSalaryStart(e.target.value)} className="input" style={{ width: '100%' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'gray' }}>По эту дату:</label>
                                                <input type="date" value={salaryEnd} onChange={e => setSalaryEnd(e.target.value)} className="input" style={{ width: '100%' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {staff.map(s => {
                                                const unpaidShifts = shifts.filter(sh => {
                                                    const d = new Date(sh.date);
                                                    const isStaff = sh.staffId === s.id;
                                                    const isAfter = salaryStart ? d >= new Date(salaryStart) : true;
                                                    const isBefore = salaryEnd ? d <= new Date(salaryEnd + 'T23:59:59') : true;
                                                    return isStaff && !sh.isPaid && isAfter && isBefore;
                                                });

                                                const workedDaysCount = unpaidShifts.length;
                                                const totalToPay = unpaidShifts.reduce((acc, sh) => acc + sh.amount, 0);

                                                if (workedDaysCount === 0) return null;

                                                return (
                                                    <div key={s.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{s.name}</div>
                                                            <div style={{ color: '#166534', fontSize: '0.9rem' }}>
                                                                Отработано: <b>{workedDaysCount} дн.</b><br />
                                                                К выплате: <b style={{ fontSize: '1.2rem' }}>{totalToPay.toFixed(0)}₴</b>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handlePayStaff(s.id, s.name, totalToPay, unpaidShifts.map(u => u.id))} className="btn btn-primary">Выплатить</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Quick Shift Entry */}
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>✍️ Быстрая запись выхода</h3>
                                        <form onSubmit={handleAddShift} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                            <select className="input" value={selectedStaffId} onChange={e => {
                                                setSelectedStaffId(e.target.value);
                                                const s = staff.find(x => x.id === parseInt(e.target.value));
                                                if (s) {
                                                    const perDay = s.defaultRate / workingDays;
                                                    setShiftAmount(perDay.toFixed(2));
                                                }
                                            }} required>
                                                <option value="">Кто вышел?</option>
                                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <input type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} className="input" required />
                                            <input type="number" placeholder="Сумма за выход" value={shiftAmount} onChange={e => setShiftAmount(e.target.value)} className="input" required />
                                            <button type="submit" className="btn btn-primary">Записать</button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Shift Log */}
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📜 Журнал выходов</h3>
                            <div className="glass-card" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '1rem' }}>Дата</th>
                                            <th style={{ padding: '1rem' }}>Сотрудник</th>
                                            <th style={{ padding: '1rem' }}>Начислено</th>
                                            <th style={{ padding: '1rem' }}>Статус</th>
                                            <th style={{ padding: '1rem' }}>Действие</th>
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
                                                <tr key={sh.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1rem' }}>{new Date(sh.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{sh.staff?.name}</td>
                                                    <td style={{ padding: '1rem' }}>{sh.amount.toFixed(0)} грн</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {sh.isPaid ?
                                                            <span style={{ color: '#22c55e', background: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid #dcfce7' }}>Выплачено</span> :
                                                            <span style={{ color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid #fef3c7' }}>В ожидании</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {!sh.isPaid && (
                                                            <button onClick={async () => {
                                                                if (confirm('Удалить запись?')) {
                                                                    await fetch(`/api/admin/staff-shifts?id=${sh.id}`, { method: 'DELETE' });
                                                                    fetchShifts();
                                                                }
                                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>🗑️</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'masters' && (
                        <div>
                            <form onSubmit={handleAddMaster} style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <input
                                    placeholder="Имя мастера"
                                    value={newMasterName}
                                    onChange={e => setNewMasterName(e.target.value)}
                                    style={{ ...inputStyle, flex: 2, marginRight: '0.5rem' }}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="% Зарплаты"
                                    value={newMasterPercentage}
                                    onChange={e => setNewMasterPercentage(e.target.value)}
                                    style={{ ...inputStyle, flex: 1, marginRight: '0.5rem' }}
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
            </main>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
