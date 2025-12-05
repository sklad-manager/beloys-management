'use client';

import { useState, useEffect } from 'react';
import CashPage from './components/CashPage';
import InstallInstructions from './components/InstallInstructions';
import OrderFormModal from './components/OrderFormModal';

type MenuPage = 'menu' | 'expenses' | 'cash' | 'salary' | 'settings';

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  clientName: string;
  phone: string;
  shoeType: string;
  brand: string;
  color: string;
  quantity: number;
  services: string;
  comment: string;
  status: string;
  price: number;
  master?: { name: string };
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<MenuPage>('menu');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка заказов
  useEffect(() => {
    if (currentPage === 'menu') {
      loadOrders();
    }
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('API returned non-array:', data);
        setOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setOrders([]);
      setLoading(false);
    }
  };

  if (currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-slate-700">Belous</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          {/* Кнопки в ряд */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
            >
              📋 Принять заказ
            </button>

            <button
              onClick={() => setCurrentPage('expenses')}
              className="bg-white text-slate-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200 font-medium"
            >
              💰 Расходы
            </button>

            <button
              onClick={() => setCurrentPage('cash')}
              className="bg-white text-slate-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200 font-medium"
            >
              💵 Касса
            </button>

            <button
              onClick={() => setCurrentPage('salary')}
              className="bg-white text-slate-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200 font-medium"
            >
              💼 Зарплата
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className="bg-white text-slate-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200 font-medium"
            >
              ⚙️ Настройки
            </button>
          </div>

          {/* Таблица заказов */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Загрузка заказов...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Нет заказов. Нажмите "Принять заказ" чтобы добавить первый заказ.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">№</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Дата</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Клиент</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Телефон</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Вид обуви</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Бренд</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Цвет</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Кол-во</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Услуги</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Комментарий</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-900">{order.orderNumber}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.clientName}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.phone}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.shoeType}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.brand}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.color}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.quantity}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.services}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{order.comment}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Модальное окно для приема заказа */}
        <OrderFormModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onSubmit={async (orderData) => {
            try {
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
              });

              if (response.ok) {
                setShowOrderModal(false);
                loadOrders(); // Перезагрузить список заказов
              }
            } catch (error) {
              console.error('Ошибка создания заказа:', error);
            }
          }}
        />

        <InstallInstructions isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      </div>
    );
  }

  // Касса - отдельный компонент
  if (currentPage === 'cash') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-4 mb-4">
          <button
            onClick={() => setCurrentPage('menu')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ← Назад в меню
          </button>
        </div>
        <CashPage />
      </div>
    );
  }

  // Остальные страницы
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentPage('menu')}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Назад в меню
        </button>

        <h1 className="text-3xl font-bold mb-6">
          {currentPage === 'expenses' && 'Расходы'}
          {currentPage === 'salary' && 'Зарплата'}
          {currentPage === 'settings' && 'Настройки'}
        </h1>

        <div className="bg-white p-6 rounded-lg shadow">
          {currentPage === 'settings' ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowInstallModal(true)}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                <span className="text-xl">📱</span>
                <span className="font-medium">Установить приложение</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Нажмите кнопку выше, чтобы узнать как установить приложение на ваше устройство.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Раздел в разработке...</p>
          )}
        </div>
      </div>
      <InstallInstructions isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </div>
  );
}
