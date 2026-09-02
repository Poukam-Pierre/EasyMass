const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const cities = [
    'BAMBOUTOS',
    'HAUT-NKAM',
    'HAUT-PLATEAUX',
    'KOUNG-KHI',
    'MENOUA',
    'MIFI',
    'NDE',
    'NOUN'
]
async function seedEasyMass() {
    // create admin first admin user
    const hashedPassword = await bcrypt.hash('Admin2025*', 10);

    await prisma.user.upsert({
        where: { email: 'admin@easymesse.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'admin@easymesse.com',
            password: hashedPassword,
            role: 'ADMIN',
            admin: {
                create: {
                    name: 'Admin',
                    phone: '+237696841451',
                    role: 'ADMIN',
                },
            },
        },
    });

    // XAF must always have a working fee config — mobile money checkouts
    // are XAF-only. Idempotent: leaves an existing row (e.g. one an admin
    // already configured via the Settings page) untouched, only fills in
    // a missing one.
    await prisma.platformSettings.upsert({
        where: { currency: 'XAF' },
        update: {},
        create: { currency: 'XAF', platformFeePercentage: 0, platformFeeFixedAmount: 0 },
    });

    // Create cities
    for (const city of cities) {
        await prisma.city.upsert({
            where: { city_name_country: { city_name: city, country: 'Cameroon' } },
            update: {},
            create: {
                city_name: city,
            },
        });
    }
    console.log('✅ Database seeded successfully!');
    console.log('Admin user credentials:');
    console.log('Email: admin@easymesse.com');
    console.log('Password: Admin2025*');
}

seedEasyMass()
    .catch((error) => {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
