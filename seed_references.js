const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const shoeTypes = [
        'Кроссовки',
        'Туфли',
        'Ботинки',
        'Сапоги',
        'Сандалии',
        'Лоферы',
        'Слипоны',
        'Кеды',
        'Мокасины',
        'Балетки'
    ];

    console.log('Seeding shoe types...');

    for (const type of shoeTypes) {
        const existing = await prisma.referenceItem.findFirst({
            where: { type: 'SHOE_TYPE', value: type }
        });

        if (!existing) {
            await prisma.referenceItem.create({
                data: {
                    type: 'SHOE_TYPE',
                    value: type
                }
            });
            console.log(`Added: ${type}`);
        } else {
            console.log(`Skipped (exists): ${type}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
