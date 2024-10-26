/**
 * @fileoverview Input range filter implementation for AFS
 */

import { debounce } from '../utils';

export class InputRangeFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeRanges = new Map();
  }

  /**
   * @typedef {Object} InputRangeOptions
   * @property {string} key - Data attribute key
   * @property {HTMLElement} container - Container element
   * @property {number} [min] - Minimum value
   * @property {number} [max] - Maximum value
   * @property {number} [step] - Step value
   * @property {string} [label] - Label for the input range
   */

  /**
   * Add input range filter
   * @param {InputRangeOptions} options - Input range options
   */
  addInputRange({ key, container, min, max, step = 1, label = '' }) {
    this.afs.logger.debug(`Adding input range for ${key}`);

    if (!container) {
      this.afs.logger.error('Container element required for input range');
      return;
    }

    // Calculate min/max if not provided
    const values = this.calculateMinMax(key);
    min = min ?? values.min;
    max = max ?? values.max;

    // Create input elements
    const elements = this.createInputElements(label);
    const state = this.initializeState(min, max, step);

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeRanges.set(key, { state, elements });

    // Initial update
    this.updateInputUI(key);

    this.afs.logger.info(`Input range added for ${key}`);
  }

  /**
   * Calculate min and max values from items
   * @private
   */
  calculateMinMax(key) {
    try {
      const values = Array.from(this.afs.items)
        .map(item => {
          if (!item || !item.dataset || !item.dataset[key]) {
            return null;
          }
          const value = parseFloat(item.dataset[key]);
          return isNaN(value) ? null : value;
        })
        .filter(value => value !== null);

      if (values.length === 0) {
        return {
          min: 0,
          max: 100
        };
      }

      return {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    } catch (error) {
      this.afs.logger.error('Error calculating range:', error);
      return {
        min: 0,
        max: 100
      };
    }
  }

  /**
   * Create input elements
   * @private
   */
  /**
 * Create input elements
 * @private
 */
createInputElements(label) {
  const container = document.createElement('div');
  container.className = 'afs-input-range-container';

  if (label) {
      const labelElement = document.createElement('div');
      labelElement.className = 'afs-input-range-label';
      labelElement.textContent = label;
      container.appendChild(labelElement);
  }

  // Min input wrapper
  const minWrapper = document.createElement('div');
  minWrapper.className = 'afs-input-wrapper';
  
  const minLabel = document.createElement('label');
  minLabel.textContent = 'Min';
  minLabel.className = 'afs-input-label';
  
  const minInput = document.createElement('input');
  minInput.type = 'number';
  minInput.className = 'afs-input min';

  minWrapper.appendChild(minLabel);
  minWrapper.appendChild(minInput);

  // Max input wrapper
  const maxWrapper = document.createElement('div');
  maxWrapper.className = 'afs-input-wrapper';
  
  const maxLabel = document.createElement('label');
  maxLabel.textContent = 'Max';
  maxLabel.className = 'afs-input-label';
  
  const maxInput = document.createElement('input');
  maxInput.type = 'number';
  maxInput.className = 'afs-input max';

  maxWrapper.appendChild(maxLabel);
  maxWrapper.appendChild(maxInput);

  container.appendChild(minWrapper);
  container.appendChild(maxWrapper);

  return {
      container,
      minInput,
      maxInput
  };
}

  /**
   * Initialize input range state
   * @private
   */
  initializeState(min, max, step) {
    return {
      min,
      max,
      step,
      currentMin: min,
      currentMax: max
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
    const { minInput, maxInput } = elements;

    const handleInputChange = debounce(() => {
      const minValue = parseFloat(minInput.value);
      const maxValue = parseFloat(maxInput.value);

      if (!isNaN(minValue) && !isNaN(maxValue)) {
        state.currentMin = Math.max(state.min, Math.min(maxValue, minValue));
        state.currentMax = Math.min(state.max, Math.max(minValue, maxValue));
        this.updateInputUI(key);
        this.applyFilter(key);
      }
    }, 300);

    minInput.addEventListener('input', handleInputChange);
    maxInput.addEventListener('input', handleInputChange);
  }

  /**
   * Update input UI
   * @private
   */
  updateInputUI(key) {
    try {
      const { state, elements } = this.activeRanges.get(key);
      const { minInput, maxInput } = elements;

      // Set constraints
      minInput.min = state.min;
      minInput.max = state.max;
      minInput.step = state.step;
      maxInput.min = state.min;
      maxInput.max = state.max;
      maxInput.step = state.step;

      // Set current values
      minInput.value = state.currentMin;
      maxInput.value = state.currentMax;
    } catch (error) {
      this.afs.logger.error('Error updating input UI:', error);
    }
  }

  /**
   * Apply filter
   * @private
   */
  applyFilter(key) {
    this.afs.logger.info(`Applying input filter for ${key}`);
    const { state } = this.activeRanges.get(key);

    this.afs.items.forEach(item => {
      try {
        if (!item || !item.dataset || !item.dataset[key]) {
          this.afs.hideItem(item);
          return;
        }

        const itemValue = parseFloat(item.dataset[key]);
        if (isNaN(itemValue)) {
          this.afs.hideItem(item);
          return;
        }

        if (itemValue >= state.currentMin && itemValue <= state.currentMax) {
          this.afs.showItem(item);
        } else {
          this.afs.hideItem(item);
        }
      } catch (error) {
        this.afs.logger.error('Error filtering item:', error);
        this.afs.hideItem(item);
      }
    });

    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit('inputRangeFilter', {
      key,
      min: state.currentMin,
      max: state.currentMax
    });
  }

  /**
   * Get current range values
   * @param {string} key - Range key
   * @returns {Object} Current range values
   */
  getRange(key) {
    const range = this.activeRanges.get(key);
    if (!range) return null;

    return {
      min: range.state.currentMin,
      max: range.state.currentMax
    };
  }

  /**
   * Set range values
   * @param {string} key - Range key
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  setRange(key, min, max) {
    const range = this.activeRanges.get(key);
    if (!range) return;

    range.state.currentMin = min;
    range.state.currentMax = max;
    this.updateInputUI(key);
    this.applyFilter(key);
  }

  /**
   * Remove input range
   * @param {string} key - Range key
   */
  removeInputRange(key) {
    const range = this.activeRanges.get(key);
    if (!range) return;

    range.elements.container.remove();
    this.activeRanges.delete(key);
    this.afs.logger.info(`Input range removed for ${key}`);
  }
}