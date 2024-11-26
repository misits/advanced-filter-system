/**
 * @fileoverview Logging system for AFS
 */

export class Logger {
  constructor(debug = false, logLevel = 'info') {
    this.enabled = debug;
    this.level = logLevel;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Immediately log initialization if debug is enabled
    if (this.enabled) {
      console.debug(`[AFS DEBUG] Logger initialized with level: ${logLevel}`);
    }
  }

  /**
   * Internal log method
   * @private
   */
  _log(level, ...args) {
    // Always log errors regardless of debug mode
    if (level === 'error' || this.enabled) {
      const currentLevelValue = this.levels[this.level];
      const messageLevel = this.levels[level];

      if (messageLevel <= currentLevelValue) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[AFS ${level.toUpperCase()}]`;

        // Ensure console methods exist
        const consoleMethod = console[level] || console.log;
        consoleMethod.apply(console, [prefix, timestamp, ...args]);
      }
    }
  }

  /**
   * Log error message
   * @public
   */
  error(...args) {
    // Errors always get logged
    this._log('error', ...args);
  }

  /**
   * Log warning message
   * @public
   */
  warn(...args) {
    this._log('warn', ...args);
  }

  /**
   * Log info message
   * @public
   */
  info(...args) {
    this._log('info', ...args);
  }

  /**
   * Log debug message
   * @public
   */
  debug(...args) {
    this._log('debug', ...args);
  }

  /**
   * Enable or disable debug mode
   * @public
   */
  setDebugMode(enabled, level = 'info') {
    const previousState = this.enabled;
    this.enabled = Boolean(enabled);
    
    if (this.levels.hasOwnProperty(level)) {
      this.level = level;
    }

    // Log state change if either previous or new state is enabled
    if (this.enabled || previousState) {
      this._log('info', 
        `Debug mode ${this.enabled ? 'enabled' : 'disabled'} with level: ${this.level}`
      );
    }
  }

  /**
   * Get current debug state
   * @public
   * @returns {Object} Current logger state
   */
  getState() {
    return {
      enabled: this.enabled,
      level: this.level
    };
  }
}