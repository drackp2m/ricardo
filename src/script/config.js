const googleSheetsId = 'AKfycbxCqE575IibG1rHbn8Rc_HISc2Tgdh4YFjsw6O1ZrhM-eJbs4uvZdxc4jZFIVQe_YKc';
const googleSheetsDevId = 'AKfycbx0OqBrHCykrvLJtJw0McbixH7swSPOoigPhUUKq8E';
/**
 * @typedef {'off'|'on'|'trace'} LogLevel
 * @typedef {Record<string, LogLevel>} LogSettings
 */

export const url = {
  basePathname: '/',
  googleSheets: `https://script.google.com/macros/s/${googleSheetsId}/exec`,
  // googleSheets: `https://script.google.com/macros/s/${googleSheetsDevId}/dev`
};

/**
 * @type {LogSettings}
 */
export const logsEnabled = {
  error: 'trace',
  warning: 'trace',
  info: 'on',
  debug: 'on',
  request: 'on',
  response: 'on',
  performance: 'on',
  table: 'on',
};
