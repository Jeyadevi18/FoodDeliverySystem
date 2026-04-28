/**
 * Food Seed Script
 * Adds 50+ food items across multiple cuisines (Chinese, Korean, Japanese, Indian, Mexican, Italian, Thai)
 * Both Veg and Non-Veg with high-quality Unsplash images.
 *
 * Run: node seedFoods.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');

const foods = [

    // ─────────────────────────────────────────────────────────────
    // 🇨🇳  CHINESE CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Veg Fried Rice',
        description: 'Classic Chinese steamed rice stir-fried with mixed vegetables, soy sauce & sesame oil.',
        price: 149,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop',
        tags: ['chinese', 'rice', 'veg'],
        preparationTime: 20,
        rating: 4.4,
    },
    {
        name: 'Chicken Fried Rice',
        description: 'Tender chicken pieces tossed with egg, veggies and savory soy sauce fried rice.',
        price: 199,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop',
        tags: ['chinese', 'rice', 'chicken'],
        preparationTime: 25,
        rating: 4.6,
    },
    {
        name: 'Kung Pao Chicken',
        description: 'Spicy stir-fried chicken with peanuts, chili peppers, and Sichuan peppercorns.',
        price: 279,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop',
        tags: ['chinese', 'spicy', 'chicken'],
        preparationTime: 30,
        rating: 4.7,
    },
    {
        name: 'Veg Hakka Noodles',
        description: 'Thin noodles stir-fried with crisp vegetables in a tangy Hakka-style sauce.',
        price: 139,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop',
        tags: ['chinese', 'noodles', 'veg'],
        preparationTime: 20,
        rating: 4.3,
    },
    {
        name: 'Dim Sum Basket (Veg)',
        description: 'Steamed dumplings stuffed with cabbage, mushrooms and ginger. Served with soy dipping sauce.',
        price: 219,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop',
        tags: ['chinese', 'dumplings', 'steamed', 'veg'],
        preparationTime: 25,
        rating: 4.5,
    },
    {
        name: 'Pork Char Siu Bao',
        description: 'Fluffy steamed buns filled with sweet BBQ-glazed pork — a Hong Kong classic.',
        price: 249,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop',
        tags: ['chinese', 'bao', 'pork', 'steamed'],
        preparationTime: 30,
        rating: 4.8,
    },
    {
        name: 'Hot & Sour Soup',
        description: 'A warming Chinese broth with tofu, bamboo shoots, mushrooms, and a tangy peppery kick.',
        price: 119,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
        tags: ['chinese', 'soup', 'veg'],
        preparationTime: 15,
        rating: 4.2,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇰🇷  KOREAN CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Bibimbap (Veg)',
        description: 'Warm rice bowl topped with assorted seasoned vegetables, gochujang sauce & a fried egg.',
        price: 259,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop',
        tags: ['korean', 'rice', 'veg'],
        preparationTime: 25,
        rating: 4.6,
    },
    {
        name: 'Korean Fried Chicken',
        description: 'Double-fried crispy chicken glazed with sweet-spicy yangnyeom sauce. Addictively crunchy!',
        price: 319,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop',
        tags: ['korean', 'chicken', 'fried', 'spicy'],
        preparationTime: 35,
        rating: 4.9,
    },
    {
        name: 'Tteokbokki',
        description: 'Chewy rice cakes simmered in a fiery gochujang sauce. A beloved Korean street food.',
        price: 189,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600&auto=format&fit=crop',
        tags: ['korean', 'street food', 'spicy', 'veg'],
        preparationTime: 20,
        rating: 4.5,
    },
    {
        name: 'Bulgogi',
        description: 'Thinly sliced marinated beef grilled to perfection with sesame, garlic & soy. Classic Korean BBQ.',
        price: 349,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop',
        tags: ['korean', 'beef', 'bbq', 'grilled'],
        preparationTime: 35,
        rating: 4.8,
    },
    {
        name: 'Japchae',
        description: 'Glass noodles stir-fried with colourful vegetables, spinach and sesame oil.',
        price: 229,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop',
        tags: ['korean', 'noodles', 'veg'],
        preparationTime: 25,
        rating: 4.4,
    },
    {
        name: 'Kimchi Jjigae',
        description: 'Rich and tangy kimchi stew with tofu, pork belly and green onions. A Korean comfort classic.',
        price: 279,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop',
        tags: ['korean', 'stew', 'kimchi', 'pork'],
        preparationTime: 30,
        rating: 4.7,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇯🇵  JAPANESE CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Salmon Sushi Platter',
        description: 'Premium fresh salmon nigiri and maki rolls served with wasabi & pickled ginger.',
        price: 449,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop',
        tags: ['japanese', 'sushi', 'salmon', 'seafood'],
        preparationTime: 20,
        rating: 4.9,
    },
    {
        name: 'Veggie Sushi Roll',
        description: 'Fresh avocado, cucumber, and carrot wrapped in seaweed and seasoned sushi rice.',
        price: 299,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&auto=format&fit=crop',
        tags: ['japanese', 'sushi', 'veg', 'avocado'],
        preparationTime: 20,
        rating: 4.5,
    },
    {
        name: 'Chicken Ramen',
        description: 'Rich tonkotsu-style broth with noodles, soft boiled egg, nori, bamboo shoots & tender chicken.',
        price: 329,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop',
        tags: ['japanese', 'ramen', 'noodles', 'chicken'],
        preparationTime: 30,
        rating: 4.8,
    },
    {
        name: 'Miso Soup',
        description: 'Traditional Japanese fermented soy paste soup with tofu, seaweed and spring onions.',
        price: 89,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
        tags: ['japanese', 'soup', 'veg', 'miso'],
        preparationTime: 10,
        rating: 4.3,
    },
    {
        name: 'Chicken Katsu Curry',
        description: 'Crispy panko-breaded chicken cutlet on steamed rice smothered with Japanese curry sauce.',
        price: 349,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1604579068891-fb6fde8c6890?w=600&auto=format&fit=crop',
        tags: ['japanese', 'curry', 'chicken', 'katsu'],
        preparationTime: 35,
        rating: 4.7,
    },
    {
        name: 'Veg Tempura',
        description: 'Light crispy battered vegetables — broccoli, sweet potato, zucchini — with dipping sauce.',
        price: 219,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop',
        tags: ['japanese', 'tempura', 'fried', 'veg'],
        preparationTime: 20,
        rating: 4.4,
    },
    {
        name: 'Takoyaki (Octopus Balls)',
        description: 'Fluffy wheat batter balls stuffed with tender octopus, topped with mayo & bonito flakes.',
        price: 269,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop',
        tags: ['japanese', 'street food', 'seafood', 'octopus'],
        preparationTime: 20,
        rating: 4.6,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇹🇭  THAI CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Pad Thai (Veg)',
        description: 'Classic Thai rice noodles stir-fried with tofu, bean sprouts, egg, tamarind & peanuts.',
        price: 229,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop',
        tags: ['thai', 'noodles', 'veg'],
        preparationTime: 25,
        rating: 4.5,
    },
    {
        name: 'Pad Thai with Shrimp',
        description: 'Stir-fried rice noodles with juicy prawns, eggs, tamarind sauce and crushed peanuts.',
        price: 299,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop',
        tags: ['thai', 'noodles', 'shrimp', 'seafood'],
        preparationTime: 25,
        rating: 4.7,
    },
    {
        name: 'Green Curry (Veg)',
        description: 'Creamy coconut milk curry with green chili paste, eggplant, bamboo shoots & Thai basil.',
        price: 249,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop',
        tags: ['thai', 'curry', 'coconut', 'veg'],
        preparationTime: 30,
        rating: 4.6,
    },
    {
        name: 'Tom Yum Soup',
        description: 'Spicy and sour Thai broth with mushrooms, lemongrass, galangal, kaffir lime & chili.',
        price: 179,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop',
        tags: ['thai', 'soup', 'spicy', 'veg'],
        preparationTime: 20,
        rating: 4.4,
    },
    {
        name: 'Massaman Chicken Curry',
        description: 'Mild, rich Thai curry with chicken, potatoes, peanuts & fragrant coconut cream.',
        price: 319,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop',
        tags: ['thai', 'curry', 'chicken', 'coconut'],
        preparationTime: 35,
        rating: 4.7,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇲🇽  MEXICAN CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Bean & Cheese Burrito (Veg)',
        description: 'Large flour tortilla stuffed with spiced black beans, Mexican rice, cheese & salsa.',
        price: 239,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop',
        tags: ['mexican', 'burrito', 'veg'],
        preparationTime: 20,
        rating: 4.4,
    },
    {
        name: 'Chicken Tacos',
        description: 'Soft corn tortillas packed with grilled chicken, pico de gallo, jalapeños & lime crema.',
        price: 279,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop',
        tags: ['mexican', 'tacos', 'chicken'],
        preparationTime: 20,
        rating: 4.7,
    },
    {
        name: 'Nachos with Guacamole',
        description: 'Crispy tortilla chips loaded with melted cheese, jalapeños, sour cream and fresh guacamole.',
        price: 199,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop',
        tags: ['mexican', 'snack', 'veg', 'nachos'],
        preparationTime: 15,
        rating: 4.5,
    },
    {
        name: 'Beef Quesadilla',
        description: 'Crispy grilled tortilla filled with seasoned ground beef, peppers, onions and melted cheese.',
        price: 299,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&auto=format&fit=crop',
        tags: ['mexican', 'quesadilla', 'beef'],
        preparationTime: 25,
        rating: 4.6,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇮🇹  ITALIAN CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Margherita Pizza',
        description: 'Thin-crust pizza with San Marzano tomato sauce, fresh mozzarella & basil leaves.',
        price: 299,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop',
        tags: ['italian', 'pizza', 'veg'],
        preparationTime: 25,
        rating: 4.6,
    },
    {
        name: 'Pepperoni Pizza',
        description: 'Classic loaded pizza with crispy pepperoni slices, mozzarella and rich tomato sauce.',
        price: 349,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop',
        tags: ['italian', 'pizza', 'pepperoni'],
        preparationTime: 30,
        rating: 4.8,
    },
    {
        name: 'Pasta Aglio e Olio',
        description: 'Spaghetti tossed in garlic-infused extra virgin olive oil with chili flakes and parsley.',
        price: 249,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&auto=format&fit=crop',
        tags: ['italian', 'pasta', 'veg'],
        preparationTime: 20,
        rating: 4.4,
    },
    {
        name: 'Chicken Alfredo Pasta',
        description: 'Creamy parmesan sauce tossed with fettuccine and pan-seared chicken breast.',
        price: 319,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop',
        tags: ['italian', 'pasta', 'chicken', 'creamy'],
        preparationTime: 30,
        rating: 4.7,
    },
    {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso-soaked ladyfingers layered with mascarpone cream.',
        price: 179,
        category: 'desserts',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop',
        tags: ['italian', 'dessert', 'coffee'],
        preparationTime: 10,
        rating: 4.9,
    },

    // ─────────────────────────────────────────────────────────────
    // 🇮🇳  INDIAN CUISINE
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Paneer Butter Masala',
        description: 'Soft cottage cheese cubes in a velvety tomato-cashew gravy spiced with garam masala.',
        price: 249,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop',
        tags: ['indian', 'curry', 'paneer', 'veg'],
        preparationTime: 30,
        rating: 4.7,
    },
    {
        name: 'Chicken Biryani',
        description: 'Fragrant long-grain basmati rice layered with spiced tender chicken, caramelized onions & saffron.',
        price: 299,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&auto=format&fit=crop',
        tags: ['indian', 'biryani', 'rice', 'chicken'],
        preparationTime: 45,
        rating: 4.9,
    },
    {
        name: 'Masala Dosa',
        description: 'Crispy golden crepe made from fermented rice batter, filled with spiced potato & onion.',
        price: 129,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop',
        tags: ['indian', 'south indian', 'dosa', 'veg'],
        preparationTime: 20,
        rating: 4.6,
    },
    {
        name: 'Butter Chicken',
        description: 'Tender tandoor-grilled chicken in a rich, buttery tomato cream sauce. India\'s most loved dish.',
        price: 289,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
        tags: ['indian', 'curry', 'chicken', 'creamy'],
        preparationTime: 35,
        rating: 4.8,
    },
    {
        name: 'Chole Bhature',
        description: 'Spicy chickpea curry served with fluffy deep-fried bread. A Punjabi street food classic.',
        price: 149,
        category: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop',
        tags: ['indian', 'punjabi', 'chickpea', 'veg'],
        preparationTime: 25,
        rating: 4.5,
    },
    {
        name: 'Prawn Curry',
        description: 'Succulent prawns slow-cooked in a spicy coconut-based South Indian curry sauce.',
        price: 329,
        category: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&auto=format&fit=crop',
        tags: ['indian', 'seafood', 'prawn', 'coastal'],
        preparationTime: 30,
        rating: 4.7,
    },

    // ─────────────────────────────────────────────────────────────
    // 🥤  BEVERAGES
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Mango Lassi',
        description: 'Chilled creamy yogurt drink blended with fresh Alphonso mangoes. Perfectly refreshing.',
        price: 89,
        category: 'beverages',
        imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop',
        tags: ['beverage', 'lassi', 'mango', 'indian'],
        preparationTime: 5,
        rating: 4.7,
    },
    {
        name: 'Matcha Latte',
        description: 'Smooth Japanese ceremonial-grade matcha whisked with steamed oat milk and a touch of honey.',
        price: 149,
        category: 'beverages',
        imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop',
        tags: ['beverage', 'japanese', 'matcha', 'latte'],
        preparationTime: 5,
        rating: 4.6,
    },
    {
        name: 'Thai Iced Tea',
        description: 'Spiced strong tea sweetened with condensed milk poured over ice. A Thai street food staple.',
        price: 99,
        category: 'beverages',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop',
        tags: ['beverage', 'thai', 'tea', 'iced'],
        preparationTime: 5,
        rating: 4.5,
    },
    {
        name: 'Korean Banana Milk',
        description: 'Creamy, sweet banana-flavoured milk — Korea\'s iconic childhood drink, now a global favorite.',
        price: 79,
        category: 'beverages',
        imageUrl: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=600&auto=format&fit=crop',
        tags: ['beverage', 'korean', 'banana', 'milk'],
        preparationTime: 2,
        rating: 4.4,
    },

    // ─────────────────────────────────────────────────────────────
    // 🍮  DESSERTS
    // ─────────────────────────────────────────────────────────────
    {
        name: 'Mochi Ice Cream',
        description: 'Soft Japanese rice cake wrapped around premium ice cream in matcha, strawberry & mango.',
        price: 199,
        category: 'desserts',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop',
        tags: ['dessert', 'japanese', 'mochi', 'ice cream'],
        preparationTime: 5,
        rating: 4.8,
    },
    {
        name: 'Bingsu (Korean Shaved Ice)',
        description: 'Fluffy shaved milk ice topped with sweet red bean, fresh fruit and condensed milk.',
        price: 229,
        category: 'desserts',
        imageUrl: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=600&auto=format&fit=crop',
        tags: ['dessert', 'korean', 'shaved ice'],
        preparationTime: 10,
        rating: 4.7,
    },
    {
        name: 'Gulab Jamun',
        description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup. India\'s favourite dessert.',
        price: 99,
        category: 'desserts',
        imageUrl: 'https://images.unsplash.com/photo-1601050690641-a2e4e43b4853?w=600&auto=format&fit=crop',
        tags: ['dessert', 'indian', 'sweet'],
        preparationTime: 10,
        rating: 4.8,
    },
    {
        name: 'Churros with Chocolate Dip',
        description: 'Crispy fried dough sticks dusted with cinnamon sugar, served with thick hot chocolate sauce.',
        price: 159,
        category: 'desserts',
        imageUrl: 'https://images.unsplash.com/photo-1624371414737-82e193c0f637?w=600&auto=format&fit=crop',
        tags: ['dessert', 'mexican', 'churros'],
        preparationTime: 15,
        rating: 4.6,
    },
];

const seedFoods = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Atlas connected\n');

        let added = 0;
        let skipped = 0;

        for (const item of foods) {
            const exists = await FoodItem.findOne({ name: item.name });
            if (exists) {
                // Update image if missing
                if (!exists.imageUrl && item.imageUrl) {
                    exists.imageUrl = item.imageUrl;
                    await exists.save();
                    console.log(`🔄 Updated image for: ${item.name}`);
                } else {
                    console.log(`⏭️  Already exists: ${item.name}`);
                }
                skipped++;
            } else {
                await FoodItem.create({ ...item, available: true, numReviews: 0 });
                console.log(`✅ Added [${item.category.toUpperCase().padEnd(8)}] ${item.name}`);
                added++;
            }
        }

        console.log('\n─────────────────────────────────────────────');
        console.log(`🎉 Seeding complete! Added: ${added} | Skipped: ${skipped}`);
        console.log('─────────────────────────────────────────────');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
};

seedFoods();
