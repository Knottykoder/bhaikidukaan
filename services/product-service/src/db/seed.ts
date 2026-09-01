import { connectDB, disconnectDB } from './index.js';
import { CategoryModel } from './models/category.model.js';
import { ProductModel } from './models/product.model.js';
import { logger } from '../utils/logger.js';

const SEED_CATEGORIES = [
  {
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'High-fidelity headphones, smart gear and audio peripherals.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
  {
    name: 'Streetwear & Apparel',
    slug: 'fashion',
    description: 'Premium heavyweight hoodies, tees and urban streetwear.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
  {
    name: 'Watches & Gear',
    slug: 'accessories',
    description: 'Minimalist smart timepieces, tactical bags and accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
  {
    name: 'Workspace & Living',
    slug: 'workspace',
    description: 'Ergonomic desk setups, ambient lighting and mechanical keyboards.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
];

async function seed() {
  logger.info('🌱 Starting Product Catalog Seeding...');
  await connectDB();

  // Clear existing
  await CategoryModel.deleteMany({});
  await ProductModel.deleteMany({});

  const createdCategories = await CategoryModel.insertMany(SEED_CATEGORIES);
  logger.info(`✅ Seeded ${createdCategories.length} categories`);

  const catMap = new Map(createdCategories.map((c) => [c.slug, c]));

  const SEED_PRODUCTS = [
    {
      name: 'BKD Pro Noise-Cancelling Wireless Headphones',
      slug: 'bkd-pro-headphones',
      description:
        'Flagship active noise-cancelling headphones with 40mm beryllium drivers, spatial audio, and 45-hour battery life. Ultra-soft memory foam earcups for all-day comfort.',
      price: 4999,
      compareAtPrice: 8999,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('electronics')?.id || '',
      categoryName: 'Electronics & Audio',
      tags: ['wireless', 'anc', 'bluetooth', 'audio', 'bestseller'],
      stock: 24,
      rating: 4.9,
      reviewCount: 342,
      attributes: {
        battery: '45 Hours',
        connectivity: 'Bluetooth 5.3',
        noiseCancellation: 'Active Hybrid ANC',
      },
    },
    {
      name: 'Cyberpunk OLED Smart Watch Ultra',
      slug: 'cyberpunk-oled-smart-watch',
      description:
        'Titanium aerospace-grade casing, always-on Retina AMOLED display, heart rate + SpO2 biosensors, ECG, and IP68 waterproof rating for adventure enthusiasts.',
      price: 3499,
      compareAtPrice: 6499,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('accessories')?.id || '',
      categoryName: 'Watches & Gear',
      tags: ['smartwatch', 'fitness', 'oled', 'titanium'],
      stock: 18,
      rating: 4.8,
      reviewCount: 189,
      attributes: {
        display: 'AMOLED Always-On',
        waterproof: 'IP68',
        batteryLife: '14 Days',
      },
    },
    {
      name: 'Heavyweight Oversized "Dev-Life" Hoodie',
      slug: 'dev-life-heavyweight-hoodie',
      description:
        '450 GSM 100% organic French terry cotton. Custom drop-shoulder silhouette, double-layered hood with stealth pocket for tech gear.',
      price: 1899,
      compareAtPrice: 2999,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('fashion')?.id || '',
      categoryName: 'Streetwear & Apparel',
      tags: ['streetwear', 'cotton', 'oversized', 'winter'],
      stock: 45,
      rating: 4.7,
      reviewCount: 95,
      attributes: {
        material: '450 GSM Organic Cotton',
        fit: 'Oversized Drop-Shoulder',
      },
    },
    {
      name: 'Custom Gasket Mechanical Keyboard RGB (Hot-Swap)',
      slug: 'custom-gasket-keyboard',
      description:
        '75% layout gasket mounted keyboard with pre-lubed Linear Silver switches, PBT double-shot keycaps, south-facing RGB, and tri-mode connectivity (2.4G/BT5.0/Type-C).',
      price: 5499,
      compareAtPrice: 8499,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('workspace')?.id || '',
      categoryName: 'Workspace & Living',
      tags: ['keyboard', 'mechanical', 'rgb', 'wireless', 'hot-swap'],
      stock: 12,
      rating: 5.0,
      reviewCount: 412,
      attributes: {
        switches: 'Linear Pre-Lubed Silver',
        connectivity: 'Tri-Mode Wireless',
        mount: 'Gasket Structure',
      },
    },
    {
      name: 'Minimalist EDC Waterproof Tech Backpack (25L)',
      slug: 'edc-tech-backpack-25l',
      description:
        'Cordura waterproof ballistic nylon with dedicated 16" MacBook Pro sleeve, hidden passport compartment, magnetic Fidlock buckles, and external USB-C pass-through.',
      price: 2799,
      compareAtPrice: 4299,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('accessories')?.id || '',
      categoryName: 'Watches & Gear',
      tags: ['backpack', 'tech', 'waterproof', 'travel'],
      stock: 30,
      rating: 4.8,
      reviewCount: 128,
      attributes: {
        capacity: '25 Liters',
        laptopSleeve: 'Up to 16 Inches',
        material: 'Cordura Ballistic Nylon',
      },
    },
    {
      name: 'Studio Master True Wireless ANC Earbuds',
      slug: 'studio-master-tws-earbuds',
      description:
        'Hybrid ANC with transparency mode, dual dynamic drivers, wireless charging case, and low-latency gaming mode (38ms).',
      price: 2299,
      compareAtPrice: 4999,
      currency: 'INR',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80',
      ],
      categoryId: catMap.get('electronics')?.id || '',
      categoryName: 'Electronics & Audio',
      tags: ['earbuds', 'tws', 'audio', 'anc'],
      stock: 50,
      rating: 4.6,
      reviewCount: 215,
      attributes: {
        anc: '35dB Hybrid Noise Cancellation',
        battery: '32 Hours Total',
        waterResistance: 'IPX5',
      },
    },
  ];

  const createdProducts = await ProductModel.insertMany(SEED_PRODUCTS);
  logger.info(`✅ Seeded ${createdProducts.length} products`);

  await disconnectDB();
  logger.info('🎉 Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
