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

    // Calendar State
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
            fetchMonthConfig();
            fetchStaff();
            fetchShifts();
        }
    }, [isOpen, currentMonth]);

    // Deletion fix: staff wasn't refreshing correctly or had relational issues
    const handleDeleteStaff = async (id: number) => {
        if (!confirm('Удалить сотрудника? (Все его смены также будут удалены)')) return;
        try {
            // Check if there are shifts first
            const sRes = await fetch(`/api/admin/staff-shifts?staffId=${id}`);
            const sData = await sRes.json();
            if (sData.length > 0) {
                if (!confirm(`У этого сотрудника ${sData.length} записей смен. Удалить всё?`)) return;
                // Delete shifts first or handle in DB cascade (but let's do safe manual or assume cascade if DB set up)
                for (const sh of sData) {
                    await fetch(`/api/admin/staff-shifts?id=${sh.id}`, { method: 'DELETE' });
                }
            }

            const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Сотрудник удален');
                fetchStaff();
                fetchShifts();
            } else {
                alert('Не удалось удалить сотрудника');
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка при удалении');
        }
    };

    const toggleShift = async (day: number) => {
        if (!selectedStaffId) {
            alert('Сначала выберите сотрудника в списке слева!');
            return;
        }

        const targetDate = new Date(currentYear, currentMonth - 1, day);
        const dateStr = targetDate.toISOString().split('T')[0];

        // Check if shift exists for THIS staff on THIS day
        const existing = shifts.find(s =>
            s.staffId === parseInt(selectedStaffId) &&
            new Date(s.date).toISOString().split('T')[0] === dateStr
        );

        if (existing) {
            if (existing.isPaid) {
                alert('Эта смена уже оплачена. Удаление невозможно.');
                return;
            }
            if (!confirm('Удалить запись об этом выходе?')) return;
            await fetch(`/api/admin/staff-shifts?id=${existing.id}`, { method: 'DELETE' });
        } else {
            const s = staff.find(x => x.id === parseInt(selectedStaffId));
            const perDay = s ? s.defaultRate / workingDays : 0;

            await fetch('/api/admin/staff-shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staffId: selectedStaffId,
                    date: dateStr,
                    startTime: '09:00',
                    endTime: '18:00',
                    hours: 9,
                    amount: perDay || 0
                })
            });
        }
        fetchShifts();
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

    const renderCalendar = () => {
        const days = getDaysInMonth(currentYear, currentMonth);
        const elements = [];

        for (let d = 1; d <= days; d++) {
            const dateStr = new Date(currentYear, currentMonth - 1, d).toISOString().split('T')[0];

            // Get all shifts for this day
            const dayShifts = shifts.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);

            elements.push(
                <div
                    key={d}
                    onClick={() => toggleShift(d)}
                    style={{
                        aspectRatio: '1',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        position: 'relative',
                        cursor: 'pointer',
                        background: 'white',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'gray' }}>{d}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                        {dayShifts.map(sh => (
                            <div
                                key={sh.id}
                                style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    background: sh.isPaid ? '#22c55e' : '#f97316',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                title={`${sh.staff?.name}: ${sh.amount}₴`}
                            >
                                {sh.staff?.name}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return elements;
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
                                {/* Left: Settings & Staff */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>📅 Рабочие дни</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))} className="input" style={{ flex: 1 }}>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('ru', { month: 'long' })}</option>
                                                ))}
                                            </select>
                                            <input type="number" value={workingDays} onChange={e => setWorkingDays(parseInt(e.target.value))} className="input" style={{ width: '80px' }} />
                                            <button onClick={saveMonthConfig} className="btn btn-primary">✓</button>
                                        </div>
                                    </div>

                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>👥 Управление штатом</h3>
                                        <form onSubmit={handleAddStaff} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <input placeholder="Имя сотрудника" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="input" required />
                                            <input type="number" placeholder="Ставка в месяц" value={newStaffRate} onChange={e => setNewStaffRate(e.target.value)} className="input" required />
                                            <button type="submit" className="btn btn-primary">+ Добавить</button>
                                        </form>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {staff.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => setSelectedStaffId(s.id.toString())}
                                                    style={{
                                                        display: 'flex', justifyContent: 'space-between', padding: '12px',
                                                        background: selectedStaffId === s.id.toString() ? 'var(--accent-primary)' : 'white',
                                                        color: selectedStaffId === s.id.toString() ? 'white' : 'inherit',
                                                        borderRadius: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer',
                                                        alignItems: 'center', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{s.name}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{s.defaultRate} грн/мес</div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStaff(s.id); }} style={{ background: 'none', border: 'none', color: selectedStaffId === s.id.toString() ? 'white' : '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Calendar & Payouts */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Payout Summary */}
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>💰 К выплате (неоплаченные)</h3>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'gray' }}>С даты:</label>
                                                <input type="date" value={salaryStart} onChange={e => setSalaryStart(e.target.value)} className="input" style={{ width: '100%' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'gray' }}>По дату:</label>
                                                <input type="date" value={salaryEnd} onChange={e => setSalaryEnd(e.target.value)} className="input" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {staff.map(s => {
                                                const unpaid = shifts.filter(sh => {
                                                    const dStr = new Date(sh.date).toISOString().split('T')[0];
                                                    const isInRange = (!salaryStart || dStr >= salaryStart) && (!salaryEnd || dStr <= salaryEnd);
                                                    return sh.staffId === s.id && !sh.isPaid && isInRange;
                                                });
                                                const total = unpaid.reduce((acc, sh) => acc + sh.amount, 0);
                                                if (total === 0) return null;
                                                return (
                                                    <div key={s.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '700' }}>{s.name}</div>
                                                            <div style={{ color: '#166534' }}>{total.toFixed(0)}₴ ({unpaid.length} дн.)</div>
                                                        </div>
                                                        <button onClick={() => handlePayStaff(s.id, s.name, total, unpaid.map(u => u.id))} className="btn btn-primary">Выплатить</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Attendance Calendar */}
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>🗓️ Календарь посещаемости {selectedStaffId && `- ${staff.find(x => x.id.toString() === selectedStaffId)?.name}`}</h3>
                                        {!selectedStaffId && <p style={{ color: '#ef4444', fontWeight: '500' }}>⚠️ Выберите сотрудника в списке слева, чтобы отметить выход</p>}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                                            {renderCalendar()}
                                        </div>
                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '14px', height: '14px', background: '#f97316', borderRadius: '4px' }}></div> Записан
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '14px', height: '14px', background: '#22c55e', borderRadius: '4px' }}></div> Выплачен
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>* Кликните на день, чтобы добавить/удалить смену выбранного сотрудника</div>
                                        </div>
                                    </div>
                                </div>
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
                                            const logDateStr = new Date(log.date).toISOString().split('T')[0];
                                            const isAfterStart = salaryStart ? logDateStr >= salaryStart : true;
                                            const isBeforeEnd = salaryEnd ? logDateStr <= salaryEnd : true;
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
                                            const logDateStr = new Date(log.date).toISOString().split('T')[0];
                                            const isAfterStart = salaryStart ? logDateStr >= salaryStart : true;
                                            const isBeforeEnd = salaryEnd ? logDateStr <= salaryEnd : true;
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
