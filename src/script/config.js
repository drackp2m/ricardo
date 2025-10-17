const googleSheetsId = 'AKfycbwH6fWVRTmfs7-iFi7T-u29h3ypE_PR6LHlo8TtU25bHML3CPhe-MV-L1cNA0j3uZ6T';
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
