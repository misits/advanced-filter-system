/**
 * @fileoverview Utility functions for AFS
 */

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} [immediate=false] - Execute immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  
  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
  
  /**
   * Parse date string according to format
   * @param {string} dateStr - Date string to parse
   * @param {string} format - Date format
   * @returns {Date|null} Parsed date object or null if invalid
   */
  export const parseDate = (dateStr, format) => {
    const formats = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'DD-MM-YYYY': /^\d{2}-\d{2}-\d{4}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/
    };
  
    try {
      if (formats[format]?.test(dateStr)) {
        const parts = dateStr.split(/[-\/]/);
        switch (format) {
          case 'YYYY-MM-DD':
            return new Date(parts[0], parts[1] - 1, parts[2]);
          case 'DD-MM-YYYY':
            return new Date(parts[2], parts[1] - 1, parts[0]);
          case 'MM/DD/YYYY':
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  }
  
  /**
   * Get element's computed style value
   * @param {HTMLElement} element - Target element
   * @param {string} property - CSS property
   * @returns {string} Computed style value
   */
  export const getStyle = (element, property) => {
    return window.getComputedStyle(element).getPropertyValue(property);
  }
  
  /**
   * Check if element matches a selector
   * @param {HTMLElement} element - Element to check
   * @param {string} selector - CSS selector
   * @returns {boolean} Whether element matches selector
   */
  export const matches = (element, selector) => {
    return (
      element.matches ||
      element.matchesSelector ||
      element.msMatchesSelector ||
      element.mozMatchesSelector ||
      element.webkitMatchesSelector ||
      element.oMatchesSelector
    ).call(element, selector);
  }
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Set) return new Set([...obj].map(item => deepClone(item)));
    if (obj instanceof Map) return new Map([...obj].map(([k, v]) => [deepClone(k), deepClone(v)]));
    
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
    );
  }
  
  /**
   * Generate unique ID
   * @param {string} [prefix=''] - ID prefix
   * @returns {string} Unique ID
   */
  export const uniqueId = (prefix = '') => {
    return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if value is plain object
   * @param {any} value - Value to check
   * @returns {boolean} Whether value is plain object
   */
  export function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }
