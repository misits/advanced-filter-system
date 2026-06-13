/**
 * Utility Types for Advanced Filter System
 * @fileoverview TypeScript definitions for the helpers exported from src/utils
 */

/** Debounce a function; with immediate=true it fires on the leading edge. */
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void;

/** Throttle a function to at most once per `limit` ms. */
export declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void;

/** Parse a date string (optionally with a format hint). */
export declare function parseDate(dateStr: string, format?: string): Date | null;

/** Read a computed style property from an element. */
export declare function getStyle(element: HTMLElement, property: string): string;

/** Whether an element matches a CSS selector. */
export declare function matches(element: HTMLElement, selector: string): boolean;

/** Deep-clone a plain value/object. */
export declare function deepClone<T>(obj: T): T;

/** Generate a unique id, optionally prefixed. */
export declare function uniqueId(prefix?: string): string;

/** Type guard for plain objects (not arrays, not class instances). */
export declare function isPlainObject(value: any): value is Record<string, any>;
