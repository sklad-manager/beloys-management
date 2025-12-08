process.env.DATABASE_URL = 'file:./prisma/dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const masters = await prisma.master.findMany();
        const refs = await prisma.referenceItem.findMany();

        console.log('Masters:', JSON.stringify(masters, null, 2));
        console.log('\nReferences:', JSON.stringify(refs, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
