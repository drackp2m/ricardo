import { logsEnabled } from './config.js';

/**
 * @typedef {{toString: () => string, _styles: string}} StyledText
 * @typedef {Object} LogGroup
 * @property {boolean} __isGroup - Marca que identifica al grupo
 * @property {string} title - Título del grupo
 * @property {any[]} data - Datos del grupo
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
    BLACK: 'color:rgb(0, 0, 0);',
    WHITE: 'color:rgb(255, 255, 255);',
    RED: 'color:rgb(234, 82, 82);',
    YELLOW: 'color:rgb(219, 170, 24);',
    BLUE: 'color:rgb(34, 151, 241);',
    ORANGE: 'color:rgb(250, 140, 66);',
    GREEN: 'color:rgb(40, 190, 40);',
    PURPLE: 'color:rgb(227, 100, 250);',
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
      const text = this.#style(message, this.#STYLE.RED);
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
      const text = this.#style(message, this.#STYLE.YELLOW);
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
      const text = this.#style(message, this.#STYLE.BLUE);
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
      const text = this.#style(message, this.#STYLE.ORANGE);
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
    if (this.#activeLogTypes.request !== 'off') {
      const emoji = this.#EMOJI.REQUEST;
      const type = this.#style(`Request [${method}]`, this.#STYLE.BOLD, this.#STYLE.GREEN);
      const text = this.#style(url, this.#STYLE.RESET);
      const showTrace = this.#activeLogTypes.debug === 'trace';
      const requestData = this.#group('Request data:', requestParams);

      this.#showLog([emoji, type, text], showTrace, requestData, ...extraData);
    }
  }

  /**
   * @param {number} status
   * @param {string} url
   * @param {object} response
   * @param {...any} extraData
   */
  static response(status, url, response, ...extraData) {
    if (this.#activeLogTypes.response !== 'off') {
      const statusSuccess = status >= 200 && status < 300;
      const emoji = statusSuccess ? this.#EMOJI.RESPONSE_OK : this.#EMOJI.RESPONSE_KO;
      const responseColor = statusSuccess ? this.#STYLE.GREEN : this.#STYLE.RED;
      const responseWithCode = this.#style(`Response [${status}]`, this.#STYLE.BOLD, responseColor);
      const urlWithReset = this.#style(url, this.#STYLE.RESET);
      const showTrace = this.#activeLogTypes.debug === 'trace';
      const responseData = this.#group('Response data:', response);

      this.#showLog([emoji, responseWithCode, urlWithReset], showTrace, responseData, ...extraData);
    }
  }

  /**
   * @param {string} label
   * @returns {string|null}
   */
  static startPerformance(label = '') {
    if (this.#activeLogTypes.performance === 'off') {
      return null;
    }

    const id = this.#generateUuid();
    const shortId = id.split('-')[0];

    this.#performances.set(id, {
      label,
      startTime: performance.now(),
    });

    const emoji = this.#EMOJI.PERFORMANCE;
    const type = this.#style('Performance start:', this.#STYLE.BOLD, this.#STYLE.PURPLE);
    const text = this.#style(`[${shortId}] ${label}`, this.#STYLE.PURPLE);
    const showTrace = this.#activeLogTypes.debug === 'trace';

    this.#showLog([emoji, type, text], showTrace);

    return id;
  }

  /**
   * @param {string} id
   * @returns {number|null}
   */
  static endPerformance(id) {
    if (this.#activeLogTypes.performance === 'off' || this.#performances.has(id) === false) {
      return null;
    }

    const { label, startTime } = this.#performances.get(id);
    const endTime = performance.now();
    const duration = endTime - startTime;
    const shortId = id.split('-')[0];
    this.#performances.delete(id);

    const emoji = this.#EMOJI.PERFORMANCE;
    const type = this.#style('Performance end:', this.#STYLE.BOLD, this.#STYLE.PURPLE);
    const text = this.#style(`[${shortId}] ${label} took`, this.#STYLE.PURPLE);
    const time = this.#style(`${duration.toFixed(2)}ms`, this.#STYLE.BOLD, this.#STYLE.PURPLE);
    const showTrace = this.#activeLogTypes.debug === 'trace';

    this.#showLog([emoji, type, text, time], showTrace);

    return duration;
  }

  /**
   * @param {string} title
   * @param {object} data
   */
  static table(title, data) {
    if (this.#activeLogTypes.table !== 'off') {
      const emoji = this.#EMOJI.TABLE;
      const type = this.#style(title, this.#STYLE.BOLD, this.#STYLE.CYAN);

      console.group(...this.#getStyledText([emoji, type]));
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
   * @param {string} title
   * @param {...any} data
   * @returns {LogGroup}
   */
  static #group(title, ...data) {
    return {
      __isGroup: true,
      title,
      data,
    };
  }

  /**
   * @param {(string|StyledText)[]} message
   * @param {boolean} [showTrace]
   * @param {...any} [data]
   */
  static #showLog(message, showTrace = false, ...data) {
    console.log(...this.#getStyledText(message));

    let dataIndex = 0;
    while (dataIndex < data.length) {
      const item = data[dataIndex];

      if (item && typeof item === 'object' && item.title) {
        console.group(item.title);
        console.log(...item.data);
        console.groupEnd();

        dataIndex++;
      } else {
        break;
      }
    }

    if (dataIndex < data.length) {
      const remainingData = data.slice(dataIndex);

      if (remainingData.length > 0) {
        console.group('Additional info:');
        console.log(...remainingData);
        console.groupEnd();
      }
    }

    if (showTrace === true) {
      console.group('Stack trace:');
      console.trace();
      console.groupEnd();
    }
  }

  /**
   * @param {(string|StyledText)[]} styledText
   * @returns {string[]}
   */
  static #getStyledText(styledText) {
    let texts = [];
    let styles = [];

    styledText.forEach((part) => {
      if (typeof part === 'object') {
        texts.push(part.toString());
        styles.push(part._styles);
      } else {
        texts.push(part);
      }
    });

    const text = texts.join(' ');

    return [text, ...styles];
  }

  static #generateUuid() {
    return crypto.randomUUID();
  }
}

Logger.getInstance();
