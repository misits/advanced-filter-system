export interface PaginationOptions {
    enabled: boolean;
    itemsPerPage: number;
    maxButtons?: number;
    showPrevNext?: boolean;
    showFirstLast?: boolean;
    scrollToTop?: boolean;
    scrollOffset?: number;
    containerClass?: string;
    pageButtonClass?: string;
    activePageClass?: string;
    template?: PaginationTemplate;
}

export interface PaginationTemplate {
    prev?: string;
    next?: string;
    first?: string;
    last?: string;
    ellipsis?: string;
}

export interface PageInfo {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginationEvent {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}