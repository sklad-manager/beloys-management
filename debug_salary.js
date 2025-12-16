const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking recent orders ---');
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { master: true, salaryLogs: true } // salaryLogs might not be in relation yet? let's check schema assumption
    });

    // Note: If SalaryLog relation is not defined in Order model in schema, include: { salaryLogs: true } will fail.
    // Based on previous reads, Order has `salaryLogs`? 
    // Let's check schema first. Logic:
    // Model Master has `orders Order[]`.
    // Model Order has `master Master?`.
    // Model SalaryLog has `master Master` and `orderId Int?`.
    // It DOES NOT seem to have `order Order` relation in SalaryLog or `salaryLogs SalaryLog[]` in Order.
    // So I cannot include salaryLogs in Order query directly if schema wasn't updated.
    // I will fetch salary logs separately.
}

async function debugSafe() {
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { master: true }
    });

    for (const order of orders) {
        console.log(`Order #${order.orderNumber} (ID: ${order.id})`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Price: ${order.price}`);
        console.log(`  MasterID: ${order.masterId}`);
        if (order.master) {
            console.log(`  Master: ${order.master.name}, %: ${order.master.percentage}`);
        } else {
            console.log(`  Master: NONE`);
        }

        const logs = await prisma.salaryLog.findMany({
            where: { orderId: order.id }
        });
        console.log(`  Salary Logs found: ${logs.length}`);
        logs.forEach(log => console.log(`    - Amount: ${log.amount}`));
        console.log('---');
    }
}

debugSafe()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
