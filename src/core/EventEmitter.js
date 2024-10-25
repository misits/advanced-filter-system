/**
 * @fileoverview Event handling system for AFS
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback) {
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      callback.apply(this, args);
    };

    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, new Map());
    }

    this.onceEvents.get(eventName).set(callback, onceWrapper);
    return this.on(eventName, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   */
  off(eventName, callback) {
    // Remove from regular events
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(callback);

      // Cleanup if no more listeners
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName);
      }
    }

    // Remove from once events
    if (this.onceEvents.has(eventName)) {
      const onceWrapper = this.onceEvents.get(eventName).get(callback);
      if (onceWrapper) {
        this.events.get(eventName)?.delete(onceWrapper);
        this.onceEvents.get(eventName).delete(callback);
      }

      // Cleanup if no more once listeners
      if (this.onceEvents.get(eventName).size === 0) {
        this.onceEvents.delete(eventName);
      }
    }
  }

  /**
   * Emit an event
   * @param {string} eventName - Name of the event
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => {
        try {
          callback.apply(this, args);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   * @param {string} [eventName] - Optional event name to clear specific event
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
      this.onceEvents.delete(eventName);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    return (this.events.get(eventName)?.size || 0) + 
           (this.onceEvents.get(eventName)?.size || 0);
  }
}