/**
 * @fileoverview Advanced Filter System - Entry Point
 */

export { AFS } from './AFS';
export { DateFilter } from './features/DateFilter';
export { Filter } from './features/Filter';
export { InputRangeFilter } from './features/InputRangeFilter';
export { Search } from './features/Search';
export { Pagination } from './features/Pagination';
export { RangeFilter } from './features/RangeFilter';
export { Sort } from './features/Sort';
export { URLManager } from './features/URLManager';

// Core exports
export { Logger } from './core/Logger';
export { Options } from './core/Options';
export { State } from './core/State';
export { EventEmitter } from './core/EventEmitter';

// Style exports
export { StyleManager } from './styles/StyleManager';

// Factory function
export const createAFS = (options) => {
  return new AFS(options);
}

// Default export
export default AFS;