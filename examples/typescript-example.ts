/**
 * TypeScript Example for Advanced Filter System
 * This example demonstrates type-safe usage of AFS with TypeScript
 */

import { AFS, AFSOptions, FilterTypeLogic, SortCriteria, RangeSliderOptions } from '../src/types/index';

// Define custom interfaces for your data
interface ProductData {
  id: string;
  title: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  dateAdded: string;
  features: string[];
}

// Type-safe configuration
const filterLogic: FilterTypeLogic = {
  category: { mode: 'OR', multi: true },
  brand: 'OR',
  price: 'AND',
  rating: { mode: 'OR', multi: false }
};

// Complete configuration with TypeScript support
const afsOptions: AFSOptions = {
  // Required selectors
  containerSelector: '.products-container',
  itemSelector: '.product-item',
  
  // Optional selectors with type safety
  filterButtonSelector: '.filter-btn',
  searchInputSelector: '.search-input',
  counterSelector: '.results-counter',
  sortButtonSelector: '.sort-btn',
  
  // Filter configuration with type-safe logic
  filterCategoryMode: 'mixed',
  filterTypeLogic: filterLogic,
  
  // Search configuration
  searchKeys: ['title', 'category', 'brand', 'features'],
  debounceTime: 300,
  
  // Pagination with typed options
  pagination: {
    enabled: true,
    itemsPerPage: 12,
    container: '.pagination-container',
    scrollToTop: true,
    scrollBehavior: 'smooth',
    showPrevNext: true
  },
  
  // Animation with type-safe options
  animation: {
    type: 'fade',
    duration: 300,
    easing: 'ease-out'
  },
  
  // Counter with type-safe formatter
  counter: {
    template: 'Showing {visible} of {total} products',
    showFiltered: true,
    filteredTemplate: '({filtered} hidden)',
    noResultsTemplate: 'No products found',
    formatter: (num: number) => new Intl.NumberFormat().format(num)
  },
  
  // State management
  preserveState: true,
  urlStateKey: 'shop',
  stateExpiry: 24 * 60 * 60 * 1000, // 24 hours
  
  // System options
  debug: process.env.NODE_ENV === 'development',
  logLevel: 'info',
  responsive: true
};

// Initialize AFS with type safety
const afs = new AFS(afsOptions);

// Type-safe event handling
afs.on('initialized', (data) => {
  console.log(`AFS initialized with ${data.itemCount} items`);
  console.log('Configuration:', data.options);
});

afs.on('filtersApplied', (data) => {
  console.log(`Showing ${data.visibleItems} of ${data.total} items`);
  console.log(`Active filters: ${Array.from(data.activeFilters).join(', ')}`);
});

afs.on('search', (data) => {
  console.log(`Search "${data.query}" found ${data.matches.length} matches`);
});

afs.on('pageChanged', (data) => {
  console.log(`Page ${data.currentPage} of ${data.totalPages}`);
  console.log(`Showing ${data.visibleItems} items per page`);
});

// Type-safe API usage
class ProductFilter {
  private afs: AFS;
  
  constructor(afsInstance: AFS) {
    this.afs = afsInstance;
    this.setupCustomFilters();
  }
  
  // Add price range filter with type safety
  addPriceFilter(): void {
    const priceOptions: RangeSliderOptions = {
      key: 'price',
      type: 'number',
      container: '.price-filter-container',
      min: 0,
      max: 5000,
      step: 50,
      ui: {
        showHistogram: true,
        bins: 20,
        showValues: true,
        showLabels: true
      }
    };
    
    this.afs.rangeFilter.addRangeSlider(priceOptions);
  }
  
  // Add rating filter
  addRatingFilter(): void {
    const ratingOptions: RangeSliderOptions = {
      key: 'rating',
      type: 'number',
      container: '.rating-filter-container',
      min: 1,
      max: 5,
      step: 0.1,
      defaultMin: 4.0
    };
    
    this.afs.rangeFilter.addRangeSlider(ratingOptions);
  }
  
  // Type-safe sorting
  sortByPrice(direction: 'asc' | 'desc' = 'asc'): void {
    this.afs.sort.sort('price', direction);
  }
  
  // Multi-column sorting with type safety
  sortMultiple(): void {
    const criteria: SortCriteria[] = [
      { key: 'category', direction: 'asc' },
      { key: 'price', direction: 'desc' },
      { key: 'rating', direction: 'desc' }
    ];
    
    this.afs.sort.sortMultiple(criteria);
  }
  
  // Custom sorting with type safety
  sortByPopularity(): void {
    this.afs.sort.sortWithComparator('popularity', (a: ProductData, b: ProductData) => {
      // Custom logic combining rating and reviews
      const scoreA = a.rating * Math.log(a.price + 1);
      const scoreB = b.rating * Math.log(b.price + 1);
      return scoreB - scoreA;
    });
  }
  
  // Type-safe filter management
  clearCategoryFilters(): void {
    this.afs.filter.clearFilterCategory('category:*');
  }
  
  // Search with type safety
  searchProducts(query: string): void {
    this.afs.search.search(query);
  }
  
  // Get current state with type safety
  getCurrentState(): any {
    const state = this.afs.getState();
    return {
      activeFilters: Array.from(this.afs.filter.getActiveFilters()),
      searchQuery: this.afs.search.getValue(),
      currentSort: this.afs.sort.getCurrentSort(),
      pageInfo: this.afs.pagination.getPageInfo(),
      priceRange: this.afs.rangeFilter.getRangeValue('price'),
      ratingRange: this.afs.rangeFilter.getRangeValue('rating')
    };
  }
  
  private setupCustomFilters(): void {
    // Setup category-specific logic
    this.afs.filter.setFilterTypeLogic('category', { mode: 'OR', multi: true });
    this.afs.filter.setFilterTypeLogic('brand', 'OR');
    this.afs.filter.setFilterTypeLogic('price', 'AND');
    
    // Add custom event handlers
    this.afs.on('rangeChanged', (data) => {
      console.log(`${data.key} range: ${data.min} - ${data.max}`);
    });
  }
}

// Usage example
const productFilter = new ProductFilter(afs);

// Setup filters
productFilter.addPriceFilter();
productFilter.addRatingFilter();

// Example of type-safe programmatic filtering
document.addEventListener('DOMContentLoaded', () => {
  // Apply initial filters
  afs.filter.addFilter('category:electronics');
  afs.filter.addFilter('brand:apple');
  
  // Set price range
  afs.rangeFilter.setRangeValue('price', 500, 2000);
  
  // Perform search
  productFilter.searchProducts('laptop');
  
  // Sort results
  productFilter.sortByPrice('desc');
  
  // Navigate to page 2
  afs.pagination.goToPage(2);
});

// Advanced TypeScript usage with generics
class TypedAFS<T extends Record<string, any>> extends AFS {
  private dataSchema?: T;
  
  constructor(options: AFSOptions, schema?: T) {
    super(options);
    this.dataSchema = schema;
  }
  
  // Type-safe data extraction
  getItemData(item: HTMLElement): Partial<T> {
    const data: Partial<T> = {};
    
    if (this.dataSchema) {
      Object.keys(this.dataSchema).forEach((key) => {
        const value = item.dataset[key] || item.getAttribute(`data-${key}`);
        if (value) {
          data[key as keyof T] = value as T[keyof T];
        }
      });
    }
    
    return data;
  }
  
  // Type-safe filtering based on data schema
  filterByData(key: keyof T, value: T[keyof T]): void {
    this.filter.addFilter(`${String(key)}:${value}`);
  }
}

// Usage with typed data
interface ProductSchema {
  title: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
}

const typedAFS = new TypedAFS<ProductSchema>(afsOptions, {
  title: '',
  category: '',
  brand: '',
  price: 0,
  rating: 0
});

// Type-safe operations
typedAFS.filterByData('category', 'electronics');
typedAFS.filterByData('brand', 'apple');

// Export for use in other modules
export { ProductFilter, TypedAFS };
export type { ProductData, ProductSchema };