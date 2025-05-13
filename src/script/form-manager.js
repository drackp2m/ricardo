import { Logger } from './logger.js';

export class FormManager {
  /** @type {HTMLFormElement|null} */
  #formElement = null;
  /** @type {HTMLParagraphElement|null} */
  #feedbackElement = null;
  #activeTriggerElement = null;
  #feedbackTimeout = null;
  #defaultFeedbackDuration = 5000;
  #disabled = false;

  /**
   * @param {string} formId
   * @param {string} [feedbackElementId]
   */
  constructor(formId, feedbackElementId) {
    this.#formElement =
      /** @type {HTMLFormElement|null} */
      (document.getElementById(formId));
    this.#feedbackElement =
      /** @type {HTMLParagraphElement|null} */
      (document.getElementById(feedbackElementId));

    if (this.#formElement === null) {
      throw new Error(`Form with ID "${formId}" not found.`);
    }
  }

  /**
   * @param {function(Event): Promise<void>|void} handler
   */
  onSubmit(handler) {
    this.#formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      
      handler(event);
    });

    return this;
  }

  /**
   * @returns {Object<string, string>}
   */
  getData() {
    if (this.#disabled) {
      Logger.warning('Form is disabled. Cannot get data.');

      return {};
    }

    const formData = new FormData(this.#formElement);

    /** @type {Object} */
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * 
   * @param {Object<string, string>} data 
   * @returns {void}
   */
  setData(data) {
    for (const [key, value] of Object.entries(data)) {
      const element = this.#formElement.elements[key];

      if (element) {
        element.value = value;
      } else {
        Logger.warning(`Element with name "${key}" not found in form.`);
      }
    }
  }

  /**
   * @returns {void}
   */
  reset() {
    this.#formElement.reset();
    this.clearFeedback();
  }

  /**
   * @param {string} [triggerElementId]
   */
  disable(triggerElementId) {
    this.#disabled = true;
    const elements =
      /** @type {NodeListOf<HTMLInputElement>} */
      (this.#formElement.querySelectorAll('input, textarea, select, button'));
    elements.forEach((el) => (el.disabled = true));

    if (triggerElementId) {
      this.#activeTriggerElement = document.getElementById(triggerElementId);

      if (this.#activeTriggerElement) {
        this.#activeTriggerElement.classList.add('loading');
      } else {
        console.warn(`Trigger element with ID "${triggerElementId}" not found.`);
      }
    }
  }

  enable() {
    this.#disabled = false;
    const elements =
      /** @type {NodeListOf<HTMLInputElement>} */
      (this.#formElement.querySelectorAll('input, textarea, select, button'));
    elements.forEach((el) => (el.disabled = false));

    if (this.#activeTriggerElement !== null) {
      this.#activeTriggerElement.classList.remove('loading');
      this.#activeTriggerElement = null;
    }
  }

  /**
   * @param {string} message
   * @param {number} [duration]
   */
  showError(message, duration = this.#defaultFeedbackDuration) {
    this.#showFeedback(message, 'error', duration);
  }

  /**
   * @param {string} message
   * @param {number|null} [duration]
   */
  showSuccess(message, duration = this.#defaultFeedbackDuration) {
    this.#showFeedback(message, 'success', duration);
  }

  clearFeedback() {
    if (this.#feedbackTimeout !== null) {
      clearTimeout(this.#feedbackTimeout);
      this.#feedbackTimeout = null;
    }

    if (this.#feedbackElement !== null) {
      this.#feedbackElement.innerHTML = '&nbsp;';
      this.#feedbackElement.classList.remove('error', 'warning', 'success');
    }
  }

  /**
   * @param {string} message
   * @param {'error'|'warning'|'success'} type
   * @param {number} duration
   */
  #showFeedback(message, type, duration) {
    this.clearFeedback();

    if (this.#feedbackElement !== null) {
      this.#feedbackElement.textContent = message;
      this.#feedbackElement.classList.remove('error', 'warning', 'success');
      this.#feedbackElement.classList.add(type);

      if (duration > 0) {
        this.#feedbackTimeout = setTimeout(() => {
          this.clearFeedback();
        }, duration);
      }
    } else {
      console[type === 'error' ? 'error' : 'info'](`Feedback (${type}): ${message}`);
    }
  }
}
