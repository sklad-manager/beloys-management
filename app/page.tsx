'use client';

import { useState } from 'react';
import CashPage from './components/CashPage';
import InstallInstructions from './components/InstallInstructions';

type MenuPage = 'menu' | 'clients' | 'expenses' | 'cash' | 'salary' | 'settings';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<MenuPage>('menu');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  if (currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="flex justify-between items-center mb-12 relative">
            <div className="w-10"></div> {/* Spacer for centering */}
            <h1 className="text-4xl font-bold text-gray-800">
              Beloys
            </h1>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[220px] z-20">
                    <button
                      onClick={() => {
                        setShowInstallModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-xl">📱</span>
                      <span className="font-medium">Установить приложение</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

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
