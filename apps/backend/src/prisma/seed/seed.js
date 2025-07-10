const { createId } = require('@paralleldrive/cuid2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { logger } = require('./logger');
const { createInitialAdminAccount } = require('./admin.seed');

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
async function main() {
    logger.debug('Seeding initialisation started...');

    const environment = process.env.NODE_ENV;
    logger.info(`Running in ${environment} environment`);


    switch (environment) {
        case 'development': {
            const admin = {
                email: String(process.env.APP_EMAIL || 'admin@easymesse.com'),
                password: String(process.env.APP_EMAIL_PASS || 'Admin2025*'),
            }

            return await createInitialAdminAccount(admin);
        }
        case 'production': {
            const admin = {
                email: String(process.env.APP_EMAIL),
                password: String(process.env.APP_EMAIL_PASS),
            }

            return await createInitialAdminAccount(admin);
        }
        case 'test':
            /** data for your test environment */
            break;
        default:
            break;

    }

    // create admin first admin user
    // TODO: Old version of seed. Need to be DELETE
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

main()
    .catch(async (error) => {
        console.error('❌ Error seeding database:', error);
        await prisma.$disconnect();
        process.exit(1);
    })
    .finally(async () => {
        logger.success('✅ Database seeded successfully!');
        await prisma.$disconnect();
    });