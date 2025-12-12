'use client';

import { useState, useEffect } from 'react';
import OrderFormModal from '@/components/OrderFormModal';
import CashModal from '@/components/CashModal';

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
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
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
    fetchOrders();
  }, []);

  const handleCreateOrder = async (data: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchOrders(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="btn btn-glass"
          >
            💰 Касса
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            + Принять Заказ
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'gray' }}>Загрузка...</div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
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
                    <tr key={order.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderNumber}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{order.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'gray' }}>{order.phone}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {order.shoeType} <span style={{ color: 'gray' }}>{order.brand}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{order.price} грн</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem'
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <CashModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
      />
    </main>
  );
}
