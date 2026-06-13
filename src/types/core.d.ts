/**
 * Core Types for Advanced Filter System
 * @fileoverview TypeScript definitions for core classes
 */

import { AFSOptions, AFSEventData, EventCallback } from './index';

// Options Class
export declare class Options {
  static readonly defaults: AFSOptions;
  readonly options: AFSOptions;
  
  constructor(userOptions?: Partial<AFSOptions>);
  
  get(path: string): any;
  set(path: string, value: any): void;
  update(updates: Partial<AFSOptions>): void;
  reset(): void;
  export(): AFSOptions;
}

// State Class
export declare class State {
  constructor();

  /** Live, read-only view of the state. Write via setState() or the mutators. */
  getState(): any;
  setState(path: string, value: any): void;
  /**
   * Subscribe to writes at `path` or any descendant of it
   * (a listener on "items" also hears "items.visible").
   * @returns an unsubscribe function
   */
  subscribe(path: string, callback: (value: any, path: string) => void): () => void;

  // Encapsulated mutators for the visible-items set (write + notify)
  setVisibleItems(set: Set<HTMLElement>): void;
  addVisibleItem(item: HTMLElement): void;
  removeVisibleItem(item: HTMLElement): void;
  clearVisibleItems(): void;

  export(): any;
  import(state: any): void;
  reset(): void;
}

// Logger Class
export declare class Logger {
  constructor(debug?: boolean, logLevel?: string);
  
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  log(level: string, ...args: any[]): void;
}

// EventEmitter Class
export declare class EventEmitter {
  constructor();
  
  /** @returns an unsubscribe function */
  on(event: string, callback: EventCallback): () => void;
  off(event: string, callback?: EventCallback): void;
  emit(event: string, data?: AFSEventData): void;
  /** @returns an unsubscribe function */
  once(event: string, callback: EventCallback): () => void;
  removeAllListeners(event?: string): void;
}

// StyleManager Class
export declare class StyleManager {
  constructor(options: Options);
  
  applyStyles(): void;
  removeStyles(): void;
  updateStyles(newOptions: Partial<AFSOptions>): void;
  injectCSS(css: string, id?: string): void;
  removeCSS(id: string): void;
}