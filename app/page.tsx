'use client';

import { useState } from 'react';
import CashPage from './components/CashPage';

type MenuPage = 'menu' | 'clients' | 'expenses' | 'cash' | 'salary' | 'settings';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<MenuPage>('menu');

  if (currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Beloys
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentPage('clients')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
            >
              <div className="text-5xl mb-4">👥</div>
              <div className="text-xl font-semibold text-gray-800">Клиенты</div>
            </button>

            <button
              onClick={() => setCurrentPage('expenses')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
            >
              <div className="text-5xl mb-4">💰</div>
              <div className="text-xl font-semibold text-gray-800">Расходы</div>
            </button>

            <button
              onClick={() => setCurrentPage('cash')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
            >
              <div className="text-5xl mb-4">💵</div>
              <div className="text-xl font-semibold text-gray-800">Касса</div>
            </button>

            <button
              onClick={() => setCurrentPage('salary')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
            >
              <div className="text-5xl mb-4">💼</div>
              <div className="text-xl font-semibold text-gray-800">Зарплата</div>
            </button>

            <button
              onClick={() => setCurrentPage('settings')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center md:col-span-2"
            >
              <div className="text-5xl mb-4">⚙️</div>
              <div className="text-xl font-semibold text-gray-800">Настройки</div>
            </button>
          </div>
        </div>
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
          {currentPage === 'clients' && 'Клиенты'}
          {currentPage === 'expenses' && 'Расходы'}
          {currentPage === 'salary' && 'Зарплата'}
          {currentPage === 'settings' && 'Настройки'}
        </h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Раздел в разработке...</p>
        </div>
      </div>
    </div>
  );
}
