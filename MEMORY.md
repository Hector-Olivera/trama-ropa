# MEMORY.md

Bitácora de decisiones, limitaciones conocidas y roadmap. No borrar entradas: si algo
cambia, agregar una nueva con fecha. `AGENTS.md` tiene las reglas de trabajo; acá va el
**por qué** y lo que hay que recordar.

## Estado actual

- Landing + editor + panel `/admin` funcionando. `tsc -b`, `lint` y `build` limpios.
- Persistencia **local-first** por defecto: contenido en `localStorage`, imágenes en
  `IndexedDB`. **Supabase listo** (driver + auth) y se activa solo al configurar las
  variables de entorno (sin credenciales no se carga el SDK).
- Assets optimizados con `scripts/optimize-assets.mjs` (originales 60 MB → ~5 MB en
  `public/`). Los originales viven fuera del repo (carpeta `Estampados/`); **no
  modificar**.
- Con tests (33) y CI; repo en GitHub con `main`/`develop`.

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
- **2026-10-15** — **Fase D, decisiones**: backend = **Supabase** (free tier, todo-en-uno).
  Auth del admin = **email fijo por env `VITE_ADMIN_EMAIL` + contraseña** (el Login sigue
  pidiendo sólo la contraseña). Se **arranca de cero** en la nube (no se migra el contenido
  local). Se **mantiene el fallback local-first** cuando faltan credenciales.
- **2026-10-15** — **Fase D, D1 (preparación, sin Supabase todavía)**: el seam de contenido
  pasa a **asíncrono** y se parametriza por **driver**. Nuevos: `src/content/merge.ts`
  (merge/normalize extraídos de `store.ts`), `src/content/driver.ts` (`ContentDriver`) y
  `src/content/drivers/local.ts` (localStorage + IndexedDB, la lógica de antes). `store.ts`
  queda como selector (`isSupabaseConfigured()` → driver). `ContentProvider` maneja
  `loading`/`error`/`ready` con pantalla de carga y de reintento. `useDraft.commit`/`resetAll`
  y el guardado del panel pasan a `async` (con estado `Guardando…` y error visible). Env
  tipado en `src/vite-env.d.ts` + `src/lib/env.ts` (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_EMAIL`). Guía de proyecto/SQL/RLS/bucket en
  `docs/supabase-setup.md` y `.env.example`.   `store.test.ts` y `AdminApp.test.tsx` ahora
  `await`ean. Nota: los **diseños del editor** siguen locales (IndexedDB), no se suben.
- **2026-10-15** — **Fase D, D2 (hecha)**: driver y auth de Supabase. `@supabase/supabase-js`
  se importa **dinámicamente** (`src/lib/supabase.ts`, cliente cacheado; `null` sin
  credenciales) para que el modo local no cargue el SDK (bundle y tests). Nuevo
  `src/content/drivers/supabase.ts` (`createSupabaseDriver`): contenido en la tabla
  `site_content` (fila `id=1`, columna `content` jsonb) y imágenes en el bucket público
  `media` (la ref guardada es la **URL pública**; `cleanupMedia` lista el bucket y borra
  lo que no referencia el contenido). `store.ts` elige el driver de forma asíncrona.
  `useAuth.ts` ahora es **dos implementaciones** (`useLocalAuth` / `useSupabaseAuth`) y
  exporta la que corresponde por entorno; con Supabase usa email fijo `VITE_ADMIN_EMAIL`
  + contraseña (`signInWithPassword`/`updateUser`) y agrega `loading` (la sesión inicial
  es asíncrona). `AdminApp` muestra un splash mientras se resuelve. Tests de los helpers
  puros del driver en `src/content/drivers/supabase.test.ts`.

## Backend: Supabase (Fase D)

- Elegido **Supabase** (free tier; auth + Postgres + Storage + API en uno). Guía de puesta
  en marcha: `docs/supabase-setup.md`.
- Principio de diseño: mantener el **seam de datos genérico** (`src/content/store.ts` +
  `src/admin/useAuth.ts`) para poder cambiar de backend sin tocar componentes.
- El contenido se guarda como un único `jsonb` en la tabla de una fila `site_content`
  (id = 1), con **RLS** (lectura pública, escritura autenticada). Las imágenes del contenido
  van al bucket público `media` y la ref guardada es la **URL pública**. Los diseños del
  editor siguen locales.
- Cliente y auth: `src/lib/supabase.ts` (cliente, import **dinámico**), `drivers/supabase.ts`
  (contenido + Storage + GC) y `useAuth` con `supabase.auth` y email fijo `VITE_ADMIN_EMAIL`
  (el Login sigue pidiendo sólo la contraseña). Todo detallado en la entrada D2 de arriba.
- Falta únicamente lo del lado de Supabase: crear el proyecto y correr el SQL/bucket/RLS/usuario
  de `docs/supabase-setup.md`, y cargar `.env.local`. Sin eso, la app sigue en local.

## Limitaciones / deuda técnica conocida

- **Auth de admin**: con Supabase es real (email fijo + contraseña, RLS). En modo local
  sigue siendo un candado del cliente (SHA-256 en `localStorage`), **no seguridad real**.
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
- **Fase D (en curso)** — Backend **Supabase**:
  - **D1 (hecha)** — preparación: seam **asíncrono** + abstracción de **driver**
    (`src/content/driver.ts`, `drivers/local.ts`, `merge.ts`), `ContentProvider` con
    `loading`/`error`, env tipado (`src/lib/env.ts`), `docs/supabase-setup.md` + `.env.example`.
  - **D2 (hecha)** — driver Supabase (`drivers/supabase.ts`: tabla `site_content` jsonb +
    Storage `media` + GC) y auth real (`useAuth` con `supabase.auth`, email fijo
    `VITE_ADMIN_EMAIL`); SDK con import dinámico. Próximo: crear el proyecto en Supabase
    (pasos del usuario) y verificar de punta a punta.

## Skills / MCP

- **2026-10-14** — Por ahora no se instalan skills ni MCP (decisión del usuario).
- Candidatos a futuro: **MCP de navegador (Playwright)** para verificar UI/E2E (el
  agente no puede ver imágenes), **GitHub MCP** (repo/PRs), **Supabase MCP** (si ese es
  el backend).
