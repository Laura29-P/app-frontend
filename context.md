# Contexto del proyecto: Aventura de Aprendizaje

## 1. Descripción general

Este proyecto es una aplicación web educativa desarrollada en React con Vite, orientada a niños y niñas para aprender conceptos básicos de Matemáticas, Inglés y Geografía mediante ejercicios interactivos, progresos, misiones diarias y una experiencia visual amigable.

La app combina:
- aprendizaje por materia,
- ejercicios con opción múltiple,
- feedback inmediato,
- progreso persistente,
- autenticación de usuario,
- lógica de acceso por edad/grupo,
- sistema de estrellas, desafíos y avance visual.

Se trata de una versión React de una app previa basada en HTML + JavaScript, manteniendo la lógica y el contenido educativo original.

---

## 2. Tecnologías y stack

### Frontend
- React 18
- Vite 5
- JavaScript (ES modules)
- Tailwind CSS 3
- canvas-confetti

### Dependencias principales
- react
- react-dom
- canvas-confetti
- vite
- @vitejs/plugin-react
- tailwindcss
- postcss
- autoprefixer

### Scripts definidos en package.json
- npm install
- npm run dev
- npm run build
- npm run preview

---

## 3. Estructura del proyecto

```text
Frontend/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── README.md
├── context.md
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── CompletionModal.jsx
│   │   └── Header.jsx
│   ├── context/
│   │   └── AppStateContext.jsx
│   ├── data/
│   │   └── exercises.js
│   ├── hooks/
│   │   ├── useConfetti.js
│   │   └── useSoundEffects.js
│   └── pages/
│       ├── Auth.jsx
│       ├── Game.jsx
│       ├── Home.jsx
│       ├── Progress.jsx
│       └── Subjects.jsx
└── .gitignore (si existe en el repo)
```

---

## 4. Archivos clave

### index.html
Es el punto de entrada HTML de la aplicación. Vite conecta la app a través del `root` y carga los assets generados por la compilación.

### src/main.jsx
Archivo principal de renderizado.

Función:
- crea la aplicación React con `ReactDOM.createRoot(...)`
- envuelve la app en `AppStateProvider`
- importa estilos globales desde `src/index.css`

### src/App.jsx
Define la vista activa de la aplicación y la navegación principal.

Características:
- usa `useAppState()` para obtener `state`, `auth` y `authReady`
- renderiza una vista según `state.activeView`
- bloquea la pantalla si la autenticación aún no está lista
- si no hay usuario autenticado, muestra `Auth`
- incluye `Header` y `BottomNav` en todas las pantallas principales

### src/context/AppStateContext.jsx
Es el núcleo del estado global de la aplicación.

Incluye:
- creación del contexto
- `useReducer` para gestionar el estado de navegación, progresos, edades, materias y misiones diarias
- persistencia en `localStorage`
- autenticación con `login`, `register`, `logout`
- sincronización del progreso con backend si existe
- cálculo derivado del progreso por materia y porcentaje completado
- validación de desbloqueo de contenido según edad

Estado principal:
- ageGroup: `peques` o `grandes`
- stars: cantidad de estrellas acumuladas
- completedExercises: mapa de ejercicios completados
- currentSubject: materia actual
- currentIndexInSubject: índice actual dentro de la materia
- activeView: vista activa
- previousView: vista anterior
- dailyMission: estado de la misión diaria

### src/data/exercises.js
Banco principal de ejercicios.

Contiene:
- 30 ejercicios reales
- 10 de Matemáticas
- 10 de Inglés
- 10 de Geografía
- cada ejercicio tiene:
  - id
  - number
  - subject
  - subjectName
  - badge
  - icon
  - themeColor
  - title
  - options
  - hint
  - visualEmoji
  - speechWord (cuando aplica)

Este archivo actúa como fuente de verdad para la lógica del juego.

### src/pages/
Carpeta que contiene cada pantalla principal de la app:
- Auth.jsx: autenticación login/register
- Home.jsx: página de inicio
- Subjects.jsx: selección de materias
- Progress.jsx: progreso y logros del usuario
- Game.jsx: pantalla donde se resuelven los ejercicios

### src/components/
Componentes reutilizables:
- Header.jsx: barra superior, logo, estado del usuario, racha, estrellas y navegación
- BottomNav.jsx: navegación móvil inferior
- CompletionModal.jsx: modal cuando se supera una actividad o ejercicio

### src/hooks/
- useSoundEffects.js: sonidos generados con Web Audio API y opciones de voz con Web Speech API
- useConfetti.js: wrapper de canvas-confetti para animaciones de celebración

---

## 5. Lógica de estado y flujo de datos

La aplicación usa Context API + useReducer para centralizar el estado global.

### Persistencia
La app guarda información importante en `localStorage`:
- progreso del usuario
- autenticación activa
- identificador del cliente

Esto permite que la app recuerde el estado entre recargas.

### Autenticación
La app intenta conectarse a un backend con la URL base:

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

Se usan endpoints como:
- POST /auth/register
- POST /auth/login
- GET /progress
- PUT /progress

El frontend:
- guarda `token` y `user` en almacenamiento local
- usa el token en `Authorization: Bearer <token>`
- no guarda la contraseña localmente

### Progreso
El progreso deriva de `completedExercises`:
- cantidad total completada
- porcentaje de avance por materia
- medallas o logros
- desbloqueo de grupo "grandes"

### Misión diaria
Existe una lógica para una misión diaria con estados como:
- available
- active
- completed
- failed

Esto introduce un desafío temporal para reforzar aprendizaje diario.

---

## 6. Modelo de datos principal

El comportamiento del app gira en torno a estos datos:

```js
state = {
  ageGroup: 'peques' | 'grandes',
  stars: number,
  completedExercises: { [exerciseId]: true },
  currentSubject: 'math' | 'english' | 'geo',
  currentIndexInSubject: number,
  activeView: 'home' | 'subjects' | 'progress' | 'game',
  previousView: string,
  dailyMission: {
    date: string,
    status: 'available' | 'active' | 'completed' | 'failed',
    correctCount: number,
    startedAt: number | null,
    expiresAt: number | null,
  }
}
```

---

## 7. Comportamiento de la aplicación

### Navegación
La app se comporta como una interfaz orientada por vistas:
- Inicio
- Materias
- Progreso
- Juego

### Flujo típico de juego
1. Usuario inicia sesión.
2. Selecciona una materia.
3. Se abre la vista de juego.
4. Se muestra el ejercicio actual.
5. El usuario responde.
6. Si acierta, suma estrellas y marca ejercicio como completado.
7. Se puede avanzar a la siguiente pregunta o volver a la vista previa.

### Validaciones
- no se puede entrar al modo "grandes" sin haber completado todo el contenido requerido
- el progreso se guarda automáticamente
- la app evita recalcular innecesariamente el estado derivado gracias a `useMemo`

---

## 8. Estilos y diseño

El proyecto usa Tailwind CSS con configuración propia.

Archivos relevantes:
- tailwind.config.js
- postcss.config.js
- src/index.css

Se busca mantener una interfaz colorida, amigable y orientada a niños, con:
- fondo claro
- tarjetas con colores por materia
- botones grandes y amigables
- animaciones de confetti y sonidos para feedback positivo

---

## 9. Configuración del entorno

### Variables de entorno
Se espera que la app tenga una variable opcional:

```bash
VITE_API_URL=http://localhost:8000/api
```

Si no existe, usa por defecto:

```bash
http://localhost:8000/api
```

### Ejecución local
```bash
npm install
npm run dev
```

Luego abrir la URL que muestre Vite, normalmente:
```text
http://localhost:5173
```

---

## 10. Resumen del proyecto

La aplicación actual es un sistema educativo en React con:
- aprendizaje basado en ejercicios temáticos,
- sistema de misión diaria,
- progreso por materia,
- estado global centralizado,
- autenticación con backend,
- persistencia local,
- diseño visual atractivo para niños.

Es una app enfocada en gamificación, motivación y continuidad educativa con una arquitectura modular y escalable.

---

## 11. Nota útil para mantenimiento

Si se trabaja en el proyecto en el futuro, conviene tener en cuenta:
- `src/data/exercises.js` es la base de contenido; cambiar ejercicios ahí afecta la lógica del juego
- `src/context/AppStateContext.jsx` centraliza la seguridad de datos, autenticación y persistencia
- `src/pages/Game.jsx` es uno de los puntos más críticos para la experiencia del usuario
- `localStorage` se usa para una persistencia local simple y rápida, pero cualquier backend real debe validarse siempre del lado del servidor

---

## 12. Estado actual del proyecto

El proyecto está estructurado como una aplicación React funcional, con una base de contenido educativa completa, una capa de estado global bien definida, soporte de autenticación y lógica de progresos integrados, y una interfaz modular lista para continuar desarrollando nuevas funcionalidades.
