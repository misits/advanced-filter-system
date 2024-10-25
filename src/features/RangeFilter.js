/**
 * @fileoverview Range filter implementation for AFS
 */

import { debounce } from "../utils";
import { StyleManager } from "../styles/StyleManager";

export class RangeFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeRanges = new Map();

    if (!this.afs.styleManager) {
      this.afs.styleManager = new StyleManager(this.afs.options);
    }

    // Apply styles immediately
    this.afs.styleManager.applyStyles();
  }

  /**
   * @typedef {Object} RangeOptions
   * @property {string} key - Data attribute key
   * @property {string} type - Type of range ('number' or 'date')
   * @property {HTMLElement} container - Container element
   * @property {number|string} [min] - Minimum value
   * @property {number|string} [max] - Maximum value
   * @property {number} [step] - Step value
   */

  /**
   * Add range slider
   * @param {RangeOptions} options - Range slider options
   */
  addRangeSlider({ key, type, container, min, max, step = 1, ui }) {
    this.afs.logger.debug(`Adding range slider for ${key}`);

    if (!container) {
      this.afs.logger.error("Container element required for range slider");
      return;
    }

    // Calculate min/max if not provided
    const values = this.calculateMinMax(key, type);
    min = min ?? values.min;
    max = max ?? values.max;

    // Get global UI options and merge with slider-specific options
    const globalUiOptions = this.afs.options.get("styles.slider.ui") || {
      showHistogram: false,
      bins: 10,
    };
    const sliderUiOptions = {
      ...globalUiOptions,
      ...ui, // Override with slider-specific options if provided
    };

    // Only calculate histogram data if enabled
    const histogramData = sliderUiOptions.showHistogram
      ? this.calculateHistogramData(key, sliderUiOptions.bins)
      : { counts: [], binEdges: [], max: 0 };

    // Create slider elements
    const elements = this.createSliderElements(histogramData, sliderUiOptions);
    const state = this.initializeState(min, max, step, type);

    // Store histogram data and UI options in state
    state.ui = sliderUiOptions;
    if (sliderUiOptions.showHistogram) {
      state.histogram = histogramData;
    }

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeRanges.set(key, { state, elements });

    // Initial update
    this.updateSliderUI(key);

    // Setup histogram highlight updates only if enabled
    if (sliderUiOptions.showHistogram) {
      this.setupHistogramHighlight(elements, state, histogramData.binEdges);
    }

    this.afs.logger.info(`Range slider added for ${key}`);
  }
  /**
   * Calculate min and max values from items
   * @private
   */
  calculateMinMax(key, type) {
    const values = Array.from(this.afs.items)
      .map((item) => {
        const value = item.dataset[key];
        return type === "date" ? new Date(value).getTime() : parseFloat(value);
      })
      .filter((value) => !isNaN(value));

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * Create slider DOM elements
   * @private
   * @param {Object} histogramData - Histogram data
   * @param {Object} sliderUiOptions - UI options for this slider
   */
  createSliderElements(histogramData, sliderUiOptions) {
    const styles =
      this.afs.options.get("styles") || this.afs.styleManager.defaultStyles;
    const sliderStyles =
      styles.slider || this.afs.styleManager.defaultStyles.slider;
    const colors = styles.colors || this.afs.styleManager.defaultStyles.colors;

    const container = document.createElement("div");
    container.className = "price-range-container";

    const slider = document.createElement("div");
    slider.className = sliderStyles.class;

    const track = document.createElement("div");
    track.className = sliderStyles.trackClass;

    // Only add histogram if enabled in the slider-specific options
    if (sliderUiOptions?.showHistogram && histogramData?.counts?.length > 0) {
      const histogram = this.createHistogramBars(histogramData, colors);
      slider.appendChild(histogram);
    }

    const selectedRange = document.createElement("div");
    selectedRange.className = sliderStyles.selectedClass;

    const minThumb = document.createElement("div");
    minThumb.className = sliderStyles.thumbClass;

    const maxThumb = document.createElement("div");
    maxThumb.className = sliderStyles.thumbClass;

    const minValue = document.createElement("div");
    minValue.className = sliderStyles.valueClass;

    const maxValue = document.createElement("div");
    maxValue.className = sliderStyles.valueClass;

    // Build the slider
    slider.appendChild(track);
    slider.appendChild(selectedRange);
    slider.appendChild(minThumb);
    slider.appendChild(maxThumb);
    slider.appendChild(minValue);
    slider.appendChild(maxValue);

    container.appendChild(slider);

    return {
      container,
      slider,
      track,
      selectedRange,
      minThumb,
      maxThumb,
      minValue,
      maxValue,
    };
  }

  // Add helper method for creating histogram
  createHistogram(data, colors) {
    const histogram = document.createElement("div");
    histogram.className = "afs-histogram";

    // Create histogram bars
    data.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "afs-histogram-bar";
      bar.style.height = `${value}%`;
      bar.style.backgroundColor = colors.histogram;
      histogram.appendChild(bar);
    });

    return histogram;
  }

  /**
   * Calculate histogram data from items
   * @private
   * @param {string} key - Data attribute key (e.g., 'price')
   * @param {number} [bins=10] - Number of bins for histogram
   * @returns {Object} Histogram data and metadata
   */
  calculateHistogramData(key, bins = 10) {
    try {
      const values = Array.from(this.afs.items)
        .map((item) => parseFloat(item.dataset[key]))
        .filter((value) => !isNaN(value));

      if (values.length === 0) {
        return { counts: [], binEdges: [], max: 0 };
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / bins;

      const counts = new Array(bins).fill(0);
      const binEdges = new Array(bins + 1);

      // Calculate bin edges
      for (let i = 0; i <= bins; i++) {
        binEdges[i] = min + i * binWidth;
      }

      // Count values in each bin
      values.forEach((value) => {
        if (value === max) {
          counts[counts.length - 1]++;
          return;
        }

        const binIndex = Math.floor((value - min) / binWidth);
        counts[binIndex]++;
      });

      // Normalize heights to be more subtle
      const maxCount = Math.max(...counts);
      const normalizedCounts = counts.map(
        (count) => Math.max(20, Math.round((count / maxCount) * 100)), // Minimum height of 20%
      );

      return {
        counts: normalizedCounts,
        binEdges,
        max: maxCount,
        min,
        max,
      };
    } catch (error) {
      this.afs.logger.error("Error calculating histogram:", error);
      return { counts: [], binEdges: [], max: 0 };
    }
  }

  /**
   * Setup histogram highlight on range changes
   * @private
   */
  setupHistogramHighlight(elements, state, binEdges) {
    const bars = elements.slider.querySelectorAll(".afs-histogram-bar");

    const updateHistogram = () => {
      const minVal = state.currentMin;
      const maxVal = state.currentMax;

      bars.forEach((bar, index) => {
        const binStart = binEdges[index];
        const binEnd = binEdges[index + 1];

        // Highlight bars within the selected range
        if (binStart >= minVal && binEnd <= maxVal) {
          bar.classList.add("active");
        } else {
          bar.classList.remove("active");
        }
      });
    };

    // Update histogram on range changes using AFS instance
    this.afs.on("rangeFilter", () => updateHistogram());

    // Initial update
    updateHistogram();
  }

  /**
   * Create histogram bars
   * @private
   */
  createHistogramBars(histogramData, colors) {
    const { counts } = histogramData;
    const histogram = document.createElement("div");
    histogram.className = "afs-histogram";

    counts.forEach((height) => {
      const bar = document.createElement("div");
      bar.className = "afs-histogram-bar";
      bar.style.height = `${height}%`;
      histogram.appendChild(bar);
    });

    return histogram;
  }

  /**
   * Initialize slider state
   * @private
   */
  initializeState(min, max, step, type) {
    return {
      min,
      max,
      currentMin: min,
      currentMax: max,
      step,
      type,
      isDragging: false,
    };
  }

  /**
   * Append elements to container
   * @private
   */
  appendElements(container, elements) {
    const {
      slider,
      track,
      selectedRange,
      minThumb,
      maxThumb,
      minValue,
      maxValue,
    } = elements;

    slider.appendChild(track);
    slider.appendChild(selectedRange);
    slider.appendChild(minThumb);
    slider.appendChild(maxThumb);
    slider.appendChild(minValue);
    slider.appendChild(maxValue);
    container.appendChild(slider);
  }

  /**
   * Setup event handlers for slider
   * @private
   */
  setupEventHandlers(elements, state, key) {
    const { minThumb, maxThumb } = elements;

    const handleStart = (isMin) => (e) => {
      e.preventDefault(); // Prevent scrolling while dragging on mobile
      state.isDragging = true;
      
      // Get the correct event coordinates whether mouse or touch
      const getEventXY = (event) => {
        return event.touches ? event.touches[0] : event;
      };

      const moveHandler = (moveEvent) => {
        const evt = getEventXY(moveEvent);
        this.createMoveHandler(elements, state, key, isMin)(evt);
      };

      const stopHandler = () => {
        state.isDragging = false;
        
        // Remove both mouse and touch event listeners
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', stopHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', stopHandler);
        window.removeEventListener('touchcancel', stopHandler);
        
        this.applyFilter(key);
      };

      // Add both mouse and touch event listeners
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', stopHandler);
      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('touchend', stopHandler);
      window.addEventListener('touchcancel', stopHandler);
    };

    // Add both mouse and touch event listeners to thumbs
    minThumb.addEventListener('mousedown', handleStart(true));
    minThumb.addEventListener('touchstart', handleStart(true), { passive: false });
    maxThumb.addEventListener('mousedown', handleStart(false));
    maxThumb.addEventListener('touchstart', handleStart(false), { passive: false });
  }

  /**
   * Update slider UI
   * @private
   */
  updateSliderUI(key) {
    const { state, elements } = this.activeRanges.get(key);
    const { minThumb, maxThumb, selectedRange, minValue, maxValue } = elements;

    // Calculate positions with padding consideration
    const range = state.max - state.min;
    const minPos = ((state.currentMin - state.min) / range) * 100;
    const maxPos = ((state.currentMax - state.min) / range) * 100;

    // Ensure thumbs stay within bounds
    const clampedMinPos = Math.max(0, Math.min(minPos, 100));
    const clampedMaxPos = Math.max(0, Math.min(maxPos, 100));

    // Position thumbs
    minThumb.style.left = `${clampedMinPos}%`;
    maxThumb.style.left = `${clampedMaxPos}%`;

    // Position selected range
    selectedRange.style.left = `${clampedMinPos}%`;
    selectedRange.style.width = `${clampedMaxPos - clampedMinPos}%`;

    // Format values
    const formatValue =
      state.type === "date"
        ? (value) => new Date(value).toLocaleDateString()
        : (value) => value.toFixed(2);

    // Update value labels
    minValue.textContent = formatValue(state.currentMin);
    maxValue.textContent = formatValue(state.currentMax);

    // Position value labels considering bounds
    minValue.style.left = `${clampedMinPos}%`;
    maxValue.style.left = `${clampedMaxPos}%`;

    // Handle edge cases for value label positioning
    if (clampedMinPos < 5) {
      minValue.style.transform = "translateX(0)";
    } else if (clampedMinPos > 95) {
      minValue.style.transform = "translateX(-100%)";
    } else {
      minValue.style.transform = "translateX(-50%)";
    }

    if (clampedMaxPos < 5) {
      maxValue.style.transform = "translateX(0)";
    } else if (clampedMaxPos > 95) {
      maxValue.style.transform = "translateX(-100%)";
    } else {
      maxValue.style.transform = "translateX(-50%)";
    }
  }

  // Also update the createMoveHandler to respect the padding
  createMoveHandler(elements, state, key, isMin) {
    this.afs.logger.debug(`Creating move handler for ${key}`);

    const { track } = elements;
    const PADDING = 5;

    return debounce((e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = track.getBoundingClientRect();
      const totalWidth = rect.width;
      const paddingPixels = (PADDING / 100) * totalWidth;

      // Calculate percent with padding consideration
      const rawPercent =
        (clientX - rect.left - paddingPixels) /
        (totalWidth - 2 * paddingPixels);
      const percent = Math.min(Math.max(0, rawPercent), 1);

      // Calculate value considering the full range
      const value = state.min + (state.max - state.min) * percent;
      const stepped = Math.round(value / state.step) * state.step;

      if (isMin) {
        state.currentMin = Math.min(stepped, state.currentMax);
      } else {
        state.currentMax = Math.max(stepped, state.currentMin);
      }

      this.updateSliderUI(key);
    }, 16); // ~60fps
  }

  /**
   * Apply range filter
   * @private
   */
  applyFilter(key) {
    this.afs.logger.debug(`Applying range filter for ${key}`);

    const { state } = this.activeRanges.get(key);

    this.afs.items.forEach((item) => {
      const value =
        state.type === "date"
          ? new Date(item.dataset[key]).getTime()
          : parseFloat(item.dataset[key]);

      if (value >= state.currentMin && value <= state.currentMax) {
        this.afs.showItem(item);
      } else {
        this.afs.hideItem(item);
      }
    });

    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit("rangeFilter", {
      key,
      min: state.currentMin,
      max: state.currentMax,
    });
  }

  /**
   * Get current range values
   * @param {string} key - Range key
   * @returns {Object} Current range values
   */
  getRangeValues(key) {
    const range = this.activeRanges.get(key);
    if (!range) return null;

    return {
      min: range.state.currentMin,
      max: range.state.currentMax,
      type: range.state.type,
    };
  }

  /**
   * Set range values
   * @param {string} key - Range key
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  setRangeValues(key, min, max) {
    const range = this.activeRanges.get(key);
    if (!range) return;

    range.state.currentMin = min;
    range.state.currentMax = max;
    this.updateSliderUI(key);
    this.applyFilter(key);
  }

  /**
   * Remove range slider
   * @param {string} key - Range key
   */
  removeRangeSlider(key) {
    const range = this.activeRanges.get(key);
    if (!range) return;

    range.elements.slider.remove();
    this.activeRanges.delete(key);
    this.afs.logger.info(`Range slider removed for ${key}`);
  }
}
