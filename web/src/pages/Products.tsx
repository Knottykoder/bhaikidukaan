import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, X, Tag, Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { useProductStore } from '../stores/productStore.js';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [selectedSort, setSelectedSort] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const { products, categories, isLoading, fetchProducts, fetchCategories } = useProductStore();

  // Fetch products and categories on mount / filter change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts({
      category: activeCategory,
      search: searchQuery,
      sortBy: selectedSort,
      maxPrice: maxPrice < 10000 ? maxPrice : undefined,
      inStockOnly,
    });
  }, [activeCategory, searchQuery, selectedSort, maxPrice, inStockOnly, fetchProducts]);

  const handleCategoryChange = (catId: string) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          ALL COLLECTIONS ({products.length} ITEMS)
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc' }}>
          Explore Products Catalog
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Discover our full collection of premium wireless audio, smart gear, apparel, and workspace essentials.
        </p>
      </div>

      {/* Active Search Notification */}
      {searchQuery && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 14px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: '0.9rem',
            color: '#c7d2fe',
          }}
        >
          <span>Showing results for: <strong>"{searchQuery}"</strong></span>
          <button onClick={clearSearch} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Controls: Category Pills & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 32,
          padding: '16px 20px',
          background: 'rgba(22, 27, 38, 0.7)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => handleCategoryChange('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeCategory === 'all' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
              color: activeCategory === 'all' ? '#fff' : '#94a3b8',
              border: activeCategory === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease',
            }}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeCategory === cat.id ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: activeCategory === cat.id ? '#fff' : '#94a3b8',
                border: activeCategory === cat.id ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Selector & In-Stock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#94a3b8' }}>
            <ArrowUpDown size={15} />
            <select
              value={selectedSort}
              onChange={(e: any) => setSelectedSort(e.target.value)}
              style={{
                background: '#131822',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
            In Stock Only
          </label>
        </div>
      </div>

      {/* Loading state or Results Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Loader2 size={36} color="#818cf8" className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading catalog from Product Service...</p>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(22, 27, 38, 0.5)',
            borderRadius: 20,
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Tag size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: 8 }}>No products found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
            Try adjusting your search criteria or resetting filters.
          </p>
          <button
            onClick={() => {
              searchParams.delete('category');
              searchParams.delete('search');
              setSearchParams(searchParams);
              setMaxPrice(10000);
              setInStockOnly(false);
            }}
            className="btn-primary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
