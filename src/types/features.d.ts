/**
 * Feature Types for Advanced Filter System
 * @fileoverview TypeScript definitions for feature classes
 */

import { 
  SortDirection, 
  SortCriteria, 
  FilterMode, 
  FilterTypeConfig,
  RangeSliderOptions,
  DateFilterOptions,
  PageInfo,
  AFSEventData
} from './index';
import { AFS } from './index';

// Filter Feature
export declare class Filter {
  constructor(afs: AFS);
  
  addFilter(filter: string): void;
  removeFilter(filter: string): void;
  toggleFilter(filter: string): void;
  toggleFilterExclusive(filter: string): void;
  clearAllFilters(): void;
  clearFilterCategory(category: string): void;
  getActiveFilters(): Set<string>;
  setFilterTypeLogic(type: string, logic: FilterMode | FilterTypeConfig): void;
  applyFilters(): void;
  getFilteredItems(): Set<HTMLElement>;
  isFilterActive(filter: string): boolean;
  getFiltersByType(type: string): Set<string>;
  destroy(): void;
}

// Search Feature
export declare class Search {
  constructor(afs: AFS);
  
  search(query: string): void;
  clearSearch(): void;
  setValue(value: string): void;
  getValue(): string;
  getMatches(): HTMLElement[];
  highlightMatches(enable?: boolean): void;
  configure(options: { 
    keys?: string[];
    debounce?: number;
    minLength?: number;
    caseSensitive?: boolean;
  }): void;
  destroy(): void;
}

// Sort Feature
export declare class Sort {
  constructor(afs: AFS);
  
  sort(key: string, direction?: SortDirection): void;
  sortMultiple(criteria: SortCriteria[]): void;
  sortWithComparator(key: string, comparator: (a: any, b: any) => number): void;
  shuffle(): void;
  reset(): void;
  getCurrentSort(): SortCriteria | null;
  getSortValue(element: HTMLElement, key: string): any;
  addCustomComparator(name: string, comparator: (a: any, b: any) => number): void;
  destroy(): void;
}

// Pagination Feature
export declare class Pagination {
  constructor(afs: AFS);
  
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;
  firstPage(): void;
  lastPage(): void;
  setPaginationMode(enabled: boolean): void;
  setItemsPerPage(count: number): void;
  getPageInfo(): PageInfo;
  getCurrentPage(): number;
  getTotalPages(): number;
  getItemsPerPage(): number;
  update(): void;
  render(): void;
  destroy(): void;
}

// Range Filter Feature
export declare class RangeFilter {
  constructor(afs: AFS);
  
  addRangeSlider(options: RangeSliderOptions): void;
  removeRangeSlider(key: string): void;
  getRangeValue(key: string): { min: number; max: number } | null;
  setRangeValue(key: string, min: number, max: number): void;
  resetRange(key: string): void;
  getRangeSliders(): Map<string, any>;
  updateHistogram(key: string): void;
  destroy(): void;
}

// Date Filter Feature
export declare class DateFilter {
  constructor(afs: AFS);
  
  addDateRange(options: DateFilterOptions): void;
  removeDateRange(key: string): void;
  getDateRange(key: string): { start: Date; end: Date } | null;
  setDateRange(key: string, start: Date, end: Date): void;
  resetDateRange(key: string): void;
  getDateFilters(): Map<string, any>;
  parseDate(dateString: string, format?: string): Date;
  formatDate(date: Date, format?: string): string;
  destroy(): void;
}

// URL Manager Feature
export declare class URLManager {
  constructor(afs: AFS);
  
  initialize(): void;
  updateURL(): void;
  loadFromURL(): void;
  clearURL(): void;
  getURLParams(): URLSearchParams;
  hasParams(): boolean;
  getParam(param: string): string | null;
  setParam(param: string, value: string): void;
  removeParam(param: string): void;
  serializeState(): string;
  deserializeState(serialized: string): any;
  destroy(): void;
}

// Input Range Filter Feature
export declare class InputRangeFilter {
  constructor(afs: AFS);
  
  addInput(selector: string, key: string): void;
  removeInput(key: string): void;
  getValue(key: string): string | null;
  setValue(key: string, value: string): void;
  getInputs(): Map<string, HTMLInputElement>;
  destroy(): void;
}