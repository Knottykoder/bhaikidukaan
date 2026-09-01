export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  currency: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  tags: string[];
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  features: string[];
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
  icon: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'High-fidelity headphones, smart gear and audio peripherals.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productCount: 8,
    icon: 'Headphones',
  },
  {
    id: 'cat-fashion',
    name: 'Streetwear & Apparel',
    slug: 'fashion',
    description: 'Premium heavyweight hoodies, tees and urban streetwear.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    productCount: 6,
    icon: 'Shirt',
  },
  {
    id: 'cat-accessories',
    name: 'Watches & Gear',
    slug: 'accessories',
    description: 'Minimalist smart timepieces, tactical bags and accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    productCount: 5,
    icon: 'Watch',
  },
  {
    id: 'cat-home',
    name: 'Workspace & Living',
    slug: 'workspace',
    description: 'Ergonomic desk setups, ambient lighting and mechanical keyboards.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    productCount: 7,
    icon: 'Laptop',
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-001',
    name: 'BKD Pro Noise-Cancelling Wireless Headphones',
    slug: 'bkd-pro-headphones',
    description: 'Flagship active noise-cancelling headphones with 40mm beryllium drivers, spatial audio, and 45-hour battery life. Ultra-soft memory foam earcups for all-day comfort.',
    price: 4999,
    compareAtPrice: 8999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    tags: ['wireless', 'anc', 'bluetooth', 'audio', 'bestseller'],
    stock: 24,
    inStock: true,
    rating: 4.9,
    reviewCount: 342,
    badge: 'Bestseller',
    features: ['Active Noise Cancellation (ANC)', '45-Hour Battery Life', 'Bluetooth 5.3 + Multipoint', 'Fast USB-C Charging (10m = 5h)'],
  },
  {
    id: 'prod-002',
    name: 'Cyberpunk OLED Smart Watch Ultra',
    slug: 'cyberpunk-oled-smart-watch',
    description: 'Titanium aerospace-grade casing, always-on Retina AMOLED display, heart rate + SpO2 biosensors, ECG, and IP68 waterproof rating for adventure enthusiasts.',
    price: 3499,
    compareAtPrice: 6499,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-accessories',
    categoryName: 'Watches & Gear',
    tags: ['smartwatch', 'fitness', 'oled', 'titanium'],
    stock: 18,
    inStock: true,
    rating: 4.8,
    reviewCount: 189,
    badge: 'Trending',
    features: ['Aerospace Titanium Case', 'AMOLED Always-On Display', 'Continuous Health Monitoring', '14-Day Battery Life'],
  },
  {
    id: 'prod-003',
    name: 'Heavyweight Oversized "Dev-Life" Hoodie',
    slug: 'dev-life-heavyweight-hoodie',
    description: '450 GSM 100% organic French terry cotton. Custom drop-shoulder silhouette, double-layered hood with stealth pocket for tech gear.',
    price: 1899,
    compareAtPrice: 2999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-fashion',
    categoryName: 'Streetwear & Apparel',
    tags: ['streetwear', 'cotton', 'oversized', 'winter'],
    stock: 45,
    inStock: true,
    rating: 4.7,
    reviewCount: 95,
    badge: 'Popular',
    features: ['450 GSM Heavy Cotton', 'Pre-Shrunk Bio-Washed Fabric', 'Secret Internal Tech Pocket', 'Reinforced Ribbed Cuffs'],
  },
  {
    id: 'prod-004',
    name: 'Custom Gasket Mechanical Keyboard RGB (Hot-Swap)',
    slug: 'custom-gasket-keyboard',
    description: '75% layout gasket mounted keyboard with pre-lubed Linear Silver switches, PBT double-shot keycaps, south-facing RGB, and tri-mode connectivity (2.4G/BT5.0/Type-C).',
    price: 5499,
    compareAtPrice: 8499,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-home',
    categoryName: 'Workspace & Living',
    tags: ['keyboard', 'mechanical', 'rgb', 'wireless', 'hot-swap'],
    stock: 12,
    inStock: true,
    rating: 5.0,
    reviewCount: 412,
    badge: 'Top Rated',
    features: ['Sound-Dampening Gasket Mount', 'Hot-Swappable 5-Pin PCB', 'Pre-Lubed Custom Switches', 'CNC Aluminum Rotary Knob'],
  },
  {
    id: 'prod-005',
    name: 'Minimalist EDC Waterproof Tech Backpack (25L)',
    slug: 'edc-tech-backpack-25l',
    description: 'Cordura waterproof ballistic nylon with dedicated 16" MacBook Pro sleeve, hidden passport compartment, magnetic Fidlock buckles, and external USB-C pass-through.',
    price: 2799,
    compareAtPrice: 4299,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-accessories',
    categoryName: 'Watches & Gear',
    tags: ['backpack', 'tech', 'waterproof', 'travel'],
    stock: 30,
    inStock: true,
    rating: 4.8,
    reviewCount: 128,
    features: ['Cordura Weatherproof Shield', 'Ergonomic Air-Mesh Backing', 'Fidlock Magnetic Hardware', 'Dedicated 16" Laptop Cradle'],
  },
  {
    id: 'prod-006',
    name: 'Studio Master True Wireless ANC Earbuds',
    slug: 'studio-master-tws-earbuds',
    description: 'Hybrid ANC with transparency mode, dual dynamic drivers, wireless charging case, and low-latency gaming mode (38ms).',
    price: 2299,
    compareAtPrice: 4999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    tags: ['earbuds', 'tws', 'audio', 'anc'],
    stock: 50,
    inStock: true,
    rating: 4.6,
    reviewCount: 215,
    features: ['35dB Active Noise Cancelling', '32-Hour Combined Playback', 'IPX5 Sweat & Rain Resistance', 'Fast Touch Controls'],
  },
];
