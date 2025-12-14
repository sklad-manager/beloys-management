const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.referenceItem.count({
        where: { type: 'SERVICE' }
    });
    console.log('Service Count:', count);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
