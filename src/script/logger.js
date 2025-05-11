import { logsEnabled } from './config.js';

/**
 * @typedef {{toString: () => string, _styles: string}} StyledText
 */

export class Logger {
  static #EMOJI = {
    ERROR: '💥',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    REQUEST: '🚀',
    RESPONSE: '📦',
    RESPONSE_OK: '✅',
    RESPONSE_KO: '❌',
    DEBUG: '🐛',
    PERFORMANCE: '⏱️',
    TABLE: '📑',
  };

  static #STYLE = {
    BOLD: 'font-weight: bold;',
    ITALIC: 'font-style: italic;',
    UNDERLINE: 'text-decoration: underline;',
    RED: 'color: #ff0000;',
    YELLOW: 'color: #ffc107;',
    BLUE: 'color: #0066ff;',
    ORANGE: 'color: #ff6600;',
    GREEN: 'color: #00cc00;',
    PURPLE: 'color: #9c27b0;',
    CYAN: 'color: #00bcd4;',
    RESET: 'font-weight: normal; font-style: normal; text-decoration: none; color: inherit;',
  };

  /**
   * @type {Logger}
   */
  static #instance;
  /**
   * @type {import('./config.js').LogSettings}
   */
  static #activeLogTypes = {};
  static #performances = new Map();

  constructor() {
    if (Logger.#instance) {
      return Logger.#instance;
    }

    Logger.#instance = this;

    Logger.#loadConfig();
  }

  /**
   * @returns {Logger}
   */
  static getInstance() {
    if (!this.#instance) {
      this.#instance = new Logger();
    }

    return this.#instance;
  }

  static #loadConfig() {
    this.#activeLogTypes = logsEnabled;
  }

  /**
   * @param {string} message
   * @param {...any} data
   */
  static error(message, ...data) {
    if (this.#activeLogTypes.error !== 'off') {
      const emoji = this.#EMOJI.ERROR;
      const type = this.#style('Error:', this.#STYLE.BOLD, this.#STYLE.RED);
      const text = this.#style(message, this.#STYLE.RESET, this.#STYLE.RED);
      const showTrace = this.#activeLogTypes.error === 'trace';

      this.#showLog([emoji, type, text], showTrace, ...data);
    }
  }

  /**
   * @param {string} message
   * @param  {...any} data
   */
  static warning(message, ...data) {
    if (this.#activeLogTypes.warning !== 'off') {
      const emoji = this.#EMOJI.WARNING;
      const type = this.#style('Warning:', this.#STYLE.BOLD, this.#STYLE.YELLOW);
      const text = this.#style(message, this.#STYLE.RESET, this.#STYLE.YELLOW);
      const showTrace = this.#activeLogTypes.warning === 'trace';

      this.#showLog([emoji, type, text], showTrace, ...data);
    }
  }

  /**
   * @param {string} message
   * @param  {...any} data
   */
  static info(message, ...data) {
    if (this.#activeLogTypes.info !== 'off') {
      const emoji = this.#EMOJI.INFO;
      const type = this.#style('Info:', this.#STYLE.BOLD, this.#STYLE.BLUE);
      const text = this.#style(message, this.#STYLE.RESET, this.#STYLE.BLUE);
      const showTrace = this.#activeLogTypes.info === 'trace';

      this.#showLog([emoji, type, text], showTrace, ...data);
    }
  }

  /**
   * @param {string} message
   * @param  {...any} data
   */
  static debug(message, ...data) {
    if (this.#activeLogTypes.debug !== 'off') {
      const emoji = this.#EMOJI.DEBUG;
      const type = this.#style('Debug:', this.#STYLE.BOLD, this.#STYLE.ORANGE);
      const text = this.#style(message, this.#STYLE.RESET, this.#STYLE.ORANGE);
      const showTrace = this.#activeLogTypes.debug === 'trace';

      this.#showLog([emoji, type, text], showTrace);
    }
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {object} requestParams
   * @param {...any} extraData
   */
  static request(method, url, requestParams, ...extraData) {
    // if (this.#activeLogTypes.request !== 'off') {

    //   const emoji = this.#EMOJI.REQUEST;
    //   const type = this.#style(`Request [${method}]`, this.#STYLE.BOLD, this.#STYLE.ORANGE);
    //   const text = this.#style(url, this.#STYLE.RESET, this.#STYLE.ORANGE);
    //   const showTrace = this.#activeLogTypes.debug === 'trace';

    //   this.#showLog([emoji, type, text], showTrace, );


    //   console.group(`${this.#EMOJI.REQUEST} Request [${method}] ${url}`);
    //   console.log('Body:', data);
    //   if (extraData.length > 0) {
    //     console.log('Additional info:', ...extraData);
    //   }
    //   console.groupEnd();
    // }
  }

  /**
   * @param {string} url
   * @param {number} status
   * @param {object} data
   * @param {...any} extraData
   */
  static response(url, status, data, ...extraData) {
    if (this.#activeLogTypes.response) {
      const emoji =
        status >= 200 && status < 300 ? this.#EMOJI.RESPONSE_OK : this.#EMOJI.RESPONSE_KO;
      console.group(`${this.#EMOJI.RESPONSE} RESPONSE ${emoji}: ${status} ${url}`);
      console.log('Data:', data);
      if (extraData.length > 0) {
        console.log('Additional info:', ...extraData);
      }
      console.groupEnd();
    }
  }

  /**
   * @param {string} label
   * @returns {string|null}
   */
  static startPerformance(label = '') {
    if (!this.#activeLogTypes.performance) {
      return null;
    }

    const id = this.#generateUuid();
    const shortId = id.split('-')[0];

    this.#performances.set(id, {
      label,
      startTime: performance.now(),
    });

    console.log(`${this.#EMOJI.PERFORMANCE} PERFORMANCE START [${shortId}]: ${label}`);

    return id;
  }

  /**
   * @param {string} id
   * @returns {number|null}
   */
  static endPerformance(id) {
    if (!this.#activeLogTypes.performance || !id || !this.#performances.has(id)) {
      return null;
    }

    const { label, startTime } = this.#performances.get(id);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(
      `${this.#EMOJI.PERFORMANCE} PERFORMANCE END [${id}]: ${label} took ${duration.toFixed(2)}ms`
    );

    this.#performances.delete(id);

    return duration;
  }

  /**
   * @param {object} data
   * @param {string} [title]
   */
  static table(data, title = 'Table Data') {
    if (this.#activeLogTypes.table) {
      console.group(`${this.#EMOJI.TABLE} ${title}`);
      console.table(data);
      console.groupEnd();
    }
  }
  /**
   * @param {string} text
   * @param {...string} styles
   * @returns {string|StyledText}
   */
  static #style(text, ...styles) {
    if (styles.length === 0) {
      return text;
    }

    const styleString = styles.join(' ');

    return {
      toString() {
        return `%c${text}`;
      },
      _styles: styleString,
    };
  }

  /**
   * @param {(string|StyledText)[]} message
   * @param {boolean} [showTrace]
   * @param {...{title?: string, value: any[]}} [data]
   */
  static #showLog(message, showTrace = false, ...data) {
    let formattedMessage = [];
    let messageStyles = [];

    message.map((message) => {
      if (typeof message === 'object') {
        formattedMessage.push(message.toString());
        messageStyles.push(message._styles);
      } else {
        formattedMessage.push(message);
      }
    });

    if (data.length === 0) {
      console.log(formattedMessage.join(' '), ...messageStyles);
    }

    if (data.length > 0) {
      console.group(formattedMessage.join(' '), ...messageStyles);
      console.log('Additional info:', ...data);
      console.groupEnd();
    }

    if (showTrace === true) {
      console.trace('Stack trace:');
    }
  }

  static #generateUuid() {
    return crypto.randomUUID();
  }
}

Logger.getInstance();
