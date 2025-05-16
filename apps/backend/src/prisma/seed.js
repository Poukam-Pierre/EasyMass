const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const cities = [
    { city_name: 'BAMBOUTOS' },
    { city_name: 'HAUT-NKAM' },
    { city_name: 'HAUT-PLATEAUX' },
    { city_name: 'KOUNG-KHI' },
    { city_name: 'MENOUA' },
    { city_name: 'MIFI' },
    { city_name: 'NDE' },
    { city_name: 'NOUN' },
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
            where: { city_name: city.city_name },
            update: {},
            create: {
                city_name: city.city_name,
            }
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