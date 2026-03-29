/**
 * Fix broken food images — replaces empty/broken imageUrls with working Unsplash photos
 * Run: node fixImages.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');

const FIXES = [
    {
        name: 'Chole Bhature',
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop',
    },
    {
        name: 'Japchae',
        imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop',
    },
    {
        name: 'Chicken Katsu Curry',
        imageUrl: 'https://images.unsplash.com/photo-1604908177522-0f5f4e9acd84?w=600&auto=format&fit=crop',
    },
    {
        name: 'Salmon Sushi Platter',
        imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop',
    },
    {
        name: 'Kimchi Jjigae',
        imageUrl: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600&auto=format&fit=crop',
    },
    {
        name: 'Churros with Chocolate Dip',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop',
    },
    {
        name: 'Gulab Jamun',
        imageUrl: 'https://images.unsplash.com/photo-1666195974803-e9c3a94a9a4c?w=600&auto=format&fit=crop',
    },
];

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    for (const fix of FIXES) {
        const result = await FoodItem.findOneAndUpdate(
            { name: fix.name },
            { $set: { imageUrl: fix.imageUrl } },
            { new: true }
        );
        if (result) {
            console.log(`🖼️  Fixed: ${fix.name}`);
        } else {
            console.log(`⚠️  Not found: ${fix.name}`);
        }
    }

    console.log('\n✅ Image fix complete!');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
