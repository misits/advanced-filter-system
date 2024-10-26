import type { SortState } from "./sort";
import type { DateRange } from "./date-filter";

export interface URLState {
    filters: string[];
    ranges: Map<string, Range>;
    dateRanges: Map<string, DateRange>;
    search: string;
    sort: SortState;
    page: number;
}