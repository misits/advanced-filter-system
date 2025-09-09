/**
 * Advanced Filter System (AFS) - TypeScript Definitions
 * @version 1.5.2
 */

// Core Types
export interface AFSEventData {
  [key: string]: any;
}

export type EventCallback = (data?: AFSEventData) => void;

export type FilterMode = 'OR' | 'AND';
export type FilterCategoryMode = 'mixed' | 'OR' | 'AND';
export type SortDirection = 'asc' | 'desc';
export type AnimationType = 'fade' | 'slide' | 'scale' | 'flip' | 'rotate' | 'zoom' | 'bounce' | 'blur' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'fadeIn' | 'fadeOut';
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
  transitionClass?: string;
  
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
  totalItems: number;
}

// Feature Classes
export declare class EventEmitter {
  on(event: string, callback: EventCallback): void;
  off(event: string, callback?: EventCallback): void;
  emit(event: string, data?: AFSEventData): void;
  once(event: string, callback: EventCallback): void;
}

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
  destroy(): void;
}

export declare class Search {
  constructor(afs: AFS);
  search(query: string): void;
  clearSearch(): void;
  setValue(value: string): void;
  getValue(): string;
  getMatches(): HTMLElement[];
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
  destroy(): void;
}

export declare class Pagination {
  constructor(afs: AFS);
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;
  setPaginationMode(enabled: boolean): void;
  getPageInfo(): PageInfo;
  update(): void;
  destroy(): void;
}

export declare class RangeFilter {
  constructor(afs: AFS);
  addRangeSlider(options: RangeSliderOptions): void;
  removeRangeSlider(key: string): void;
  getRangeValue(key: string): { min: number; max: number } | null;
  setRangeValue(key: string, min: number, max: number): void;
  destroy(): void;
}

export declare class DateFilter {
  constructor(afs: AFS);
  addDateRange(options: DateFilterOptions): void;
  removeDateRange(key: string): void;
  getDateRange(key: string): { start: Date; end: Date } | null;
  setDateRange(key: string, start: Date, end: Date): void;
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
}

// Main AFS Class
export declare class AFS extends EventEmitter {
  // Properties
  readonly VERSION: string;
  readonly options: any;
  readonly logger: any;
  readonly state: any;
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
  readonly inputRangeFilter: any;
  
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

// Events Map
export interface AFSEventMap {
  // Core events
  initialized: { itemCount: number; options: AFSOptions };
  destroyed: void;
  refreshed: { itemCount: number };
  counterUpdated: CounterUpdatedData;
  resize: void;
  hidden: void;
  visible: void;
  
  // Filter events
  filtersApplied: FiltersAppliedData;
  filtersCleared: { clearedCount: number };
  filterAdded: { filter: string; activeFilters: Set<string> };
  filterRemoved: { filter: string; activeFilters: Set<string> };
  filterToggled: { filter: string; isActive: boolean };
  
  // Search events
  search: SearchData;
  searchCleared: void;
  
  // Sort events
  sort: SortData;
  sortMultiple: { criteria: SortCriteria[]; itemCount: number };
  sortCustom: { key: string; comparatorName?: string };
  sortShuffled: { itemCount: number };
  sortCleared: { buttonCount: number };
  
  // Pagination events
  pageChanged: PageChangedData;
  paginationToggled: { enabled: boolean };
  
  // URL events
  urlStateLoaded: { params: Record<string, string> };
  
  // Range filter events
  rangeChanged: { key: string; min: number; max: number };
  
  // Date filter events
  dateRangeChanged: { key: string; start: Date; end: Date };
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