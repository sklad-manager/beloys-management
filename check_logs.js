const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.orderEditLog.count();
        console.log('OrderEditLog count:', count);
        const logs = await prisma.orderEditLog.findMany({ take: 5 });
        console.log('Sample logs:', logs);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
