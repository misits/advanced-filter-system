/**
 * Advanced Filter System (AFS) - TypeScript Definitions
 * @version 1.7.0
 */

// Core Types
export interface AFSEventData {
  [key: string]: any;
}

export type EventCallback = (data?: AFSEventData) => void;

export type FilterMode = 'OR' | 'AND';
export type FilterCategoryMode = 'mixed' | 'OR' | 'AND';
export type SortDirection = 'asc' | 'desc';
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'zoom' | 'bounce' | 'blur' | 'skew' | 'slideInLeft' | 'slideInRight' | 'fadeInUp' | 'fadeInDown' | 'bounceIn';
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD-MM-YYYY' | 'MM-DD-YYYY';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Filter Type Logic Configuration
export interface FilterTypeConfig {
  mode: FilterMode;
  multi: boolean;
}

export type FilterTypeLogic = {
  [filterType: string]: FilterMode | FilterTypeConfig;
};

// Counter Configuration
export interface CounterOptions {
  template?: string;
  showFiltered?: boolean;
  filteredTemplate?: string;
  noResultsTemplate?: string;
  formatter?: (num: number) => string;
}

// Animation Configuration
export interface AnimationOptions {
  type?: AnimationType;
  duration?: number;
  easing?: string;
  inClass?: string;
  outClass?: string;
}

// Pagination Configuration
export interface PaginationOptions {
  enabled?: boolean;
  itemsPerPage?: number;
  container?: string;
  pageButtonClass?: string;
  activePageClass?: string;
  containerClass?: string;
  scrollToTop?: boolean;
  scrollOffset?: number;
  scrollBehavior?: 'smooth' | 'auto';
  showPrevNext?: boolean;
}

// Style Configuration
export interface StyleOptions {
  colors?: {
    primary?: string;
    background?: string;
    text?: string;
    textHover?: string;
  };
  slider?: {
    ui?: {
      showHistogram?: boolean;
      bins?: number;
      track?: {
        radius?: string;
        background?: string;
      };
      selected?: {
        background?: string;
      };
      thumb?: {
        radius?: string;
        size?: string;
        background?: string;
      };
      histogram?: {
        background?: string;
        bar?: {
          background?: string;
        };
      };
    };
  };
  pagination?: {
    ui?: {
      button?: {
        background?: string;
        border?: string;
        borderRadius?: string;
        padding?: string;
        color?: string;
        active?: {
          background?: string;
          color?: string;
        };
        hover?: {
          background?: string;
          color?: string;
        };
      };
    };
  };
}

// Range Slider Configuration
export interface RangeSliderOptions {
  key: string;
  type: 'number' | 'date';
  container: string;
  min?: number;
  max?: number;
  step?: number;
  defaultMin?: number;
  defaultMax?: number;
  ui?: {
    showHistogram?: boolean;
    bins?: number;
    showValues?: boolean;
    showLabels?: boolean;
  };
}

// Date Filter Configuration
export interface DateFilterOptions {
  key: string;
  container: string;
  minDate?: Date;
  maxDate?: Date;
  format?: DateFormat;
  defaultStart?: Date;
  defaultEnd?: Date;
}

// Input Range (min/max number inputs) Configuration
export interface InputRangeOptions {
  key: string;
  container: HTMLElement;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

// Main AFS Options Interface
export interface AFSOptions {
  // Required selectors
  containerSelector: string;
  itemSelector: string;
  
  // Optional selectors
  filterButtonSelector?: string;
  filterDropdownSelector?: string;
  searchInputSelector?: string;
  counterSelector?: string;
  sortButtonSelector?: string;
  
  // CSS Classes
  activeClass?: string;
  hiddenClass?: string;
  activeSortClass?: string;

  // Filter Configuration
  filterMode?: FilterMode;
  groupMode?: FilterMode;
  filterCategoryMode?: FilterCategoryMode;
  filterTypeLogic?: FilterTypeLogic;
  
  // Search Configuration
  searchKeys?: string[];
  debounceTime?: number;
  
  // State Management
  preserveState?: boolean;
  stateExpiry?: number;
  observeDOM?: boolean;
  urlStateKey?: string;
  
  // UI Configuration
  counter?: CounterOptions;
  pagination?: PaginationOptions;
  animation?: AnimationOptions;
  styles?: StyleOptions;
  
  // System Configuration
  responsive?: boolean;
  debug?: boolean;
  logLevel?: LogLevel;
  dateFormat?: DateFormat;
}

// Event Data Interfaces
export interface FiltersAppliedData {
  activeFilters: Set<string>;
  visibleItems: number;
  total: number;
  filterCount: number;
}

export interface SearchData {
  query: string;
  matches: HTMLElement[];
  total: number;
}

export interface SortData {
  key: string;
  direction: SortDirection;
  itemCount: number;
}

export interface PageChangedData {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  visibleItems: number;
}

export interface CounterUpdatedData {
  total: number;
  visible: number;
  filtered: number;
  formattedTotal: string;
  formattedVisible: string;
  formattedFiltered: string;
}

// Sort Criteria
export interface SortCriteria {
  key: string;
  direction: SortDirection;
}

// State Interfaces
export interface AFSState {
  filters?: string[];
  search?: string;
  sort?: SortCriteria;
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
  };
  timestamp?: number;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

// Feature Classes
export declare class EventEmitter {
  /** @returns an unsubscribe function */
  on(event: string, callback: EventCallback): () => void;
  off(event: string, callback?: EventCallback): void;
  emit(event: string, data?: AFSEventData): void;
  /** @returns an unsubscribe function */
  once(event: string, callback: EventCallback): () => void;
  removeAllListeners(event?: string): void;
}

// Central state store (afs.state)
export declare class State {
  /** Live, read-only view. Write via setState() or the mutators. */
  getState(): any;
  setState(path: string, value: any): void;
  /**
   * Subscribe to writes at `path` or any descendant of it
   * (a listener on "items" also hears "items.visible").
   * @returns an unsubscribe function
   */
  subscribe(path: string, callback: (value: any, path: string) => void): () => void;
  setVisibleItems(set: Set<HTMLElement>): void;
  addVisibleItem(item: HTMLElement): void;
  removeVisibleItem(item: HTMLElement): void;
  clearVisibleItems(): void;
  export(): any;
  import(state: any): void;
  reset(): void;
}

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

export declare class RangeFilter {
  constructor(afs: AFS);
  addRangeSlider(options: RangeSliderOptions): void;
  removeRangeSlider(key: string): void;
  getRangeValues(key: string): { min: number; max: number; type: 'number' | 'date' } | null;
  setRangeValues(key: string, min: number, max: number): void;
  destroy(): void;
}

export declare class DateFilter {
  constructor(afs: AFS);
  addDateRange(options: DateFilterOptions): void;
  removeDateRange(key: string): void;
  getDateRange(key: string): { startDate: Date; endDate: Date } | null;
  setDateRange(key: string, startDate: Date, endDate: Date): void;
  destroy(): void;
}

export declare class InputRangeFilter {
  constructor(afs: AFS);
  addInputRange(options: InputRangeOptions): void;
  removeInputRange(key: string): void;
  getRange(key: string): { min: number; max: number } | null;
  setRange(key: string, min: number, max: number): void;
  destroy(): void;
}

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

// Main AFS Class
export declare class AFS extends EventEmitter {
  // Properties
  readonly VERSION: string;
  readonly options: any;
  readonly logger: any;
  readonly state: State;
  readonly styleManager: any;
  readonly container: HTMLElement;
  readonly items: NodeListOf<HTMLElement>;

  // Features
  readonly filter: Filter;
  readonly search: Search;
  readonly sort: Sort;
  readonly pagination: Pagination;
  readonly rangeFilter: RangeFilter;
  readonly dateFilter: DateFilter;
  readonly urlManager: URLManager;
  readonly inputRangeFilter: InputRangeFilter;
  
  constructor(options?: AFSOptions);
  
  // Item Management
  showItem(item: HTMLElement): void;
  hideItem(item: HTMLElement): void;
  addItems(items: HTMLElement | HTMLElement[]): void;
  removeItems(items: HTMLElement | HTMLElement[]): void;
  
  // State Management
  saveState(): void;
  restoreState(): void;
  getState(): AFSState;
  setState(state: AFSState): void;
  
  // Updates
  updateCounter(): void;
  updateOptions(options: Partial<AFSOptions>): void;
  refresh(): void;
  
  // Utilities
  getVersion(): string;
  isFeatureSupported(feature: string): boolean;
  destroy(): void;
}

// Events Map — keys are the exact event names emitted by AFS
export interface AFSEventMap {
  // Core / lifecycle
  initialized: { itemCount: number; options: AFSOptions };
  destroyed: void;
  refreshed: { itemCount: number };
  counterUpdated: CounterUpdatedData;
  resize: void;
  hidden: void;
  visible: void;

  // Filter
  filter: { activeFilters: string[]; visibleItems: number; added: number; removed: number };
  filtersApplied: { activeFilters: string[]; visibleItems: number };
  filtersCleared: void;
  filtersReset: void;
  filterChanged: { type: string; value: string; activeFilters: string[] };
  filterRemoved: { filter: string; activeFilters: string[] };
  filterToggled: { filter: string; activeFilters: string[] };
  filterToggledExclusive: { filter: string; activeFilters: string[] };
  filterCategoryCleared: { category: string; activeFilters: string[] };
  itemsShown: { items: Set<HTMLElement> };
  itemsHidden: { items: Set<HTMLElement> };

  // Search
  search: { query: string; matches: number; total: number };
  searchCleared: void;

  // Sort
  sort: { key: string; order: SortDirection };
  sortMultiple: { criteria: SortCriteria[]; itemCount?: number };
  sortCustom: { key: string };
  sortShuffled: { itemCount?: number };
  sortCleared: void;

  // Pagination
  pagination: { currentPage: number; totalPages: number; itemsPerPage: number; visibleItems: number };
  pageChanged: PageChangedData;
  paginationModeChanged: { enabled: boolean };

  // URL
  urlStateLoaded: { params: Record<string, string> };

  // Range / input-range / date filters
  rangeFilter: { key: string; min: number; max: number };
  inputRangeFilter: { key: string; min: number; max: number };
  dateFilter: { key: string; startDate: Date; endDate: Date };
}

// Global exports
export const VERSION: string;
export default AFS;

// Type guards and utilities
export function isAFSInstance(obj: any): obj is AFS;
export function createAFS(options?: AFSOptions): AFS;

// Plugin system (for future extensions)
export interface AFSPlugin {
  name: string;
  version: string;
  install(afs: AFS): void;
  uninstall?(afs: AFS): void;
}

export declare function registerPlugin(plugin: AFSPlugin): void;
export declare function unregisterPlugin(pluginName: string): void;