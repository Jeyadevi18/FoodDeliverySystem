/**
 * Seed Script — Creates real user accounts for Google Sign-In
 * These emails are pre-registered with their roles.
 * When they sign in with Google, the backend finds their email and logs them in with the correct role.
 *
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const USERS = [
    // ─── Admin ───────────────────────────────────────────────
    {
        name: 'Jeyadevis (Admin)',
        email: 'jeyadevi1711@gmail.com',
        role: 'admin',
        phone: '',
        isGoogle: false, // can login with Google OR email/password
    },

    // ─── Delivery Agents ─────────────────────────────────────
    {
        name: 'Kaviya Kannan',
        email: 'kaviyakannan73@gmail.com',
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
    {
        name: 'Malar Kodirkodi',
        email: 'malarkodirkodi@gmail.com',
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
    {
        name: 'Jeyadevis17',
        email: 'jeyadevis17@gmail.com',
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
    {
        name: 'Malar Koodir',
        email: 'malarkoodir2006@gmail.com', // fixed typo: gmal → gmail
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Atlas connected\n');

        for (const u of USERS) {
            // Check if already exists
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                // Just update role if needed
                existing.role = u.role;
                existing.name = u.name;
                await existing.save({ validateBeforeSave: false });
                console.log(`🔄 Updated  [${u.role.toUpperCase().padEnd(8)}] ${u.email}`);
            } else {
                await User.create({ ...u, avatar: '', address: '', location: {} });
                console.log(`✅ Created  [${u.role.toUpperCase().padEnd(8)}] ${u.email}`);
            }
        }

        console.log('\n🎉 Seeding complete!');
        console.log('─────────────────────────────────────────────');
        console.log('How to login:');
        console.log('  1. Go to http://localhost:5173/login');
        console.log('  2. Select your role (Admin / Delivery / Customer)');
        console.log('  3. Click "Sign in with Google"');
        console.log('  4. Use the Gmail account listed above');
        console.log('  5. You will be automatically logged in with the correct role!');
        console.log('─────────────────────────────────────────────');
        console.log('\nCustomers: Any Gmail user can sign in → auto-registered as Customer');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
};

seed();
