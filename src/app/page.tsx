'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrderFormModal from '@/components/OrderFormModal';
import CashModal from '@/components/CashModal';
import LoginPage from '@/components/LoginPage';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import AdminAuthModal from '@/components/AdminAuthModal';
import AdminDashboardModal from '@/components/AdminDashboardModal';
import StatusBadge from '@/components/StatusBadge';
import OrderIssueModal from '@/components/OrderIssueModal';

interface Order {
  id: number;
  orderNumber: string;
  clientName: string;
  phone: string;
  shoeType: string;
  brand: string;
  price: number;
  status: string;
  createdAt: string;
  prepaymentCash: number;
  prepaymentTerminal: number;
}

export default function Home() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    orderId: 0,
    orderNumber: '',
    totalPrice: 0,
    prepayment: 0
  });

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.status === 401) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchOrders = async (query = '') => {
    try {
      const url = query
        ? `/api/orders?search=${encodeURIComponent(query)}&view=active`
        : '/api/orders?view=active';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchOrders(searchQuery);
      }, 500); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, searchQuery]);

  const handleCreateOrder = async (data: any) => {
    // If we're editing, the data is already saved by the modal itself (I added PUT logic there)
    // but if it's a NEW order, we still need this POST logic.
    if (!editingOrderId) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          fetchOrders(searchQuery);
          setIsModalOpen(false);
          setEditingOrderId(null);
        } else {
          const errData = await res.json();
          alert('Ошибка при создании заказа: ' + (errData.error || 'Неизвестная ошибка'));
        }
      } catch (e) {
        console.error(e);
        alert('Ошибка сети при создании заказа');
      }
    } else {
      // Just refresh if it was edit mode (edit logic is inside modal now)
      fetchOrders(searchQuery);
      setIsModalOpen(false);
      setEditingOrderId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setOrders([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaymentComplete = async (amount: number, method: 'Cash' | 'Terminal') => {
    try {
      const res = await fetch(`/api/orders/${paymentModalData.orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentAmount: amount,
          paymentMethod: method
        }),
      });

      if (res.ok) {
        setIsPaymentModalOpen(false);
        fetchOrders(searchQuery);
      } else {
        alert('Ошибка при завершении заказа');
      }
    } catch (error) {
      console.error('Failed to complete order', error);
      alert('Ошибка сети');
    }
  };

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Загрузка...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Belous <span className="text-gradient">Management</span></h1>
          <p>Панель управления заказами</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="relative" style={{ marginRight: '0.5rem' }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem', width: '220px' }}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>

          <button
            onClick={() => {
              if (selectedOrderId) {
                setEditingOrderId(selectedOrderId);
                setIsReadOnly(false); // Changed to false to allow editing as requested in previous steps
                setIsModalOpen(true);
              }
            }}
            disabled={!selectedOrderId}
            className="btn"
            style={{
              background: selectedOrderId ? 'var(--accent-primary)' : 'white',
              opacity: selectedOrderId ? 1 : 0.8,
              cursor: selectedOrderId ? 'pointer' : 'not-allowed',
              border: '1px solid var(--border-subtle)',
              color: selectedOrderId ? 'white' : 'var(--text-primary)',
              transition: 'all 0.2s ease',
              boxShadow: selectedOrderId ? 'var(--accent-glow)' : 'var(--shadow-sm)'
            }}
          >
            👁️ Просмотр
          </button>

          <button
            onClick={() => setIsCashModalOpen(true)}
            className="btn btn-glass"
          >
            💰 Касса
          </button>
          <button
            onClick={() => setIsAdminAuthOpen(true)}
            className="btn btn-glass"
          >
            🔒 Админ
          </button>
          <button
            onClick={() => {
              setEditingOrderId(null);
              setIsReadOnly(false);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Принять Заказ
          </button>
          <ThreeDotsMenu onLogout={handleLogout} />
        </div>
      </div>

      {
        loading ? (
          <div style={{ textAlign: 'center', color: 'gray' }}>Загрузка...</div>
        ) : (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead style={{ background: 'var(--bg-primary)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Клиент</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Изделие</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Цена</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>
                        Заказов пока нет
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        style={{
                          borderTop: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          background: selectedOrderId === order.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                          borderLeft: selectedOrderId === order.id ? '4px solid var(--accent-primary)' : '4px solid transparent'
                        }}
                        className="hover:bg-black/5 transition-colors"
                        onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                      >
                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderNumber}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{order.clientName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'gray' }}>{order.phone}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {order.shoeType} <span style={{ color: 'gray' }}>{order.brand}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>{order.price} грн</td>
                        <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                          <StatusBadge
                            status={order.status}
                            orderId={order.id}
                            onUpdate={() => fetchOrders(searchQuery)}
                            totalPrice={order.price}
                            prepayment={(order.prepaymentCash || 0) + (order.prepaymentTerminal || 0)}
                            orderNumber={order.orderNumber}
                            onRequestPayment={(id, num, remaining, prepay) => {
                              setPaymentModalData({
                                orderId: id,
                                orderNumber: num,
                                totalPrice: remaining + prepay,
                                prepayment: prepay
                              });
                              setIsPaymentModalOpen(true);
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrderId(null);
          setIsReadOnly(false);
        }}
        onSubmit={handleCreateOrder}
        orderId={editingOrderId}
        isReadOnly={isReadOnly}
      />

      <CashModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      <OrderIssueModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentComplete}
        totalPrice={paymentModalData.totalPrice}
        prepayment={paymentModalData.prepayment}
        orderNumber={paymentModalData.orderNumber}
      />
    </main >
  );
}
