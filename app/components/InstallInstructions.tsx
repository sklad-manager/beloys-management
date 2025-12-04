'use client';

import { useState } from 'react';

interface InstallInstructionsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallInstructions({ isOpen, onClose }: InstallInstructionsProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Установка приложения</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">📱 На Android:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Откройте сайт в Chrome</li>
                            <li>Нажмите меню (⋮) в правом верхнем углу</li>
                            <li>Выберите "Установить приложение" или "Добавить на главный экран"</li>
                            <li>Подтвердите установку</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">🍎 На iPhone/iPad:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Откройте сайт в Safari</li>
                            <li>Нажмите кнопку "Поделиться" (□↑)</li>
                            <li>Прокрутите вниз и выберите "На экран Домой"</li>
                            <li>Нажмите "Добавить"</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">💻 На компьютере:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Откройте сайт в Chrome или Edge</li>
                            <li>Нажмите значок установки (⊕) в адресной строке</li>
                            <li>Или: Меню → "Установить Beloys"</li>
                        </ol>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                        <p className="text-sm text-blue-800">
                            <strong>Преимущества:</strong> Быстрый доступ с главного экрана, работает как обычное приложение!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
        </div >
    );
}
