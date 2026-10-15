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
- Sin backend, sin tests, sin CI. Repo git local (sin remoto).

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
- **2026-10-14** — **GitHub CLI (`gh`) no está instalado** y no hay remoto. Para subir
  el repo hay que: instalar `gh` (y `gh auth login`), o crear el repo vacío en
  github.com a mano y pasarnos la URL para `git remote add origin ... && git push -u`.
  Mientras tanto, los commits locales en `main` no se pierden.

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
- **Sin tests** (falta Vitest; prioridad Fase B). Nada cubre `mergeContent`, `useEditor`
  /`useHistory` ni `exportImage`.
- **Sin CI** que imponga lint + typecheck + build.
- **Blobs huérfanos**: al reemplazar/quitar una imagen no se borra el blob viejo de
  IndexedDB (fuga gradual). Revisar en Fase C.
- `RepeatableList` usa `key={index}` → posible bug sutil al reordenar. Fase C.
- Claves/prefix de storage (`trama:content`, `trama:blob:`, `trama:admin:*`) dispersas;
  conviene centralizarlas. Fase C.
- `SiteContent.version` existe pero el merge todavía no lo usa para migraciones.
- Deploy: en hosting estático hace falta **rewrite SPA** (`/admin` da 404 si no).

## Roadmap

- **Fase A (hecha)** — Higiene base: git local + `.gitignore` + commit inicial,
  documentación (README/AGENTS/MEMORY), `ErrorBoundary` y ruta `NotFound`.
- **Fase B (en curso)** — Calidad: **Vitest + tests + CI hechos**. Falta: crear el
  **repo en GitHub** y pushear (bloqueado: no hay `gh` instalado; ver nota).
- **Fase C** — Refactors chicos: claves de storage centralizadas, `RepeatableList` con
  id estable, admin por rutas (`/admin/hero`, …) en vez de tabs con `useState`, helper
  genérico de sección en los paneles, error boundaries por sección.
- **Fase D** — Backend: decidir Supabase vs propio, esquema de contenido + storage de
  imágenes + auth real; swap del seam.

## Skills / MCP

- **2026-10-14** — Por ahora no se instalan skills ni MCP (decisión del usuario).
- Candidatos a futuro: **MCP de navegador (Playwright)** para verificar UI/E2E (el
  agente no puede ver imágenes), **GitHub MCP** (repo/PRs), **Supabase MCP** (si ese es
  el backend).
