# APK de Aventura Kids

Este proyecto incluye un contenedor Android de Capacitor 8. La APK lleva la interfaz React dentro del dispositivo y consulta la API Laravel por HTTPS. No es el mismo formato que la PWA y no necesita instalarse desde Chrome.

## Estado

- Proyecto Android: `android/`.
- Identificador: `com.aventurakids.app`.
- Nombre: Aventura Kids.
- Android mínimo: 7.0 (API 24).
- Necesita internet para entrar, guardar progreso y validar planes.
- La generación del proyecto no implica que ya exista un APK compilado; el archivo se obtiene con uno de los métodos siguientes.

## Compilar en Windows

Necesitas Node 22+, JDK 21, Android Studio compatible con Capacitor 8 y Android SDK 36. Instala los componentes que indique Android Studio al abrir `android/` y revisa/acepta sus licencias.

1. Copia `.env.android.example` a `.env.android.local` y confirma la URL HTTPS del backend con `/api` al final. La URL de ejemplo procede de `vercel.json`; no contiene secretos.
2. Desde `Frontend` ejecuta `npm ci`, `npm run android:sync` y `npm run android:open`.
3. En Android Studio espera a que termine Gradle y genera una APK de debug desde el menú de compilación.

Con Java y el SDK configurados también puedes ejecutar `npm run android:apk` en Windows. El archivo queda en:

`android/app/build/outputs/apk/debug/app-debug.apk`

Es una APK firmada con una clave de desarrollo para instalar y demostrar el proyecto. Para distribución permanente hay que generar una clave de firma propia y conservarla; no la subas a GitHub.

## Compilar en GitHub

Se incluye el workflow `.github/workflows/android-apk.yml` en la raíz del repositorio. Tras subir los cambios:

1. En GitHub abre Actions → Android APK → Run workflow.
2. Introduce la URL HTTPS del backend terminada en `/api`.
3. Espera a que termine y descarga el artefacto `aventura-kids-apk`.
4. Descomprime el ZIP y copia `app-debug.apk` al teléfono o tablet.

El workflow no publica una release ni cambia Render/Vercel. El artefacto dura 14 días y requiere acceso al repositorio. Las compilaciones de debug en distintos runners pueden usar claves distintas; para actualizar de forma estable usa una firma propia. Desinstalar una versión anterior borra sus datos locales.

## Instalar

Abre el APK desde Archivos en Android. Si Android lo solicita, permite instalar aplicaciones desde esa fuente. Inicia sesión con una cuenta del backend publicado; no se copian las cuentas ni la sesión del navegador.

## Stripe

La APK abre Stripe en una pestaña del navegador. El backend debe tener desplegados los cambios de retorno Android:

- Checkout recibe `client: android` y devuelve a `/api/billing/android-return`.
- Esa página ofrece «Volver a Aventura Kids», que abre `aventurakids://billing/return`.
- La app envía la sesión a `/api/billing/confirm`. El enlace no activa por sí mismo ningún plan.

Configura `APP_URL` del backend con su URL HTTPS pública y conserva las variables Stripe y el webhook. La web sigue usando `FRONTEND_URL` para sus propias compras. Prueba el ciclo completo con Stripe en modo de prueba en un dispositivo antes de distribuir.

La APK utiliza CapacitorHttp para las llamadas desde Android y no registra el service worker de la PWA. No incluye claves de Stripe ni credenciales de la base de datos.

Referencias: https://capacitorjs.com/docs/android y https://capacitorjs.com/docs/apis/app
