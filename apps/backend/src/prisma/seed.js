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
    await prisma.administrator.upsert({
        where: { email: 'admin@easymesse.com' },
        update: {
            password: await bcrypt.hash('Admin2025*', 10),
        },
        create: {
            name: 'Admin',
            email: 'admin@easymesse.com',
            password: await bcrypt.hash('Admin2024*', 10),
            phone: '+237696841451',
            role: 'ADMIN',
        },
    });

    // Create cities
    for (const city of cities) {
        await prisma.city.upsert({
            where: { country: 'Cameroon' },
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