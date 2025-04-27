export class FormManager {
  #formElement = null;
  #feedbackElement = null;
  #activeTriggerElement = null;
  #feedbackTimeout = null;
  #defaultFeedbackDuration = 5000;

  /**
   * @param {string} formId
   * @param {string} [feedbackElementId]
   */
  constructor(formId, feedbackElementId) {
    this.#formElement = document.getElementById(formId);
    this.#feedbackElement = document.getElementById(feedbackElementId);

    if (this.#formElement === null) {
      throw new Error(`Form with ID "${formId}" not found.`);
    }
  }

  /**
   * @param {string} [triggerElementId]
   */
  disable(triggerElementId) {
    const elements = this.#formElement.querySelectorAll('input, textarea, select, button');
    elements.forEach(el => el.disabled = true);

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
    const elements = this.#formElement.querySelectorAll('input, textarea, select, button');
    elements.forEach(el => el.disabled = false);

    if (this.#activeTriggerElement !== null) {
        this.#activeTriggerElement.classList.remove('loading');
        this.#activeTriggerElement = null;
    }
  }

  /**
   * @param {string} message
   * @param {number} [duration=5000]
   */
  showError(message, duration = this.#defaultFeedbackDuration) {
    this.#showFeedback(message, 'error', duration);
  }

  /**
   * @param {string} message
   * @param {number|null} [duration=null]
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
        this.#feedbackElement.textContent = ' ';
        this.#feedbackElement.classList.remove('error', 'warning', 'success');
    }
  }

  /**
   * @private
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

   /**
   * @returns {Object<string, string>}
   */
  getData() {
    const formData = new FormData(this.#formElement);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  reset() {
    this.#formElement.reset();
    this.clearFeedback();
  }
}