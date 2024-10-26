export interface FilterOptions {
    mode: 'AND' | 'OR';
    activeClass: string;
    hiddenClass: string;
}

export interface FilterGroupOptions {
    filters: string[];
    operator: 'AND' | 'OR';
}

export interface FilterEvent {
    filter: string;
    activeFilters: string[];
    visibleItems: number;
    hiddenItems: number;
}