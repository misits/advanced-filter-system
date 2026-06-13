/**
 * Feature Types for Advanced Filter System
 * @fileoverview TypeScript definitions for feature classes
 *
 * NOTE: the published entry point is `index.d.ts`, which declares its own
 * copies of these classes. This file mirrors them for direct imports and must
 * be kept in sync with the actual public API.
 */

import {
  SortDirection,
  SortCriteria,
  FilterMode,
  FilterTypeConfig,
  RangeSliderOptions,
  DateFilterOptions,
  InputRangeOptions,
  PageInfo,
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
  resetFilters(): void;
  getActiveFilters(): Set<string>;
  setFilterMode(mode: FilterMode): void;
  setGroupMode(mode: FilterMode): void;
  setFilterTypeLogic(type: string, logic: FilterMode | FilterTypeConfig): void;
  setFilterTypeExclusive(types: string | string[], exclusive?: boolean): void;
  addFilterGroup(id: string, filters: string[], operator?: FilterMode): void;
  removeFilterGroup(id: string): void;
  getFilterGroups(): Map<string, any>;
  addFilterButton(button: HTMLElement, filter: string): void;
  removeFilterButton(button: HTMLElement): void;
  applyFilters(): void;
  refresh(): void;
  destroy(): void;
}

// Search Feature
export declare class Search {
  constructor(afs: AFS);

  search(query: string): void;
  clearSearch(): void;
  setValue(value: string): void;
  getValue(): string;
  updateConfig(config: {
    searchKeys?: string[];
    minSearchLength?: number;
    highlightClass?: string;
    debounceTime?: number;
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
  addSortButton(button: HTMLElement, key: string, direction?: SortDirection): void;
  removeSortButton(button: HTMLElement): void;
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
  destroy(): void;
}

// Range Filter Feature
export declare class RangeFilter {
  constructor(afs: AFS);

  addRangeSlider(options: RangeSliderOptions): void;
  removeRangeSlider(key: string): void;
  getRangeValues(key: string): { min: number; max: number; type: 'number' | 'date' } | null;
  setRangeValues(key: string, min: number, max: number): void;
  destroy(): void;
}

// Date Filter Feature
export declare class DateFilter {
  constructor(afs: AFS);

  addDateRange(options: DateFilterOptions): void;
  removeDateRange(key: string): void;
  getDateRange(key: string): { startDate: Date; endDate: Date } | null;
  setDateRange(key: string, startDate: Date, endDate: Date): void;
  destroy(): void;
}

// Input Range Filter Feature
export declare class InputRangeFilter {
  constructor(afs: AFS);

  addInputRange(options: InputRangeOptions): void;
  removeInputRange(key: string): void;
  getRange(key: string): { min: number; max: number } | null;
  setRange(key: string, min: number, max: number): void;
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
  destroy(): void;
}
