function checkMissingParameters(json, trowError = true) {
  const missingParameters = [];

  for (const key in json) {
    if (json[key] === undefined) {
      missingParameters.push(key);
    }
  }

  if (trowError === true && missingParameters.length > 0) {
    throw new Error(`error_missing_parameters.${missingParameters.join(',')}`);
  }

  return missingParameters;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, data })).setMimeType(ContentService.MimeType.JSON);
}

function verifyGoogleToken(token, clientId) {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { success: false, message: "Invalid token format" };
    }

    const payload = JSON.parse(Utilities.newBlob(
      Utilities.base64DecodeWebSafe(parts[1])).getDataAsString());

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { success: false, message: "Token expired" };
    }

    if (payload.aud !== clientId) {
      return { success: false, message: "Client ID don't match" };
    }

    if (payload.iss !== "https://accounts.google.com" &&
      payload.iss !== "accounts.google.com") {
      return { success: false, message: "Invalid emitter" };
    }

    return { success: true, payload: payload };

  } catch (error) {
    return { success: false, message: "Error verifying the token: " + error.toString() };
  }
}

function ensureUserMonthSheet(year, month, description) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = year + '-' + month + '-' + description;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    var templateSheet = ss.getSheetByName('template');

    if (!templateSheet) {
      throw new Error('error_not_found.default_template');
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
    throw new Error('error_not_found.day_row');
  }

  sheet.getRange(dayRow, 3).setValue(inTime);
  sheet.getRange(dayRow, 4).setValue(outTime);
  sheet.getRange(dayRow, 7).setValue(now);
}

function formatTime(cellValue) {
  if (cellValue instanceof Date) {
    var hours = cellValue.getHours().toString().padStart(2, '0');
    var minutes = cellValue.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  return cellValue || "";
}

function sendMailjetEmail(destination, nameAndSurname, code) {
  try {
    checkMissingParameters({ destination, nameAndSurname, code });

    const scriptProperties = PropertiesService.getScriptProperties();
    const MJ_APIKEY_PUBLIC = scriptProperties.getProperty('MJ_APIKEY_PUBLIC');
    const MJ_APIKEY_PRIVATE = scriptProperties.getProperty('MJ_APIKEY_PRIVATE');

    checkMissingParameters({ MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE }, false);

    if (missingSecrets.length !== 0) {
      throw new Error(`error_missing_secrets.${missingParameters.join(',')}`);
    }

    const url = 'https://api.mailjet.com/v3.1/send';

    const payload = {
      Messages: [
        {
          From: {
            Email: "drackiouscolinatesianos@gmail.com",
            Name: "Ricardo"
          },
          To: [
            {
              Email: destination,
              Name: nameAndSurname
            }
          ],
          TemplateID: 6972040,
          TemplateLanguage: true,
          Subject: "Welcome to Ricardo",
          Variables: {
            code,
            nameAndSurname
          }
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        Authorization: 'Basic ' + Utilities.base64Encode(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`)
      }
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());

    if (responseData.Messages?.[0]?.Status !== 'success') {
      console.error('Mailjet API error:', JSON.stringify(responseData));
      throw new Error('error_mailjet_api_response');
    }
  } catch (error) {
    throw new Error('error_mailjet_api_response');
  }
}

function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}