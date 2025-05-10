function getEntriesBetweenDates(request) {
  var userUuid = request.userUuid;
  var from = request.from;
  var to = request.to;

  if (!userUuid || !from || !to) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Missing parameters' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var fromDate = new Date(from);
  var toDate = new Date(to);

  if (isNaN(fromDate) || isNaN(toDate) || fromDate > toDate) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid date range' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var diffDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays > 7) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Range too large (max 7 days)' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var description = getUserDescriptionByUuid(userUuid);
  if (!description) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid userUuid' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var results = [];

  for (var d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    var year = d.getFullYear();
    var month = (d.getMonth() + 1).toString().padStart(2, '0');
    var day = d.getDate();

    var sheetName = year + '-' + month + '-' + description;
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      results.push({
          date: year + '-' + month + '-' + day.toString().padStart(2, '0'),
          entryTime: null,
          in: null,
          out: null,
          break: null,
          total: null,
        });
        continue;
    }

    var data = sheet.getDataRange().getDisplayValues();

    for (var row = 1; row < data.length; row++) {
      if (parseInt(data[row][0], 10) === day) {
        results.push({
          date: year + '-' + month + '-' + day.toString().padStart(2, '0'),
          entryTime: data[row][1] || null,
          in: data[row][2] || null,
          out: data[row][3] || null,
          break: data[row][4] || null,
          total: data[row][5].replace('—', '') || null,
        });
        break;
      }
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, data: results })
  ).setMimeType(ContentService.MimeType.JSON);
}