const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Попытка создать заказ (повторно)...');
    try {
        const nextOrderNumber = '000003';
        const paymentMethod = 'Cash';
        const prepayment = 50;

        const newOrder = await prisma.order.create({
            data: {
                orderNumber: nextOrderNumber,
                clientName: 'Тест Скрипт 2',
                phone: '0999999998',
                shoeType: 'Тест 2',
                brand: 'Тест',
                color: 'Тест',
                services: 'Тест',
                price: 200,
                // prepayment: 50, // Убрали!
                // paymentMethod: 'Cash', // Убрали!
                comment: 'Тест создания 2',
                quantity: 1,
                status: 'Принят в работу',
                masterPrice: 0,
                materialPrice: 0,
                prepaymentCash: paymentMethod === 'Cash' ? prepayment : 0,
                prepaymentTerminal: paymentMethod === 'Terminal' ? prepayment : 0,
            }
        });
        console.log('Заказ создан успешно:', newOrder);
    } catch (e) {
        console.error('Ошибка создания заказа:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
