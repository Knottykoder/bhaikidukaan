import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export interface IProduct extends Document {
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
  variants: IProductVariant[];
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    options: { type: Map, of: String, default: {} },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret._id;
        return ret;
      },
    },
  },
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    images: { type: [String], default: [] },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    variants: [ProductVariantSchema],
    attributes: { type: Map, of: String, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.inStock = (ret.stock ?? 0) > 0;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Virtual for inStock
ProductSchema.virtual('inStock').get(function () {
  return (this.stock || 0) > 0;
});

// Full-text search index
ProductSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
});

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
