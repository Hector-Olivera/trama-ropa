# MEMORY.md

Bitácora de decisiones, limitaciones conocidas y roadmap. No borrar entradas: si algo
cambia, agregar una nueva con fecha. `AGENTS.md` tiene las reglas de trabajo; acá va el
**por qué** y lo que hay que recordar.

## Estado actual

- Landing + editor + panel `/admin` funcionando. `tsc -b`, `lint` y `build` limpios.
- Persistencia **local-first**: contenido en `localStorage`, imágenes en `IndexedDB`.
- Assets optimizados con `scripts/optimize-assets.mjs` (originales 60 MB → ~5 MB en
  `public/`). Los originales viven fuera del repo (carpeta `Estampados/`); **no
  modificar**.
- Sin backend. Con tests (28) y CI; repo en GitHub con `main`/`develop`.

## Decisiones

- **2026-10-14** — Repo local en `main`, un único commit inicial. GitHub y CI quedan
  para la **Fase B**. Git se invoca por ruta completa desde PowerShell (ver AGENTS.md).
- **2026-10-14** — Se documenta con `README.md`, `AGENTS.md` y `MEMORY.md`.
- **2026-10-14** — El panel se protege con un candado **local** (SHA-256 en
  localStorage, pass inicial `trama`). **No es seguridad real**; se reemplaza por auth
  real en la Fase D.
- **2026-10-14** — Se descartan las "zonas de impresión" del editor: se puede estampar
  en cualquier parte de la prenda. Las prendas base ahora son editables desde el admin.
- **2026-10-14** — **Fase B**: se suma **Vitest** (entorno `node`; `jsdom` por archivo
  con docblock) + `jsdom` + `@testing-library/react`. Tests junto al módulo, en
  `src/**/*.test.ts(x)`. Se crea `tsconfig.test.json` (extiende el app + tipos de Node)
  para que `tsc -b` typechequee tests sin filtrar APIs de Node al código de la app.
  Se agrega CI en `.github/workflows/ci.yml` (lint + typecheck + test + build en Node 24).
- **2026-10-14** — Flujo de trabajo establecido: `develop` como rama de integración,
  features en `feature/<nombre>`, PRs a `develop` (agente no crea PRs, solo
  prepara ramas). `main` recibe merges desde `develop` en liberaciones.
  Repo remoto `origin` apuntando a `https://github.com/Hector-Olivera/trama-ropa.git`.
- **2026-10-15** — **Fase C, C1**: claves/prefix de storage centralizados en
  `src/lib/storage-keys.ts` (`STORAGE_KEYS` + `BLOB_PREFIX`).
- **2026-10-15** — **Fase C, C2**: los items de las listas editables llevan `id`
  estable (nav, hero, cómo funciona, footer) y `RepeatableList` lo usa como key.
  `newId()` vive en `src/lib/id.ts`; `loadContent` migra contenido viejo sin ids.
- **2026-10-15** — Vitest con `pool: 'threads'`: el pool de forks por defecto
  timeoutea al iniciar workers en Windows; threads corre los tests sin problema.
- **2026-10-15** — **Fase C, C3**: el panel pasa de tabs con `useState` a rutas
  anidadas (`/admin/<sección>` + `/admin/seguridad`) con `NavLink` y `<Outlet>`; la
  sección activa ahora es una URL compartible. El test de `AdminApp` monta el panel
  **una sola vez** y navega clickeando: montar el panel entero varias veces en el mismo
  jsdom cuelga el worker (visto en Windows), y un montaje tarda ~6s, por eso el test
  lleva timeout propio (20s).
- **2026-10-15** — **Fase C, C4**: los paneles dejan de definir su propio `setX`; usan
  `useSection(update, 'hero')` y `useSectionField(update, 'contact', 'whatsapp')`. Los
  spreads genéricos necesitaron castear a `object` (TS no permite spread de un tipo
  genérico).
- **2026-10-15** — **Fase C, C5**: `SectionBoundary` (fallback compacto + ancla) envuelve
  cada sección de la landing y el `<Outlet>` del panel, así una sección rota no tira
  abajo al resto. El editor lazy pasó de `ErrorBoundary` a `SectionBoundary id="editor"`.
  En admin, una ruta desconocida ya **no** redirige en silencio: renderiza `AdminNotFound`
  (404 real). El boundary del panel va con `key={pathname}` para limpiar el error al
  navegar. Tests: `src/components/SectionBoundary.test.tsx` y el caso 404 dentro del
  montaje único de `AdminApp.test.tsx` (un `JumpButton` con `useNavigate` navega a
  `/admin/panel-fantasma` sin montar el panel de nuevo).
- **2026-10-15** — **Fase C, C6**: recolector de basura de imágenes. `removeMedia`
  existía pero **nunca se llamaba**: reemplazar/quitar una imagen dejaba el blob viejo
  en IndexedDB. Ahora `cleanupBlobs()` (en `src/lib/storage.ts`) junta las refs
  persistidas con `collectStoredBlobRefs()` (`src/lib/blobReferences.ts`) y borra de
  IndexedDB los blobs que nadie referencia. Se dispara en los commits del admin
  (`useDraft`: commit/discard/resetAll) y en el editor (autosave y borrar versión). Sólo
  se corre contra el estado **guardado**, nunca contra un draft en memoria. Se simplificó
  `deleteDesign` (ya no borra blobs a mano: lo hace el GC). Test:
  `src/lib/blobReferences.test.ts`.

## Backend: decisión pendiente (Supabase vs propio) — evaluar en Fase D

- Requisito del usuario: que podamos **alojarlo gratis** y tener los **mismos
  beneficios** que Supabase (auth, DB, storage de imágenes, API).
- Principio de diseño desde ya: mantener el **seam de datos genérico**
  (`src/content/store.ts` + `src/admin/useAuth.ts`) para poder cambiar de backend sin
  tocar componentes. Preferir una interfaz de repositorio/auth por encima de funciones
  sueltas.
- Opciones a evaluar: Supabase (todo-en-uno, free tier) vs. propio (ej. Node/Fastify +
  Postgres gestionado gratis [Neon] + storage S3-compatible [Cloudflare R2] + auth
  propia, hosteado en Render/Railway/Fly). Decidir con costos y mantenimiento sobre la
  mesa.

## Limitaciones / deuda técnica conocida

- **Auth de admin solo en cliente** (no es seguridad real).
- Contenido guardado antes de los ids: `loadContent` los regenera en cada carga hasta
  que se guarda una vez (después persisten). Aceptable por ahora.
- `SiteContent.version` existe pero el merge todavía no lo usa para migraciones.
- Deploy: en hosting estático hace falta **rewrite SPA** (`/admin` da 404 si no).

## Roadmap

- **Fase A (hecha)** — Higiene base: git local + `.gitignore` + commit inicial,
  documentación (README/AGENTS/MEMORY), `ErrorBoundary` y ruta `NotFound`.
- **Fase B (hecha)** — Calidad: Vitest + tests (17) + CI, repo en GitHub
  (`Hector-Olivera/trama-ropa`) y `main`/`develop` pusheados.
- **Fase C (hecha)** — Refactors chicos:
  - **C1 (hecha)** — claves de storage centralizadas en `src/lib/storage-keys.ts`.
  - **C2 (hecha)** — `RepeatableList` con `id` estable: id en los items de nav, hero,
    cómo funciona y footer + migración en `loadContent`; `create()` genera id con
    `src/lib/id.ts`.
  - **C3 (hecha)** — admin por rutas: `AdminApp` usa rutas anidadas
    (`/admin/marca`, `/admin/inicio`, …, `/admin/seguridad`) con `NavLink` y `<Outlet>`
    en vez de tabs con `useState`. El redirect de `/admin` va a la primera sección. Test de
    navegación en `src/admin/AdminApp.test.tsx`.
  - **C4 (hecha)** — helper genérico de sección: `useSection` /
    `useSectionField` en `src/admin/panels/useSection.ts` reemplazan el `setX` repetido
    de cada panel y sus spreads anidados (`contact.whatsapp`, `hero.primary`, `nav.cta`,
    …). Test en `src/admin/panels/useSection.test.ts`.
  - **C5 (hecha)** — resiliencia: `SectionBoundary` por sección en la landing y en el
    panel + 404 real en admin (`AdminNotFound`).
  - **C6 (hecha)** — limpieza de blobs huérfanos: `cleanupBlobs()` (GC de imágenes)
    contra el contenido y los diseños persistidos; `collectStoredBlobRefs` en
    `src/lib/blobReferences.ts`. Test en `src/lib/blobReferences.test.ts`.
- **Fase D** — Backend: decidir Supabase vs propio, esquema de contenido + storage de
  imágenes + auth real; swap del seam.

## Skills / MCP

- **2026-10-14** — Por ahora no se instalan skills ni MCP (decisión del usuario).
- Candidatos a futuro: **MCP de navegador (Playwright)** para verificar UI/E2E (el
  agente no puede ver imágenes), **GitHub MCP** (repo/PRs), **Supabase MCP** (si ese es
  el backend).
