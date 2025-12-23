const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        select: { orderNumber: true, id: true },
        orderBy: { id: 'desc' },
        take: 20
    });
    console.log('Last 20 orders by ID:');
    console.table(orders);

    const allOrders = await prisma.order.findMany({
        select: { orderNumber: true }
    });
    const max = allOrders.reduce((acc, curr) => {
        const val = parseInt(curr.orderNumber, 10);
        return isNaN(val) ? acc : Math.max(acc, val);
    }, 0);
    console.log('Highest orderNumber found:', max);
}

main().catch(console.error).finally(() => prisma.$disconnect());
