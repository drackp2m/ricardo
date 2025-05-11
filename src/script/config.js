const googleSheetsId = 'AKfycbz2cY1rDUMCZMzVlTlEnAPBkB9-uaUsafYAnq8m5hp5UmsRJzlgvMu8RcoRWhN9dze5';

/**
 * @typedef {'off'|'on'|'trace'} LogLevel
 * @typedef {Record<string, LogLevel>} LogSettings
 */

export const url = {
  basePathname: '/',
  googleSheets: `https://script.google.com/macros/s/${googleSheetsId}/exec`,
  // googleSheets: `https://script.google.com/macros/s/${googleSheetsId}/dev`
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
