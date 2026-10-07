# Publicar la política de PizzeaMe!!!

La página está en `public/privacidad.html` y se copia a `dist/privacidad.html` durante `npm run build`. Su ruta pública es `/privacidad.html`, enlazada desde el pie de la calculadora. El HTML contiene todo el texto y no requiere JavaScript ni recursos de terceros. El archivo se sirve directamente, sin depender de reescrituras del alojamiento.

Estado actual: nombre de la app y responsable confirmados por el usuario. El correo se deja pendiente por su indicación y la versión Android todavía está en desarrollo. Se conserva el aviso de borrador; no se incluye una dirección inventada.

Antes de usarla en Google Play:

- Completar el nombre del responsable y un correo de contacto válido. Se puede usar un correo dedicado a la app, sin publicar el correo personal.
- Revisar el texto con la versión Android real: SDK de anuncios, proveedores de mediación si existen, datos tratados, conservación, público objetivo y otras funciones que puedan recoger datos.
- Implementar en Android el consentimiento requerido para AdMob mediante una CMP certificada. Con UMP, actualizar la información al iniciar la app, mostrar el formulario cuando proceda, comprobar `canRequestAds()` antes de solicitar anuncios y ofrecer acceso a las opciones de privacidad cuando se requiera. La página web no implementa ese consentimiento.
- Quitar el aviso de borrador y el `noindex` cuando se hayan completado y comprobado esos datos. Actualizar la fecha al publicar la política definitiva.
- Publicar los cambios en Vercel y verificar que la URL devuelve la página completa por HTTPS sin login, restricciones geográficas ni JavaScript. En esta web, la URL prevista es `https://pizza-calculator-six.vercel.app/privacidad.html`.
- Enlazar esa URL desde la app Android y en Play Console. Completar la declaración de Seguridad de los datos de acuerdo con la versión del SDK y su configuración; el procesamiento local de recetas no permite declarar que AdMob no trata datos.

Workbox excluye la ruta de privacidad del fallback de navegación de la calculadora para conservar el documento al abrirlo como una página independiente. La página también puede formar parte de la caché de la PWA.

Fuentes oficiales consultadas:

- [Política de Datos de Usuario de Google Play](https://support.google.com/googleplay/android-developer/answer/10144311?hl=es).
- [Información de datos de Google Mobile Ads](https://developers.google.com/admob/android/privacy/play-data-disclosure?hl=es).
- [Consentimiento con UMP para Android](https://developers.google.com/admob/android/privacy?hl=es).
- [Gestión del consentimiento en AdMob](https://support.google.com/admob/answer/7666519?hl=es).

Un alojamiento independiente en GitHub Pages también permite publicar este HTML. Mantenerlo en la web de Vercel evita gestionar otro sitio y mantiene una URL estable mientras se conserve el dominio.
