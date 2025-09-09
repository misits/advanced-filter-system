/**
 * Core Types for Advanced Filter System
 * @fileoverview TypeScript definitions for core classes
 */

import { AFSOptions, AFSEventData, EventCallback, FilterMode, FilterCategoryMode } from './index';

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
  
  getState(): any;
  setState(path: string, value: any): void;
  resetState(): void;
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
  
  on(event: string, callback: EventCallback): void;
  off(event: string, callback?: EventCallback): void;
  emit(event: string, data?: AFSEventData): void;
  once(event: string, callback: EventCallback): void;
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