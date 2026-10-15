# Política de privacidad de PizzeaMe!!! para Android

La política está en `public/privacidad.html`. `npm run build` la copia a `dist/privacidad.html`. La URL de producción es `https://pizza-calculator-six.vercel.app/privacidad.html` y el pie de la calculadora enlaza a ella.

El documento describe **PizzeaMe!!! para Android y su distribución en Google Play**. Vercel aloja la página y se menciona únicamente por el tratamiento técnico de las visitas a esta página. La política completa se puede leer sin JavaScript y sin iniciar sesión.

## Contacto

El responsable es Ramsés González Alfonso. Por indicación del usuario, se reutiliza el Google Forms ya enlazado desde la política de Wassapeame:

`https://docs.google.com/forms/d/e/1FAIpQLSdUyv3AEEpK-aPAGEfyxl3GTQhALF_A_GSBxB3YgSySNKNk1A/viewform`

El enlace público utiliza los parámetros de precompletado de Google Forms:

- `entry.414633545`: «Privacidad y derechos sobre mis datos».
- `entry.1626952032`: mensaje inicial que identifica «PizzeaMe!!!».

El usuario debe conservar el nombre de la app al escribir. La página explica que se trata de un canal compartido cuyo título sigue siendo «Wassapeame · Contacto y privacidad». No se carga un iframe ni ningún recurso de Google hasta que el visitante abre el formulario. No se publica el correo personal del responsable ni se incluyen direcciones inventadas.

El formulario existente pide motivo, correo para responder y mensaje. El responsable debe atender las consultas y eliminar las consultas resueltas, salvo la información imprescindible que deba conservar legalmente, tal y como indica el propio formulario.

La política de Datos de Usuario de Google Play admite un punto de contacto para privacidad o un mecanismo para enviar consultas; el formulario proporciona ese mecanismo. No sustituye otros datos de identificación o contacto que Play Console pueda exigir por separado para la cuenta del desarrollador.

## Uso en Google Play y AdMob

- Enlazar la URL pública desde la app Android y desde Play Console.
- Contrastar el texto con cada versión de Android distribuida: SDK de anuncios, proveedores de mediación, permisos, funciones, público objetivo y tratamiento de datos reales.
- Completar la declaración de Seguridad de los datos conforme al SDK y su configuración. Los cálculos locales no significan que Google AdMob no trate datos.
- Configurar en Android el consentimiento requerido para AdMob con una CMP certificada. Con UMP, actualizar el estado al iniciar la app, mostrar el formulario cuando proceda, comprobar `canRequestAds()` antes de solicitar anuncios y ofrecer las opciones de privacidad cuando corresponda. Este repositorio web no incorpora el SDK de Android ni implementa ese consentimiento.
- Revisar la clasificación y el tratamiento de datos de menores según el público seleccionado en Google Play.
- Mantener el formulario operativo y revisar la política cuando cambien los proveedores o prácticas de tratamiento.

Workbox excluye `/privacidad.html` del fallback de navegación de la calculadora. La política se incluye en la caché de la PWA, pero no se reescribe como si fuera una pantalla de la calculadora.

## Fuentes oficiales

- [Política de Datos de Usuario de Google Play](https://support.google.com/googleplay/android-developer/answer/10144311?hl=es).
- [Datos tratados por Google Mobile Ads](https://developers.google.com/admob/android/privacy/play-data-disclosure?hl=es).
- [Consentimiento con UMP para Android](https://developers.google.com/admob/android/privacy?hl=es).
- [Gestión del consentimiento en AdMob](https://support.google.com/admob/answer/7666519?hl=es).
