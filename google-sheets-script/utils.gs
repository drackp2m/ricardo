function getUserDescriptionByUuid(uuid) {
  var usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  var usersData = usersSheet.getDataRange().getValues();

  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][3] == uuid) {
      return usersData[i][2];
    }
  }

  return null;
}

function ensureUserMonthSheet(year, month, description) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = year + '-' + month + '-' + description;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    var templateSheet = ss.getSheetByName('template');

    if (!templateSheet) {
      throw new Error('Template sheet not found');
    }

    sheet = templateSheet.copyTo(ss);
    sheet.setName(sheetName);
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(ss.getNumSheets());
  }

  return sheet;
}

function insertInOut(sheet, day, inTime, outTime) {
  var now = new Date();
  var data = sheet.getDataRange().getValues();
  var dayRow = null;

  for (var i = 1; i < data.length; i++) {
    if (parseInt(data[i][0], 10) === day) {
      dayRow = i + 1;
      break;
    }
  }

  if (!dayRow) {
    throw new Error('Day row not found in sheet');
  }

  sheet.getRange(dayRow, 3).setValue(inTime);
  sheet.getRange(dayRow, 4).setValue(outTime);
  sheet.getRange(dayRow, 7).setValue(now);
}