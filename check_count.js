const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.referenceItem.count({
        where: { type: 'SHOE_TYPE' }
    });
    console.log('Shoe Type Count:', count);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
