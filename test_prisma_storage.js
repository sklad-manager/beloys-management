const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const body = {
        clientName: "Test Client JSON",
        phone: "9998887766",
        shoeType: "Кроссовки",
        brand: "Nike",
        color: "White",
        services: "Cleaning [Master1: 500 грн], Repair [Master1: 1000 грн]",
        serviceDetails: [
            { service: "Cleaning", masterId: 1, masterName: "Белоус", price: "500" },
            { service: "Repair", masterId: 1, masterName: "Белоус", price: "1000" }
        ],
        price: "1500",
        prepayment: "200",
        paymentMethod: "Cash",
        comment: "Test serviceDetails storage",
        quantity: 1,
        masterId: 1
    };

    const {
        clientName,
        phone,
        shoeType,
        brand,
        color,
        services,
        serviceDetails,
        price,
        prepayment,
        paymentMethod,
        comment,
        masterId,
        quantity
    } = body;

    // Simplified logic from API
    const lastOrder = await prisma.order.findFirst({
        orderBy: { id: 'desc' },
    });
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
        nextNumber = parseInt(lastOrder.orderNumber, 10) + 1;
    }
    const orderNumber = nextNumber.toString();

    const newOrder = await prisma.order.create({
        data: {
            orderNumber,
            clientName,
            phone,
            shoeType: shoeType || 'Обувь',
            brand: brand || '',
            color: color || '',
            services: services || '',
            serviceDetails: serviceDetails ? JSON.stringify(serviceDetails) : null,
            price: parseFloat(price),
            comment: comment || '',
            quantity: quantity ? parseInt(quantity) : 1,
            masterPrice: 0,
            materialPrice: 0,
            status: 'Принят в работу',
            prepaymentCash: paymentMethod === 'Cash' ? (parseFloat(prepayment) || 0) : 0,
            prepaymentTerminal: paymentMethod === 'Terminal' ? (parseFloat(prepayment) || 0) : 0,
            masterId: masterId ? Number(masterId) : null
        },
    });

    console.log("Created Order:", newOrder);

    // Verify it
    const fetched = await prisma.order.findUnique({
        where: { id: newOrder.id }
    });
    console.log("Fetched serviceDetails:", fetched.serviceDetails);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
