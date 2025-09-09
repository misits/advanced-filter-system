/**
 * Utility Types for Advanced Filter System
 * @fileoverview TypeScript definitions for utility functions
 */

// Utility Functions
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void;

export declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void;

export declare function normalizeText(text: string): string;

export declare function getDataAttribute(
  element: HTMLElement,
  key: string
): string | null;

export declare function setDataAttribute(
  element: HTMLElement,
  key: string,
  value: string
): void;

export declare function parseDate(
  dateString: string,
  format?: string
): Date | null;

export declare function formatDate(
  date: Date,
  format?: string
): string;

export declare function parseNumber(
  value: string | number
): number | null;

export declare function escapeRegExp(string: string): string;

export declare function createElementFromHTML(html: string): HTMLElement;

export declare function getElementPosition(element: HTMLElement): {
  top: number;
  left: number;
  width: number;
  height: number;
};

export declare function isElementVisible(element: HTMLElement): boolean;

export declare function scrollToElement(
  element: HTMLElement,
  options?: {
    behavior?: 'smooth' | 'auto';
    offset?: number;
  }
): void;

export declare function deepClone<T>(obj: T): T;

export declare function deepMerge<T extends object>(
  target: T,
  source: Partial<T>
): T;

export declare function generateId(prefix?: string): string;

export declare function removeElement(element: HTMLElement): void;

export declare function addClass(
  element: HTMLElement,
  className: string
): void;

export declare function removeClass(
  element: HTMLElement,
  className: string
): void;

export declare function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): void;

export declare function hasClass(
  element: HTMLElement,
  className: string
): boolean;

// Type Guards
export declare function isString(value: any): value is string;
export declare function isNumber(value: any): value is number;
export declare function isBoolean(value: any): value is boolean;
export declare function isFunction(value: any): value is Function;
export declare function isObject(value: any): value is object;
export declare function isArray(value: any): value is Array<any>;
export declare function isDate(value: any): value is Date;
export declare function isHTMLElement(value: any): value is HTMLElement;
export declare function isNodeList(value: any): value is NodeList;

// Constants
export declare const DEFAULT_DEBOUNCE_TIME: number;
export declare const DEFAULT_ANIMATION_DURATION: number;
export declare const DEFAULT_DATE_FORMAT: string;
export declare const CSS_CLASS_PREFIX: string;

// Error Classes
export declare class AFSError extends Error {
  constructor(message: string, code?: string);
  readonly code?: string;
}

export declare class ValidationError extends AFSError {
  constructor(message: string, field?: string);
  readonly field?: string;
}

export declare class ConfigurationError extends AFSError {
  constructor(message: string, option?: string);
  readonly option?: string;
}