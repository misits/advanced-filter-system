/**
 * @fileoverview Date filter implementation for AFS
 */

import { debounce } from '../utils';

export class DateFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeDateRanges = new Map();
    this.defaultFormat = this.afs.options.get('dateFormat') || 'YYYY-MM-DD';
  }

  /**
   * @typedef {Object} DateRangeOptions
   * @property {string} key - Data attribute key
   * @property {HTMLElement} container - Container element
   * @property {Date} [minDate] - Minimum date
   * @property {Date} [maxDate] - Maximum date
   * @property {string} [format] - Date format (default: YYYY-MM-DD)
   */

  /**
   * Add date range filter
   * @param {DateRangeOptions} options - Date range options
   */
  addDateRange({ key, container, minDate, maxDate, format = this.defaultFormat }) {
    this.afs.logger.debug(`Adding date range for ${key}`);

    if (!container) {
      this.afs.logger.error('Container element required for date range');
      return;
    }

    // Calculate min/max dates if not provided
    const dates = this.calculateMinMaxDates(key);
    minDate = minDate ?? dates.min;
    maxDate = maxDate ?? dates.max;

    // Create date picker elements
    const elements = this.createDateElements();
    const state = this.initializeState(minDate, maxDate, format);

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeDateRanges.set(key, { state, elements });

    // Initial update
    this.updateDateUI(key);

    this.afs.logger.info(`Date range added for ${key}`);
  }

  /**
   * Calculate min and max dates from items
   * @private
   */
  calculateMinMaxDates(key) {
    try {
      const validDates = Array.from(this.afs.items)
        .map(item => {
          if (!item || !item.dataset || !item.dataset[key]) {
            return null;
          }
          const date = new Date(item.dataset[key]);
          return isNaN(date.getTime()) ? null : date;
        })
        .filter(date => date !== null);
  
      if (validDates.length === 0) {
        // Return default date range if no valid dates found
        const today = new Date();
        return {
          min: new Date(today.getFullYear(), 0, 1), // January 1st of current year
          max: new Date(today.getFullYear(), 11, 31) // December 31st of current year
        };
      }
  
      return {
        min: new Date(Math.min(...validDates)),
        max: new Date(Math.max(...validDates))
      };
    } catch (error) {
      this.afs.logger.error('Error calculating date range:', error);
      // Return default date range on error
      const today = new Date();
      return {
        min: new Date(today.getFullYear(), 0, 1),
        max: new Date(today.getFullYear(), 11, 31)
      };
    }
  }

  /**
   * Create date picker elements
   * @private
   */
  createDateElements() {
    this.afs.logger.debug('Creating date picker elements');

    const container = document.createElement('div');
    container.className = 'afs-date-range-container';

    const startContainer = document.createElement('div');
    startContainer.className = 'afs-date-input-wrapper';
    
    const startLabel = document.createElement('label');
    startLabel.textContent = 'Start Date';
    
    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'afs-date-input start-date';

    const endContainer = document.createElement('div');
    endContainer.className = 'afs-date-input-wrapper';
    
    const endLabel = document.createElement('label');
    endLabel.textContent = 'End Date';
    
    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'afs-date-input end-date';

    startContainer.appendChild(startLabel);
    startContainer.appendChild(startInput);
    endContainer.appendChild(endLabel);
    endContainer.appendChild(endInput);

    container.appendChild(startContainer);
    container.appendChild(endContainer);

    return {
      container,
      startInput,
      endInput
    };
  }

  /**
   * Initialize date filter state
   * @private
   */
  initializeState(minDate, maxDate, format) {
    return {
      minDate,
      maxDate,
      currentStartDate: minDate,
      currentEndDate: maxDate,
      format
    };
  }

  /**
   * Append elements to container
   * @private
   */
  appendElements(container, elements) {
    container.appendChild(elements.container);
  }

  /**
   * Setup event handlers
   * @private
   */
  setupEventHandlers(elements, state, key) {
    this.afs.logger.debug(`Setting up event handlers for date range ${key}`);

    const { startInput, endInput } = elements;

    const handleDateChange = debounce(() => {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        state.currentStartDate = startDate;
        state.currentEndDate = endDate;
        this.applyDateFilter(key);
      }
    }, 300);

    startInput.addEventListener('change', handleDateChange);
    endInput.addEventListener('change', handleDateChange);
  }

  /**
   * Update date picker UI
   * @private
   */
  updateDateUI(key) {
    try {
      const { state, elements } = this.activeDateRanges.get(key);
      const { startInput, endInput } = elements;
  
      // Format dates for input
      const formatDate = date => {
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) {
            throw new Error('Invalid date');
          }
          return d.toISOString().split('T')[0];
        } catch (error) {
          this.afs.logger.error('Error formatting date:', error);
          return '';
        }
      };
  
      // Set min/max constraints
      startInput.min = formatDate(state.minDate);
      startInput.max = formatDate(state.maxDate);
      endInput.min = formatDate(state.minDate);
      endInput.max = formatDate(state.maxDate);
  
      // Set current values
      startInput.value = formatDate(state.currentStartDate);
      endInput.value = formatDate(state.currentEndDate);
    } catch (error) {
      this.afs.logger.error('Error updating date UI:', error);
    }
  }

  /**
   * Apply date filter
   * @private
   */
  applyDateFilter(key) {
    this.afs.logger.info(`Applying date filter for ${key}`);
    const { state } = this.activeDateRanges.get(key);
  
    this.afs.items.forEach(item => {
      try {
        // Check if item and dataset exist
        if (!item || !item.dataset || !item.dataset[key]) {
          this.afs.hideItem(item);
          return;
        }
  
        const itemDate = new Date(item.dataset[key]);
        
        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          this.afs.hideItem(item);
          return;
        }
  
        // Set time to midnight for consistent comparison
        const startDate = new Date(state.currentStartDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(state.currentEndDate);
        endDate.setHours(23, 59, 59, 999);
        
        const compareDate = new Date(itemDate);
        compareDate.setHours(0, 0, 0, 0);
  
        if (compareDate >= startDate && compareDate <= endDate) {
          this.afs.showItem(item);
        } else {
          this.afs.hideItem(item);
        }
      } catch (error) {
        this.afs.logger.error('Error filtering item by date:', error);
        this.afs.hideItem(item);
      }
    });
  
    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit('dateFilter', {
      key,
      startDate: state.currentStartDate,
      endDate: state.currentEndDate
    });
  }

  /**
   * Get current date range
   * @param {string} key - Date range key
   * @returns {Object} Current date range
   */
  getDateRange(key) {
    const range = this.activeDateRanges.get(key);
    if (!range) return null;

    return {
      startDate: range.state.currentStartDate,
      endDate: range.state.currentEndDate
    };
  }

  /**
   * Set date range
   * @param {string} key - Date range key
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  setDateRange(key, startDate, endDate) {
    const range = this.activeDateRanges.get(key);
    if (!range) return;

    range.state.currentStartDate = startDate;
    range.state.currentEndDate = endDate;
    this.updateDateUI(key);
    this.applyDateFilter(key);
  }

  /**
   * Remove date range
   * @param {string} key - Date range key
   */
  removeDateRange(key) {
    const range = this.activeDateRanges.get(key);
    if (!range) return;

    range.elements.container.remove();
    this.activeDateRanges.delete(key);
    this.afs.logger.info(`Date range removed for ${key}`);
  }
}