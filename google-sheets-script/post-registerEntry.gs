function postRegisterEntry(e) {
  var userUuid = e.parameter.userUuid;
  var date = e.parameter.date;
  var entryTime = e.parameter.entryTime;
  var exitTime = e.parameter.exitTime;

  if (!userUuid || !date || !entryTime || !exitTime) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Missing parameters' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var description = getUserDescriptionByUuid(userUuid);
  
  if (!description) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid userUuid' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var dateObj = new Date(date);

  if (isNaN(dateObj)) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid date format' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var year = dateObj.getFullYear();
  var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  var day = dateObj.getDate();

  try {
    var sheet = ensureUserMonthSheet(year, month, description);
    
    insertInOut(sheet, day, entryTime, exitTime);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}