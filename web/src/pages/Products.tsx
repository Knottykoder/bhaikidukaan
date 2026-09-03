import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ArrowUpDown, X, Tag, Loader2, Sparkles, IndianRupee, RotateCcw, Check } from 'lucide-react';
import {
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { ProductCard } from '../components/ProductCard.js';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/productsApi.js';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [selectedSort, setSelectedSort] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Convert priceFilter string to maxPrice number
  const getMaxPrice = (): number | undefined => {
    if (priceFilter === '2000') return 2000;
    if (priceFilter === '3500') return 3500;
    if (priceFilter === '5000') return 5000;
    if (priceFilter === '8000') return 8000;
    return undefined;
  };

  const {
    data: productsData,
    isLoading,
    error: queryError,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    category: activeCategory,
    search: searchQuery,
    sortBy: selectedSort,
    maxPrice: getMaxPrice(),
    inStockOnly,
  });

  const { data: categories = [], refetch: refetchCategories } = useGetCategoriesQuery();

  const products = productsData?.products || [];
  const error = queryError ? ((queryError as any)?.data?.error || 'Failed to fetch products') : null;

  const handleRetry = () => {
    refetchCategories();
    refetchProducts();
  };

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

  const handleResetFilters = () => {
    searchParams.delete('category');
    searchParams.delete('search');
    setSearchParams(searchParams);
    setPriceFilter('all');
    setInStockOnly(false);
    setSelectedSort('featured');
  };

  const hasActiveFilters = activeCategory !== 'all' || searchQuery || inStockOnly || priceFilter !== 'all';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: '0.78rem',
            color: '#818cf8',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={14} />
          <span>ALL COLLECTIONS ({products.length} ITEMS)</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 900,
            color: '#f8fafc',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Explore Store Catalog
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: 650, lineHeight: 1.5 }}>
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
            borderRadius: 10,
            marginBottom: 20,
            fontSize: '0.88rem',
            color: '#c7d2fe',
          }}
        >
          <span>
            Showing results for: <strong>"{searchQuery}"</strong>
          </span>
          <button
            onClick={clearSearch}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Unified Filter & Controls Card */}
      <div
        style={{
          marginBottom: 32,
          padding: '18px 20px',
          borderRadius: 20,
          background: 'rgba(18, 23, 34, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Tier 1: Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          <button
            onClick={() => handleCategoryChange('all')}
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeCategory === 'all' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
              background: activeCategory === 'all'
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === 'all' ? '#ffffff' : '#94a3b8',
              boxShadow: activeCategory === 'all' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            All Items
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Tier 2: Secondary Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Quick Price Range Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <IndianRupee size={14} color="#818cf8" /> Budget:
            </span>

            {[
              { label: 'All Prices', val: 'all' },
              { label: 'Under ₹2,000', val: '2000' },
              { label: 'Under ₹3,500', val: '3500' },
              { label: 'Under ₹5,000', val: '5000' },
              { label: 'Under ₹8,000', val: '8000' },
            ].map((p) => {
              const isSelected = priceFilter === p.val;
              return (
                <button
                  key={p.val}
                  onClick={() => setPriceFilter(p.val)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#c7d2fe' : '#94a3b8',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort Selector & In-Stock Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={14} color="#94a3b8" />
              <Select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                size="small"
                sx={{
                  height: 36,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#94a3b8',
                  },
                }}
              >
                <MenuItem value="featured">Featured First</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Top Customer Rated</MenuItem>
              </Select>
            </div>

            {/* In-Stock Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                padding: '3px 10px',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#10b981',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#10b981',
                      },
                    }}
                  />
                }
                label={
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                    In Stock Only
                  </span>
                }
                sx={{ margin: 0 }}
              />
            </div>

            {/* Reset Filters Button (when active) */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state or Results Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Loader2 size={36} color="#818cf8" className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Loading catalog from Product Service...</p>
        </div>
      ) : error && products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'rgba(22, 27, 38, 0.8)',
            borderRadius: 20,
            border: '1px solid rgba(239, 68, 68, 0.25)',
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#f87171',
            }}
          >
            <Tag size={26} />
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>
            Unable to load products
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.5 }}>
            {error || 'Could not connect to the backend server. Please make sure the Product Service and Gateway are running.'}
          </p>
          <Button variant="contained" color="primary" onClick={handleRetry} sx={{ borderRadius: '10px' }}>
            Retry Connection
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'rgba(22, 27, 38, 0.6)',
            borderRadius: 20,
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          <Tag size={42} color="#475569" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>
            No products found
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.5 }}>
            {searchQuery || activeCategory !== 'all' || inStockOnly || priceFilter !== 'all'
              ? 'No items matched your current filter criteria. Try expanding your budget or resetting filters.'
              : 'There are currently no products available in the store. Please check back later!'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleResetFilters}
              sx={{ borderRadius: '10px' }}
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
