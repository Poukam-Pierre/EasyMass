const { createId } = require('@paralleldrive/cuid2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const cities = [
    { city_name: 'Bamboutos' },
    { city_name: 'HAUT-NKAM' },
    { city_name: 'Haut-Nkam' },
    { city_name: 'Haut-Plateaux' },
    { city_name: 'Koung-Khi' },
    { city_name: 'Menoua' },
    { city_name: 'Mifi' },
    { city_name: 'Nde' },
    { city_name: 'Noun' },
]
async function seedEasyMass() {
    // create admin first admin user
    await prisma.administrator.upsert({
        where: { email: 'admin@easymesse.com' },
        update: {
            password: await bcrypt.hash('Admin2025*', 10),
        },
        create: {
            name: 'Administrator',
            email: 'admin@easymesse.com',
            password: await bcrypt.hash('Admin2025*', 10),
            phone: '+237696841451',
            role: 'ADMIN',
        },
    });

    // Create cities
    for (const city of cities) {
        await prisma.city.upsert({
            where: { city_id: createId() },
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