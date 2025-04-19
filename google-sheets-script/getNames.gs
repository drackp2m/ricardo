function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('users'); // Changed from 'Usuarios' to 'users'
  
  if (!usersSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: No se encontró la hoja "users" en el spreadsheet'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = JSON.parse(e.postData.contents);
  
  // Buscar el usuario por UUID
  const uuidColumn = 4; // UUID está en la columna D
  const nameColumn = 1; // Nombre en columna A
  const surnameColumn = 2; // Apellido en columna B
  const descriptionColumn = 3; // Descripción en columna C
  
  // Verificar que hay datos en la hoja
  if (usersSheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'UUID inválido: No hay usuarios registrados en el sistema'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const userRows = usersSheet.getRange(2, 1, usersSheet.getLastRow()-1, uuidColumn).getValues();
  let userData = null;
  
  // Verificar el UUID proporcionado
  for (let i = 0; i < userRows.length; i++) {
    const storedUuid = String(userRows[i][uuidColumn-1]).trim();
    const inputUuid = String(data.uuid).trim();
    
    // Comparación no sensible a mayúsculas/minúsculas
    if (storedUuid.toLowerCase() === inputUuid.toLowerCase()) {
      userData = {
        name: userRows[i][nameColumn-1],
        surname: userRows[i][surnameColumn-1],
        description: userRows[i][descriptionColumn-1]
      };
      break;
    }
  }
  
  // Si no se encontró el usuario, devolver un error
  if (!userData) {
    Logger.log('UUID inválido: ' + data.uuid);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'UUID inválido: Usuario no encontrado en el sistema'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Buscar o crear una hoja con el nombre del usuario
  let userSheet = ss.getSheetByName(userData.name);
  if (!userSheet) {
    // Crear una nueva hoja para el usuario si no existe
    userSheet = ss.insertSheet(userData.name);
    // Crear encabezados para la hoja del usuario
    userSheet.getRange(1, 1, 1, 3).setValues([['Fecha', 'Hora Entrada', 'Hora Salida']]);
  }
  
  // Encontrar la siguiente fila vacía en la hoja del usuario
  const lastRow = Math.max(1, userSheet.getLastRow());
  const nextRow = lastRow + 1;
  
  // Escribir los datos en la hoja del usuario (no en la hoja "users")
  userSheet.getRange(nextRow, 1, 1, 3).setValues([[
    data.fecha,
    data.entrada,
    data.salida
  ]]);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    name: userData.name,
    surname: userData.surname,
    description: userData.description
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('users');
  
  if (!usersSheet) {
    return jsonResponse({
      success: false,
      error: 'Hoja "users" no encontrada'
    }, e.parameter.callback);
  }

  const uuid = e.parameter.uuid;
  if (!uuid) {
    return jsonResponse({
      success: false,
      error: 'UUID no proporcionado'
    }, e.parameter.callback);
  }

  // Buscar usuario por UUID
  const uuidColumn = 4; // UUID en columna D
  const nameColumn = 1; // Nombre en columna A
  const surnameColumn = 2; // Apellido en columna B
  const descriptionColumn = 3; // Descripción en columna C
  const userRows = usersSheet.getRange(2, 1, usersSheet.getLastRow()-1, uuidColumn).getValues();
  
  for (let i = 0; i < userRows.length; i++) {
    if (String(userRows[i][uuidColumn-1]).trim().toLowerCase() === uuid.toLowerCase()) {
      return jsonResponse({
        success: true,
        name: userRows[i][nameColumn-1],
        surname: userRows[i][surnameColumn-1],
        description: userRows[i][descriptionColumn-1]
      }, e.parameter.callback);
    }
  }

  return jsonResponse({
    success: false,
    error: 'Usuario no encontrado'
  }, e.parameter.callback);
}

function jsonResponse(data, callback) {
  const response = ContentService.createTextOutput();
  if (callback) {
    // JSONP
    response.setContent(callback + '(' + JSON.stringify(data) + ')');
    response.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Normal JSON
    response.setContent(JSON.stringify(data));
    response.setMimeType(ContentService.MimeType.JSON);
  }
  return response;
}
