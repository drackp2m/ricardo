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
  const uuidColumn = 3; // Asumiendo que el UUID está en la columna C
  const nameColumn = 1; // Asumiendo que el nombre está en la columna A
  
  // Verificar que hay datos en la hoja
  if (usersSheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'UUID inválido: No hay usuarios registrados en el sistema'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const userRows = usersSheet.getRange(2, 1, usersSheet.getLastRow()-1, uuidColumn).getValues();
  let userName = null;
  
  // Verificar el UUID proporcionado
  for (let i = 0; i < userRows.length; i++) {
    const storedUuid = String(userRows[i][uuidColumn-1]).trim();
    const inputUuid = String(data.uuid).trim();
    
    // Comparación no sensible a mayúsculas/minúsculas
    if (storedUuid.toLowerCase() === inputUuid.toLowerCase()) {
      userName = userRows[i][nameColumn-1]; // Obtener el nombre del usuario
      break;
    }
  }
  
  // Si no se encontró el usuario, devolver un error
  if (!userName) {
    Logger.log('UUID inválido: ' + data.uuid);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'UUID inválido: Usuario no encontrado en el sistema'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Buscar o crear una hoja con el nombre del usuario
  let userSheet = ss.getSheetByName(userName);
  if (!userSheet) {
    // Crear una nueva hoja para el usuario si no existe
    userSheet = ss.insertSheet(userName);
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
    message: 'Datos guardados correctamente'
  })).setMimeType(ContentService.MimeType.JSON);
}
