const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: true }
    });

    console.log('Последние 5 заказов:');
    orders.forEach(order => {
        console.log(`ID: ${order.id}, Num: ${order.orderNumber}`);
        console.log(`  ClientName (Field): ${order.clientName}`);
        console.log(`  Phone (Field): ${order.phone}`);
        console.log(`  Client Relation: ${order.client ? `Yes (ID: ${order.client.id}, Name: ${order.client.name})` : 'No'}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
