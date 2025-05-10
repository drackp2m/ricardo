function findUserBy(field, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("users");

  if (!sheet) {
    throw new Error("error_sheet_not_found.users");
  }

  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];

  const searchIndex = headerRow.indexOf(field);

  if (searchIndex === -1) {
    throw new Error(`error_column_not_found.${field}`);
  }

  const searchValue = field === "email" ? value.toLowerCase() : value;

  for (let i = 1; i < data.length; i++) {
    const cellValue = String(data[i][searchIndex] || "");
    const compareValue = field === "email" ? cellValue.toLowerCase() : cellValue;

    if (compareValue === searchValue) {
      const user = {};

      for (let j = 0; j < headerRow.length; j++) {
        user[headerRow[j]] = data[i][j];
      }

      return user;
    }
  }

  throw new Error('error_not_found.user');
}

function insertUser(user) {
  const alreadyUser = findUserBy('uuid', user.uuid);

  if (alreadyUser !== null) {
    throw new Error(`error_adding_user.already_exists`);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("users");

  if (!sheet) {
    throw new Error("error_sheet_not_found.users");
  }

  const row = Object.values(user);

  sheet.appendRow(row);
}

function updateUser(uuid, fieldsToUpdate) {
  checkMissingParameters({ uuid, fieldsToUpdate })

  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('error_no_fields_to_update');
  }

  const user = findUserBy('uuid', uuid);

  if (!fieldsToUpdate.updated_at) {
    fieldsToUpdate.updated_at = new Date().toISOString();
  }

  const updatedUser = { ...user, ...fieldsToUpdate };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("users");

  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];
  const uuidIndex = headerRow.indexOf("uuid");

  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][uuidIndex] === uuid) {
      rowIndex = i + 1;  // +1 porque getRange usa 1-based indices
      break;
    }
  }

  const rowData = headerRow.map(column => updatedUser[column]);

  sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);

  return updatedUser;
}

function filterUserSensibleData(user) {
  delete user.google_id;
  delete user.last_login;
  delete user.login_method;
  delete user.nick;
  delete user.password;
  delete user.status;

  return user;
}