# Aventura de Aprendizaje — versión React

Conversión completa de la app original (HTML + JS vanilla) a React, conservando el 100% de la lógica y el contenido (30 ejercicios reales de Matemáticas, Inglés y Geografía), el sistema de diseño (`DESIGN.md`) y la experiencia visual.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`).

## Autenticación y backend

El frontend usa `/api` por defecto; Vite lo redirige a `http://127.0.0.1:8000` en desarrollo y preview. En producción sirve Laravel en `/api` bajo el mismo dominio HTTPS o configura `VITE_API_URL` con la URL HTTPS del backend antes de compilar. La interfaz consume estos endpoints:

- `POST /auth/register` con `{ name, email, password }`
- `POST /auth/login` con `{ email, password }`
- Ambos deben responder `{ token, user }` o `{ access_token, user }`.
- Las rutas de progreso reciben el token como `Authorization: Bearer <token>`.

El frontend solo guarda el token y los datos públicos del usuario en `localStorage`; nunca guarda la contraseña. El backend debe validar la contraseña y almacenarla usando un hash seguro, por ejemplo Argon2 o bcrypt.

Para generar la build de producción:

```bash
npm run build
npm run preview
```

## Estructura del proyecto

La aplicación incluye una PWA instalable en Android. Consulta [PWA.md](./PWA.md) para publicarla con HTTPS, instalarla y comprobar las actualizaciones y el modo sin conexión.

```
src/
  data/exercises.js          Banco de 30 ejercicios (datos puros)
  context/AppStateContext.jsx  Estado global con useReducer + persistencia en localStorage
  hooks/useSoundEffects.js   Beeps sintetizados (Web Audio API) + Web Speech API
  hooks/useConfetti.js       Wrapper de canvas-confetti
  components/Header.jsx      Barra superior (logo, nav desktop, edad, racha, estrellas)
  components/BottomNav.jsx   Navegación inferior (solo móvil)
  components/CompletionModal.jsx  Modal de "misión superada"
  pages/Home.jsx             Vista de Inicio
  pages/Subjects.jsx         Vista de Materias
  pages/Progress.jsx         Vista de Mapa de Logros
  pages/Game.jsx             Vista de Juego / ejercicio interactivo
  App.jsx                    Enrutado por vistas (activeView)
  main.jsx                   Punto de entrada
```

## Lógica de React que se usa

- **Context API + `useReducer`** para el estado global (edad, estrellas, ejercicios completados, materia y vista activas) — equivalente al objeto `state` global del original.
- **`useEffect`** para persistir automáticamente el estado en `localStorage` en cada cambio (equivalente a `saveState()`), para reiniciar el estado local del ejercicio al cambiar de pregunta, para limpiar temporizadores (`setTimeout`) al desmontar, y para hacer scroll al cambiar de vista.
- **`useMemo`** para calcular el progreso derivado (porcentajes, ejercicios completados por materia, medallas) sin recalcular en cada render innecesario.
- **`useState`** para el estado efímero de la pantalla de juego: si ya se respondió, feedback mostrado, opciones deshabilitadas por la pista, animación de "shake", y visibilidad del modal de finalización.
- **Custom hooks** (`useSoundEffects`, `useSpeech`, `useConfetti`) que encapsulan Web Audio API, Web Speech API y `canvas-confetti`.
- **Componentes controlados y composición** — cada vista es un componente independiente que consume el contexto con `useAppState()`, sin manipulación directa del DOM (se eliminó todo `document.getElementById`).
- **`useRef`** para guardar referencias a temporizadores (`autoTimer`, animación de shake) sin causar renders.

## Notas

- Se sustituyó Tailwind vía CDN por una instalación real de Tailwind (`tailwind.config.js`) usando exactamente los mismos tokens de color, tipografía y radios definidos en `DESIGN.md`.
- Se usa `canvas-confetti` como dependencia de npm en lugar del script por CDN.
- El ícono del logo se reemplazó por un emoji 🚀 para no depender de una URL externa de imagen; puedes sustituirlo por tu propio archivo en `public/`.
