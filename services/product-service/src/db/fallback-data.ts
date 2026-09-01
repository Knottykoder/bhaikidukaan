export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface ProductItem {
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
  variants: any[];
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const FALLBACK_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'High-fidelity headphones, smart gear and audio peripherals.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
  {
    id: 'cat-fashion',
    name: 'Streetwear & Apparel',
    slug: 'fashion',
    description: 'Premium heavyweight hoodies, tees and urban streetwear.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
  {
    id: 'cat-accessories',
    name: 'Watches & Gear',
    slug: 'accessories',
    description: 'Minimalist smart timepieces, tactical bags and accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
  {
    id: 'cat-workspace',
    name: 'Workspace & Living',
    slug: 'workspace',
    description: 'Ergonomic desk setups, ambient lighting and mechanical keyboards.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
];

export const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
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
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    tags: ['wireless', 'anc', 'bluetooth', 'audio', 'bestseller'],
    stock: 24,
    inStock: true,
    rating: 4.9,
    reviewCount: 342,
    variants: [],
    attributes: {
      battery: '45 Hours',
      connectivity: 'Bluetooth 5.3',
      noiseCancellation: 'Active Hybrid ANC',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
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
    categoryId: 'cat-accessories',
    categoryName: 'Watches & Gear',
    tags: ['smartwatch', 'fitness', 'oled', 'titanium'],
    stock: 18,
    inStock: true,
    rating: 4.8,
    reviewCount: 189,
    variants: [],
    attributes: {
      display: 'AMOLED Always-On',
      waterproof: 'IP68',
      batteryLife: '14 Days',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Neon Matrix Heavyweight Oversized Hoodie',
    slug: 'neon-matrix-oversized-hoodie',
    description:
      '450 GSM pure French Terry cotton oversized fit hoodie. Featuring Cyber-Tokyo reflective graphic print and kangaroo stash pocket. Built to last a lifetime.',
    price: 2199,
    compareAtPrice: 3999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-fashion',
    categoryName: 'Streetwear & Apparel',
    tags: ['streetwear', 'hoodie', 'oversized', 'cotton', 'winter'],
    stock: 45,
    inStock: true,
    rating: 4.7,
    reviewCount: 95,
    variants: [],
    attributes: {
      fabric: '450 GSM French Terry',
      fit: 'Drop Shoulder Oversized',
      wash: 'Bio-Washed Anti-Pilling',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Tactical Matte Black EDC Sling Bag',
    slug: 'tactical-matte-black-sling-bag',
    description:
      'Waterproof Cordura 1000D fabric sling bag with Fidlock magnetic buckle, concealed passport pocket, and expandable main compartment.',
    price: 1899,
    compareAtPrice: 3199,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-accessories',
    categoryName: 'Watches & Gear',
    tags: ['tactical', 'bag', 'waterproof', 'edc'],
    stock: 12,
    inStock: true,
    rating: 4.9,
    reviewCount: 210,
    variants: [],
    attributes: {
      material: 'Cordura 1000D Waterproof',
      buckle: 'Fidlock V-Buckle Magnet',
      capacity: '6 Liters Expandable',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Apex Mechanical RGB Gaming Keyboard (Hot-Swap)',
    slug: 'apex-mechanical-rgb-keyboard',
    description:
      'Gasket mounted 75% mechanical keyboard with pre-lubed Gateron Yellow switches, sound-dampening silicone, south-facing RGB and tri-mode wireless.',
    price: 5499,
    compareAtPrice: 9999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-workspace',
    categoryName: 'Workspace & Living',
    tags: ['keyboard', 'rgb', 'mechanical', 'wireless', 'hot-swap'],
    stock: 8,
    inStock: true,
    rating: 5.0,
    reviewCount: 412,
    variants: [],
    attributes: {
      switches: 'Gateron Pro Yellow (Hot-swappable)',
      mount: 'Gasket Mount Silicone Foam',
      connectivity: '2.4GHz + BT 5.0 + Type-C',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'SonicWave Portable Bluetooth Speaker 40W',
    slug: 'sonicwave-portable-speaker',
    description:
      '360-degree immersive punchy bass audio with dual passive radiators, IPX7 submersion waterproof, LED beat light ring, and power bank feature.',
    price: 2799,
    compareAtPrice: 4999,
    currency: 'INR',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=80',
    ],
    categoryId: 'cat-electronics',
    categoryName: 'Electronics & Audio',
    tags: ['speaker', 'bluetooth', 'bass', 'waterproof'],
    stock: 30,
    inStock: true,
    rating: 4.6,
    reviewCount: 154,
    variants: [],
    attributes: {
      outputPower: '40W RMS Dual Drivers',
      waterproof: 'IPX7 Submersible',
      battery: '24 Hours Playback',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
