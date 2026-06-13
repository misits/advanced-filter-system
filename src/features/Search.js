/**
 * @fileoverview Search functionality for AFS
 */

import { debounce } from '../utils';

export class Search {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.searchInput = null;
    this.searchKeys = ['title']; // Default search keys
    this.minSearchLength = 2;
    this.highlightClass = 'afs-highlight';
    this.setupSearch();
  }

  /**
   * Setup search functionality
   * @private
   */
  setupSearch() {
    const searchSelector = this.afs.options.get('searchInputSelector');
    if (!searchSelector) return;

    this.searchInput = document.querySelector(searchSelector);
    if (!this.searchInput) {
      this.afs.logger.warn(`Search input not found: ${searchSelector}`);
      return;
    }

    // Configure search
    this.searchKeys = this.afs.options.get('searchKeys') || this.searchKeys;
    this.minSearchLength = this.afs.options.get('minSearchLength') || this.minSearchLength;

    // Bind events
    this.bindSearchEvents();
    this.afs.logger.debug('Search functionality initialized');
  }

  /**
   * Bind search events
   * @private
   */
  bindSearchEvents() {
    if (!this.searchInput) return;

    // Store handler references on the instance so destroy() can remove the
    // exact same functions (anonymous handlers could never be removed).
    this.debouncedSearch = debounce((e) => {
      this.search(e.target.value);
    }, this.afs.options.get('debounceTime') || 300);

    this.handleClear = (e) => {
      if (!e.target.value) {
        this.clearSearch();
      }
    };

    this.handleEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.search(e.target.value);
      }
    };

    // Bind input event
    this.searchInput.addEventListener('input', this.debouncedSearch);

    // Bind clear event
    this.searchInput.addEventListener('search', this.handleClear);

    // Handle Enter key
    this.searchInput.addEventListener('keypress', this.handleEnter);
  }

  /**
   * Perform search
   * @public
   * @param {string} query - Search query
   */
  search(query) {
    this.afs.logger.debug('Performing search:', query);
    const normalizedQuery = this.normalizeQuery(query);

    // Update state
    this.afs.state.setState('search.query', normalizedQuery);
    let matches = 0;

    // Special case for empty query
    if (!normalizedQuery) {
      this.clearSearch();
      return;
    }

    // Skip if query is too short
    if (normalizedQuery.length < this.minSearchLength) {
      this.afs.logger.debug('Search query too short');
      return;
    }

    try {
      // Create search regex
      const regex = this.createSearchRegex(normalizedQuery);

      // Search through items — show/hide synchronously (the actual animation
      // is driven by CSS transitions, not by these calls).
      this.afs.items.forEach(item => {
        const searchText = this.getItemSearchText(item);
        const matchesSearch = regex.test(searchText);

        if (matchesSearch) {
          this.afs.showItem(item);
          this.highlightMatches(item, regex);
          matches++;
        } else {
          this.afs.hideItem(item);
          this.removeHighlights(item);
        }
      });

      // Run the post-animation cleanup once, after the transition duration,
      // with a single timer (previously one Promise + timer per item).
      const duration =
        parseFloat(this.afs.options.get('animation.duration')) || 300;
      clearTimeout(this.searchCleanupTimer);
      this.searchCleanupTimer = setTimeout(() => {
        if (this.afs.options.get("pagination.enabled")) {
          // Let pagination handle display for matching items
          this.afs.items.forEach(item => {
            const visibleItems = this.afs.state.getState().items.visible;
            if (!visibleItems.has(item)) {
              item.style.display = 'none';
            }
          });
          this.afs.pagination.update();
        } else {
          // Ensure hidden items are properly hidden with display: none
          this.afs.items.forEach(item => {
            const visibleItems = this.afs.state.getState().items.visible;
            if (!visibleItems.has(item)) {
              item.style.display = 'none';
            } else {
              item.style.display = '';
              item.style.opacity = '1';
            }
          });
        }

        // Update URL and emit event
        this.afs.urlManager.updateURL();
        this.afs.emit("search", {
          query: normalizedQuery,
          matches,
          total: this.afs.items.length
        });

        // Update counter
        this.afs.updateCounter();

        this.afs.logger.info(`Search complete. Found ${matches} matches`);
      }, duration);
    } catch (error) {
      this.afs.logger.error('Search error:', error);
    }
  }

  /**
   * Normalize search query
   * @private
   * @param {string} query - Raw search query
   * @returns {string} Normalized query
   */
  normalizeQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Create search regex
   * @private
   * @param {string} query - Normalized search query
   * @returns {RegExp} Search regex
   */
  createSearchRegex(query) {
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Split into words
    const words = escapedQuery.split(' ').filter(Boolean);
    
    // Create regex pattern that matches parts of words
    // Using lookaheads to ensure all words are present somewhere in the string
    const pattern = words
      .map(word => `(?=.*${word})`)
      .join('');
    
    return new RegExp(pattern, 'i');
  }

  /**
   * Get searchable text from item
   * @private
   * @param {HTMLElement} item - DOM element
   * @returns {string} Searchable text
   */
  getItemSearchText(item) {
    return this.searchKeys
      .map(key => item.dataset[key] || '')
      .join(' ')
      .toLowerCase();
  }

  /**
   * Highlight search matches
   * @private
   * @param {HTMLElement} item - DOM element
   * @param {RegExp} regex - Search regex
   */
  highlightMatches(item, regex) {
    if (!this.afs.options.get('highlightMatches')) return;

    this.searchKeys.forEach(key => {
      const target = item.querySelector(`[data-search-key="${key}"]`);
      if (!target) return;

      const text = target.textContent;
      const words = this.afs.state.getState().search.query.split(' ');

      let highlightedText = text;
      words.forEach(word => {
        if (!word) return;
        // Match parts of words using more flexible pattern (no word boundary)
        const wordRegex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedText = highlightedText.replace(
          wordRegex,
          `<span class="${this.highlightClass}">$1</span>`
        );
      });

      target.innerHTML = highlightedText;
    });
  }

  /**
   * Remove highlights
   * @private
   * @param {HTMLElement} item - DOM element
   */
  removeHighlights(item) {
    if (!this.afs.options.get('highlightMatches')) return;

    this.searchKeys.forEach(key => {
      const target = item.querySelector(`[data-search-key="${key}"]`);
      if (!target) return;

      const highlights = target.querySelectorAll(`.${this.highlightClass}`);
      highlights.forEach(highlight => {
        const text = highlight.textContent;
        highlight.replaceWith(text);
      });
    });
  }

  /**
   * Clear search
   * @public
   */
  clearSearch() {
    this.afs.logger.debug('Clearing search');

    // Clear input
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    // Clear state
    this.afs.state.setState('search.query', '');

    // Track animation promises
    const animationPromises = [];

    // Show all items with animation
    this.afs.items.forEach(item => {
      const promise = new Promise(resolve => {
        this.afs.showItem(item);
        this.removeHighlights(item);
        // Resolve after animation duration
        setTimeout(resolve, this.afs.options.get('animation.duration') || 300);
      });
      animationPromises.push(promise);
    });

    // Wait for all animations to complete
    Promise.all(animationPromises).then(() => {
      if (this.afs.options.get("pagination.enabled")) {
        // Let pagination handle display
        this.afs.pagination.update();
      } else {
        // Ensure all items are visible
        this.afs.items.forEach(item => {
          item.style.display = '';
          item.style.opacity = '1';
        });
      }

      // Update URL and emit event
      this.afs.urlManager.updateURL();
      this.afs.emit("searchCleared");

      // Update counter
      this.afs.updateCounter();
    });
  }

  /**
   * Set search value
   * @public
   * @param {string} value - Search value
   */
  setValue(value) {
    if (this.searchInput) {
      this.searchInput.value = value;
    }
    this.search(value);
  }

  /**
   * Get current search value
   * @public
   * @returns {string} Current search value
   */
  getValue() {
    return this.afs.state.getState().search.query;
  }

  /**
   * Update search configuration
   * @public
   * @param {Object} config - Search configuration
   */
  updateConfig({
    searchKeys,
    minSearchLength,
    highlightClass,
    debounceTime
  } = {}) {
    if (searchKeys) this.searchKeys = searchKeys;
    if (minSearchLength) this.minSearchLength = minSearchLength;
    if (highlightClass) this.highlightClass = highlightClass;
    if (debounceTime) {
      this.bindSearchEvents(); // Rebind with new debounce time
    }
  }

  /**
   * Destroy search functionality
   * @public
   */
  destroy() {
    clearTimeout(this.searchCleanupTimer);
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.debouncedSearch);
      this.searchInput.removeEventListener('search', this.handleClear);
      this.searchInput.removeEventListener('keypress', this.handleEnter);
    }
    this.clearSearch();
  }
}