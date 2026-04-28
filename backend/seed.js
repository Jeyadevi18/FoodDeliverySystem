/**
 * Seed Script — Creates Admin & Delivery Agent accounts with passwords
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const USERS = [
    // ─── Admin ───────────────────────────────────────────────
    {
        name: 'Jeyadevi (Admin)',
        email: 'jeyadevi1711@gmail.com',
        password: 'Admin@1234',
        role: 'admin',
        phone: '',
        isGoogle: false,
    },

    // ─── Delivery Agents ─────────────────────────────────────
    {
        name: 'Malar Kodirkodi',
        email: 'malarkodirkodi@gmail.com',
        password: 'Delivery@1234',
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
    {
        name: 'Jeyaselva',
        email: 'jeyaselva17@gmail.com',
        password: 'Delivery@1234',
        role: 'delivery',
        phone: '',
        isGoogle: false,
    },
    {
        name: 'Kaviya Kannan',
        email: 'kaviyakannan73@gmail.com',
        password: 'Delivery@1234',
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
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                // Update role and reset password
                existing.role = u.role;
                existing.name = u.name;
                existing.password = u.password;   // will be hashed by pre-save hook
                existing.isGoogle = false;
                await existing.save();
                console.log(`🔄 Updated  [${u.role.toUpperCase().padEnd(9)}] ${u.email}`);
            } else {
                await User.create({ ...u, avatar: '', address: '', location: {} });
                console.log(`✅ Created  [${u.role.toUpperCase().padEnd(9)}] ${u.email}`);
            }
        }

        console.log('\n─────────────────────────────────────────────');
        console.log('🎉 Seeding complete!');
        console.log('\nLogin credentials:');
        console.log('  Admin    → jeyadevi1711@gmail.com   / Admin@1234');
        console.log('  Delivery → malarkodirkodi@gmail.com / Delivery@1234');
        console.log('  Delivery → jeyaselva17@gmail.com    / Delivery@1234');
        console.log('  Delivery → kaviyakannan73@gmail.com / Delivery@1234');
        console.log('  Customer → any new email / register yourself');
        console.log('─────────────────────────────────────────────');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
};

seed();
