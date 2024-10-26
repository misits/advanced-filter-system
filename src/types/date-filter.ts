export interface DateRangeOptions {
    key: string;
    container: HTMLElement;
    format?: string;
    minDate?: Date;
    maxDate?: Date;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface DateFilterEvent {
    key: string;
    startDate: Date;
    endDate: Date;
}