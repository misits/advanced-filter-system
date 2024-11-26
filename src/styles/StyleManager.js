/**
 * @fileoverview Style management for AFS
 */

export class StyleManager {
  /**
   * @param {import('../core/Options').Options} options - Options instance
   */
  constructor(options) {
    this.options = options;
    this.styleElement = null;
  }

  /**
   * Create base styles
   * @private
   * @returns {string} CSS styles
   */
  createBaseStyles() {
    const hiddenClass = this.options.get("hiddenClass") || "hidden";
    const itemSelector = this.options.get("itemSelector") || ".afs-filter-item";
    const filterButtonSelector = this.options.get("filterButtonSelector") || ".afs-btn-filter";
    const activeClass = this.options.get("activeClass") || "active";
    const animationDuration = this.options.get("animation.duration") || '300ms';
    const animationEasing = this.options.get("animation.easing") || 'ease-out';
    const filterDropdownSelector = this.options.get("filterDropdownSelector") || ".afs-filter-dropdown";
    
    return `
      .${hiddenClass} {
        display: none !important;
      }

      ${itemSelector} {
        opacity: 1;
        transform: scale(1);
        filter: blur(0);
        transition: opacity ${animationDuration} ${animationEasing},
                    transform ${animationDuration} ${animationEasing},
                    filter ${animationDuration} ${animationEasing};
      }

      ${itemSelector}.${hiddenClass} {
        opacity: 0;
        transform: scale(0.95);
        filter: blur(5px);
      }

      ${filterButtonSelector} {
        opacity: 0.5;
        transition: opacity ${animationDuration} ${animationEasing};
      }

      ${filterButtonSelector}.${activeClass} {
        opacity: 1;
      }

      ${filterDropdownSelector} {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        background-color: #fff;
        cursor: pointer;
      }

    `;
}

 /**
     * Add global transition styles
     * @private
     */
 addTransitionStyles() {
  const style = document.createElement('style');
  style.textContent = `
      .afs-transition {
          transition: opacity 300ms ease-in-out,
                      transform 300ms ease-in-out,
                      filter 300ms ease-in-out !important;
      }
      .afs-hidden {
          opacity: 0;
          pointer-events: none;
      }
  `;
  document.head.appendChild(style);
}

  /**
   * Create range slider styles
   * @private
   * @returns {string} CSS styles
   */
  createRangeStyles() {
    const styles = this.options.get("styles");
    const sliderOptions = this.options.get("slider") || {};
    const sliderStyles = styles.slider;
    const colors = styles.colors;

    const containerClass = sliderOptions.containerClass || "afs-range-slider";
    const trackClass = sliderOptions.trackClass || "afs-range-track";
    const thumbClass = sliderOptions.thumbClass || "afs-range-thumb";
    const valueClass = sliderOptions.valueClass || "afs-range-value";
    const selectedClass = sliderOptions.selectedClass || "afs-range-selected";

    return `
    /* Range Slider Styles */
    .${containerClass} {
      position: relative;
      width: auto;
      height: 40px;
      margin: 10px 0;
      padding: 0 8px;
    }

    .${trackClass} {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      height: 4px;
      background: ${sliderStyles.ui.track.background || colors.background};
      border-radius: ${sliderStyles.ui.track.radius || "0"};
    }

    .${thumbClass} {
      position: absolute;
      top: 50%;
      width: ${sliderStyles.ui.thumb.size || "16px"};
      height: ${sliderStyles.ui.thumb.size || "16px"};
      background: ${sliderStyles.ui.thumb.background || colors.primary};
      border-radius: ${sliderStyles.ui.thumb.radius || "50%"};
      transform: translate(-50%, -50%);
      cursor: pointer;
      z-index: 2;
    }

    .${valueClass} {
      position: absolute;
      top: -20px;
      transform: translateX(-50%);
      font-size: 10px;
      color: ${colors.text};
    }

    .${selectedClass} {
      position: absolute;
      height: 4px;
      background: ${sliderStyles.ui.selected.background || colors.primary};
      top: 50%;
      transform: translateY(-50%);
    }

    /* Histogram Styles */
    .afs-histogram {
      position: absolute;
      bottom: 22px;
      left: 8px;
      right: 8px;
      height: 20px;
      display: flex;
      align-items: flex-end;
      gap: 1px;
      opacity: 0.5;
    }

    .afs-histogram-bar {
      flex: 1;
      background-color: ${sliderStyles.ui.histogram.background ||colors.background};
      min-height: 4px;
      transition: background-color 0.2s ease;
    }

    .afs-histogram-bar.active {
      background-color: ${sliderStyles.ui.histogram.bar.background || colors.primary};
    }
  `;
  }

  /**
   * Create date filter styles
   * @private
   * @returns {string} CSS styles
   */
  createDateStyles() {
    const colors = this.options.get("styles").colors;

    return `
    .afs-date-range-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 10px 0;
    }

    .afs-date-input-wrapper {
      flex: 1;
    }

    .afs-date-input-wrapper label {
      display: block;
      font-size: 0.875rem;
      color: ${colors.text};
      margin-bottom: 0.5rem;
    }

    .afs-date-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid ${colors.background};
      border-radius: 0.25rem;
      font-size: 0.875rem;
      color: ${colors.text};
      transition: border-color 0.2s ease;
    }

    .afs-date-input:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  `;
  }

  /**
   * Create date filter styles
   * @private
   * @returns {string} CSS styles
   */
  createInputRangeStyles() {
    const colors = this.options.get("styles").colors;
    return `
        .afs-input-range-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 10px 0;
        }

        .afs-input-wrapper {
            flex: 1;
        }

        .afs-input-label {
            display: block;
            font-size: 0.875rem;
            color: ${colors.text};
            margin-bottom: 0.5rem;
        }

        .afs-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid ${colors.background};
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: ${colors.text};
            transition: border-color 0.2s ease;
        }

        .afs-input:focus {
            outline: none;
            border-color: ${colors.primary};
        }
    `;
}

  /**
   * Apply all styles
   * @public
   */
  applyStyles() {
    try {
      const styles = `
      
      /* Global transition styles */
      ${this.addTransitionStyles()}

      /* Base styles */
      ${this.createBaseStyles()}

      /* Range slider styles */
      ${this.createRangeStyles()}

      /* Date filter styles */
      ${this.createDateStyles()}

      /* Pagination styles */
      ${this.createPaginationStyles()}

      /* Search styles */
      ${this.createSearchStyles()}

      /* Input range styles */
      ${this.createInputRangeStyles()}
    `;

      if (this.styleElement) {
        this.styleElement.textContent = styles;
      } else {
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = styles;
        document.head.appendChild(this.styleElement);
      }
    } catch (error) {
      console.error("Error applying styles:", error);
      const fallbackStyles = this.createBaseStyles();
      if (this.styleElement) {
        this.styleElement.textContent = fallbackStyles;
      } else {
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = fallbackStyles;
        document.head.appendChild(this.styleElement);
      }
    }
  }

  /**
   * Create pagination styles
   * @private
   * @returns {string} CSS styles
   */
  createPaginationStyles() {
    const styles = this.options.get("styles");
    const paginationOptions = this.options.get("pagination") || {};
    const colors = this.options.get("styles").colors;

    const containerClass = paginationOptions.containerClass || "afs-pagination";
    const buttonClass = paginationOptions.pageButtonClass || "afs-page-button";
    const activeClass = paginationOptions.activePageClass || "afs-page-active";

    const paginationStyles = styles.pagination;

    return `
      .${containerClass} {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
      }

      .${buttonClass} {
        padding: ${paginationStyles.ui.button.padding || '8px 12px'};
        border: ${paginationStyles.ui.button.border || '1px solid ' + colors.primary};
        border-radius: ${paginationStyles.ui.button.borderRadius || '4px'};
        cursor: pointer;
        transition: all 200ms ease-out;
        background: ${paginationStyles.ui.button.background || 'transparent' };
        color: ${paginationStyles.ui.button.color || colors.primary};
      }

      .${buttonClass}:hover {
        background: ${paginationStyles.ui.button.hover.background || colors.primary};
        color: ${paginationStyles.ui.button.hover.color || 'white'};
      }

      .${buttonClass}.${activeClass} {
        background: ${paginationStyles.ui.button.active.background || colors.primary};
        color: ${paginationStyles.ui.button.active.color || 'white'};
      }

      .${buttonClass}:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  /**
   * Create search styles
   * @private
   * @returns {string} CSS styles
   */
  createSearchStyles() {
    const searchClass = this.options.get("searchInputClass") || "afs-search";
    const colors = this.options.get("styles").colors;

    return `
      .${searchClass} {
        padding: 8px;
        border: 1px solid ${colors.background};
        border-radius: 4px;
        width: 100%;
        max-width: 300px;
        transition: border-color 200ms ease-out;
      }

      .${searchClass}:focus {
        outline: none;
        border-color: ${colors.primary};
      }
    `;
  }

  /**
   * Update styles
   * @public
   * @param {Object} newOptions - New style options
   */
  updateStyles(newOptions) {
    this.options = newOptions;
    this.applyStyles();
  }

  /**
   * Remove styles
   * @public
   */
  removeStyles() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}
