# Instalar Aventura Kids en Android

La PWA está preparada para instalarse desde Chrome en un teléfono o una tablet Android. No necesitas generar un APK ni publicarla en Google Play.

## Qué incluye

- Iconos de 192 y 512 píxeles y un icono adaptable a las formas de Android.
- Apertura en ventana independiente, con nombre e icono en la pantalla de inicio.
- Botón «Instalar aplicación» cuando Chrome permita la instalación.
- Aviso de actualizaciones: se aplican al pulsar «Actualizar», sin interrumpir automáticamente un ejercicio.
- Pantalla de desconexión y caché de archivos públicos. Las cuentas, planes, pagos y respuestas de la API no se guardan en la caché del service worker.

Esta versión requiere internet para iniciar sesión, verificar la suscripción y guardar el progreso. No incluye sincronización de ejercicios realizados sin conexión.

## Probar en el ordenador

Arranca Laravel en el puerto 8000 con PHP compatible con las dependencias del proyecto (8.4 o superior). Después, desde `Frontend`:

```powershell
npm install
npm run build
npm run preview
```

Abre `http://localhost:4173`. En localhost se permite probar el service worker y la instalación. El proxy de Vite dirige `/api` a Laravel. En `npm run dev` no se registra el service worker, para no cachear el desarrollo.

Para ver la interfaz desde otro dispositivo en la misma red puedes abrir `http://IP-DEL-PC:4173`, con el puerto permitido por el firewall. **Esta dirección HTTP no habilita la instalación PWA en Android.** `localhost` en el celular apunta al celular, no a tu ordenador.

## Publicar cuando tengas alojamiento

Necesitas alojamiento para Laravel, su base de datos y los archivos estáticos del frontend. Un alojamiento que solo sirva archivos estáticos no ejecuta el backend PHP.

Configuración recomendada:

- `https://tu-dominio.com/` sirve el contenido de `Frontend/dist`.
- `https://tu-dominio.com/api/*` llega a Laravel mediante el proxy del servidor web.
- Usa un certificado HTTPS válido; no basta con un certificado que muestre una advertencia en el celular.
- El servidor debe servir `manifest.webmanifest` como `application/manifest+json` y `sw.js` como JavaScript.
- Sirve `sw.js`, `index.html` y `manifest.webmanifest` con `Cache-Control: no-cache`. Los archivos con hash dentro de `assets/` pueden usar caché larga.
- Publica la carpeta `dist` completa, incluyendo `sw.js`, `offline.html`, `icons/` y el manifiesto, en la raíz del dominio.
- No expongas `.env`, `vendor`, la base de datos ni otras carpetas privadas de Laravel. Solo su directorio `public` debe ser accesible al servidor web.

En el frontend utiliza `VITE_API_URL=/api` (valor por defecto). Si el backend tiene otro dominio, establece `VITE_API_URL=https://api.tu-dominio.com/api` **antes** de ejecutar `npm run build`; el backend también debe usar HTTPS.

Configura en el `.env` del backend:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
```

`FRONTEND_URL` permite el origen en CORS y determina el regreso de Stripe. Después de cambiar estas variables, ejecuta `php artisan config:clear`. Configura el webhook de Stripe en `https://tu-dominio.com/api/billing/webhook`, con el secreto correspondiente a ese endpoint. La configuración de Stripe actual es de prueba; la PWA no cambia ese modo.

## Instalar en el celular o tablet

1. Abre la dirección **HTTPS publicada** en Chrome para Android.
2. Pulsa «Instalar aplicación» cuando aparezca. También puedes usar el menú **⋮ → Añadir a pantalla de inicio → Instalar** (el texto puede variar).
3. Abre Aventura Kids desde su icono e inicia sesión.

La app debe funcionar con la misma cuenta y plan. Comprueba también una compra en modo de prueba y su regreso desde Stripe antes de habilitar cobros reales.

## Comprobación y actualizaciones

```powershell
npm run build
npm run test:pwa
```

En Chrome de escritorio, DevTools → Application permite revisar el manifiesto, iconos y service worker. Al simular Offline y recargar debe aparecer la pantalla de desconexión; las peticiones `/api` nunca deben proceder de Cache Storage.

Cada compilación genera una versión de caché basada en el contenido. Publica de nuevo `dist` para actualizar; al volver a la aplicación se comprueban nuevas versiones y se ofrece «Actualizar».

Fuentes: [instalación de PWA en MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) y [ciclo de actualización en web.dev](https://web.dev/learn/pwa/update).
