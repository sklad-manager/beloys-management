const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSalaryCalculation() {
    // 1. Create an order with serviceDetails
    const order = await prisma.order.create({
        data: {
            orderNumber: "TEST-SALARY-" + Date.now(),
            clientName: "Salary Test Client",
            phone: "0000000001",
            shoeType: "Test",
            brand: "Test",
            color: "Test",
            services: "Service 1 [Master1: 1000], Service 2 [Master2: 2000]",
            serviceDetails: JSON.stringify([
                { service: "Service 1", masterId: 1, masterName: "Белоус", price: "1000" },
                { service: "Service 2", masterId: 2, masterName: "Евгений", price: "2000" }
            ]),
            price: 3000,
            masterPrice: 0,
            materialPrice: 0,
            status: 'Принят в работу',
        }
    });

    console.log("Order created:", order.id);

    // 2. Simulate PATCH /api/orders/[id]/status
    const status = 'Готово';

    // Logic from the API route (manual simulation)
    const result = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: { status },
            include: { master: true }
        });

        if (status === 'Готово') {
            const existingLogs = await tx.salaryLog.findMany({
                where: { orderId: order.id }
            });

            if (existingLogs.length === 0) {
                if (updatedOrder.serviceDetails) {
                    const details = JSON.parse(updatedOrder.serviceDetails);
                    const masterPortions = {};
                    details.forEach((item) => {
                        if (item.masterId) {
                            const price = parseFloat(item.price) || 0;
                            masterPortions[item.masterId] = (masterPortions[item.masterId] || 0) + price;
                        }
                    });

                    for (const [mId, portion] of Object.entries(masterPortions)) {
                        const master = await tx.master.findUnique({
                            where: { id: parseInt(mId) }
                        });
                        if (master) {
                            const salaryAmount = portion * (master.percentage / 100);
                            await tx.salaryLog.create({
                                data: {
                                    amount: salaryAmount,
                                    masterId: parseInt(mId),
                                    orderId: order.id,
                                    date: new Date(),
                                    isPaid: false
                                }
                            });
                        }
                    }
                }
            }
        }
        return updatedOrder;
    });

    console.log("Order updated to Готово");

    // 3. Check SalaryLogs
    const logs = await prisma.salaryLog.findMany({
        where: { orderId: order.id },
        include: { master: true }
    });

    console.log("Generated Salary Logs:");
    logs.forEach(log => {
        console.log(`Master: ${log.master.name}, Portion Price Base: ${log.amount / (log.master.percentage / 100)}, Percentage: ${log.master.percentage}%, Salary: ${log.amount}`);
    });
}

testSalaryCalculation()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
