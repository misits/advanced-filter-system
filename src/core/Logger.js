/**
 * @fileoverview Logging system for AFS
 */

export class Logger {
  /**
   * @param {boolean} [debug=false] - Enable debug mode
   * @param {string} [logLevel='info'] - Logging level
   */
  constructor(debug = false, logLevel = 'info') {
    this.enabled = debug;
    this.level = logLevel;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Internal log method
   * @private
   */
  _log(level, ...args) {
    if (!this.enabled) return;

    const currentLevelValue = this.levels[this.level];
    const messageLevel = this.levels[level];

    if (messageLevel <= currentLevelValue) {
      const timestamp = new Date().toISOString();
      const prefix = `[AFS ${level.toUpperCase()}] ${timestamp}`;

      switch (level) {
        case 'error':
          console.error(prefix, ...args);
          break;
        case 'warn':
          console.warn(prefix, ...args);
          break;
        case 'info':
          console.info(prefix, ...args);
          break;
        case 'debug':
          console.debug(prefix, ...args);
          break;
      }
    }
  }

  /**
   * Log error message
   * @public
   */
  error(...args) {
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
    this.enabled = enabled;
    if (this.levels.hasOwnProperty(level)) {
      this.level = level;
    }
    this._log('info', `Debug mode ${enabled ? 'enabled' : 'disabled'} with level: ${level}`);
  }
}