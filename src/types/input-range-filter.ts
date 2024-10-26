export interface InputRangeOptions {
    key: string;
    container: HTMLElement;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
}

export interface RangeValues {
    min: number;
    max: number;
}

export interface InputRangeEvent {
    key: string;
    min: number;
    max: number;
}