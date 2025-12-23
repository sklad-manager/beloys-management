const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const all = await prisma.order.findMany({
        select: { orderNumber: true, id: true }
    });
    console.log('All order numbers in DB:');
    all.forEach(o => console.log(`ID: ${o.id}, Num: ${o.orderNumber}`));

    const numbers = all.map(o => parseInt(o.orderNumber)).filter(n => !isNaN(n));
    console.log('Max numeric orderNumber:', Math.max(...numbers, 0));
}

main().catch(console.error).finally(() => prisma.$disconnect());
