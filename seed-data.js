process.env.DATABASE_URL = 'file:./prisma/dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
    try {
        // Add masters
        const master1 = await prisma.master.upsert({
            where: { name: 'Иван' },
            update: {},
            create: { name: 'Иван', percentage: 50 },
        });

        const master2 = await prisma.master.upsert({
            where: { name: 'Петр' },
            update: {},
            create: { name: 'Петр', percentage: 60 },
        });

        console.log('Masters created:', master1, master2);

        // Add reference items
        const shoeTypes = ['Ботинки', 'Кроссовки', 'Туфли', 'Сапоги'];
        const brands = ['Nike', 'Adidas', 'Puma', 'Reebok'];
        const colors = ['Черный', 'Белый', 'Коричневый', 'Синий'];
        const services = ['Замена набойки', 'Замена подошвы', 'Чистка', 'Покраска'];

        for (const type of shoeTypes) {
            await prisma.referenceItem.upsert({
                where: { id: 0 },
                update: {},
                create: { type: 'SHOE_TYPE', value: type },
            }).catch(() => { });
        }

        for (const brand of brands) {
            await prisma.referenceItem.upsert({
                where: { id: 0 },
                update: {},
                create: { type: 'BRAND', value: brand },
            }).catch(() => { });
        }

        for (const color of colors) {
            await prisma.referenceItem.upsert({
                where: { id: 0 },
                update: {},
                create: { type: 'COLOR', value: color },
            }).catch(() => { });
        }

        for (const service of services) {
            await prisma.referenceItem.upsert({
                where: { id: 0 },
                update: {},
                create: { type: 'SERVICE', value: service },
            }).catch(() => { });
        }

        console.log('Reference items created');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
