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

  return null;
}

function insertUser(user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("users");

    if (!sheet) {
      throw new Error("error_sheet_not_found.users");
    }

    const row = [
      user.uuid,
      user.name,
      user.surname,
      user.nick,
      user.rol,
      user.email,
      user.password,
      user.google_id,
      user.status,
      user.login_method,
      user.created_at,
      user.updated_at,
      user.last_login
    ];

    sheet.appendRow(row);
  } catch (error) {
    throw new Error(`error_adding_user.${error.toString()}`);
  }
}