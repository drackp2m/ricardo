# Cómo obtener la URL actualizada de Google Script

Si necesitas actualizar la URL de tu script de Google, sigue estos pasos:

## 1. Abre tu proyecto de Google Apps Script

- Ve a [script.google.com](https://script.google.com)
- Localiza y abre tu proyecto existente

## 2. Vuelve a implementar el script como aplicación web

- Haz clic en el botón "Implementar" en la esquina superior derecha
- Selecciona "Nueva implementación"
- Haz clic en el icono del engranaje (⚙️) y selecciona "Aplicación web"
- Completa la configuración:
  - Descripción: "Control de Horario App v2" (o cualquier descripción útil)
  - Ejecutar como: "Yo" (tu cuenta de Google)
  - Quién tiene acceso: "Cualquier persona" o "Cualquier persona, incluso anónimos"
- Haz clic en "Implementar"

## 3. Copia la nueva URL

- Después de la implementación, se mostrará una ventana con la nueva URL del script
- Copia esta URL para usarla en tu aplicación
- Esta es tu nueva `GOOGLE_SCRIPT_URL`

## 4. Actualiza tu código HTML

Reemplaza la URL antigua en tu archivo index.html:

```javascript
const GOOGLE_SCRIPT_URL = 'tu-nueva-url-aquí';
```

**Importante:** Cada vez que hagas cambios significativos en tu script, deberás volver a implementarlo y obtener una nueva URL.

## Nota sobre versiones anteriores

Puedes gestionar todas tus implementaciones desde la sección "Implementaciones" haciendo clic en "Gestionar implementaciones" en el menú "Implementar".
