# AGENTS.md

Guía para agentes (y humanos) que trabajen en este repo. Mantené este archivo corto
y accionable. Las decisiones y el historial van en `MEMORY.md`.

## Proyecto

Sitio de **Trama** (ropa deportiva personalizada): landing + editor de estampado
(Konva) + panel de admin (`/admin`) para editar el contenido. Vite + React 19 + TS
strict + Tailwind 4 + react-router 7. Persistencia local-first (localStorage +
IndexedDB), sin backend todavía.

## Comandos (usar SIEMPRE estos)

```bash
npm run dev        # dev server, http://localhost:5173
npx tsc -b         # typecheck (app + node + tests)
npm run lint       # ESLint
npm test           # Vitest (una corrida)
npm run test:watch # Vitest en watch
npm run build      # tsc -b && vite build
npm run preview    # sirve dist, http://localhost:4173
```

**Antes de dar una tarea por terminada**: `npx tsc -b`, `npm run lint`,
`npm test` y `npm run build` deben pasar sin errores. Hay que verificar, no asumir.

## Git

- Git **no** está en el PATH del shell de herramientas (PowerShell). Invocalo por
  ruta completa:
  ```powershell
  & 'C:\Program Files\Git\cmd\git.exe' <comando>
  ```
- La terminal del usuario es Git Bash, donde `git` sí funciona con normalidad.
- No commitear salvo que el usuario lo pida explícitamente.
- Antes de commitear: revisar `status` y `diff`, y no incluir secretos.
- Rama principal: `main`. CI en GitHub Actions (`.github/workflows/ci.yml`).
  Sin remoto todavía: al crearlo, `git remote add origin <url>` y `git push -u origin main`.

## Reglas de código

- **No agregar comentarios** salvo pedido explícito. El código se explica solo.
- **UI en español** (textos, labels, mensajes). Consistente con el resto.
- TS **strict** + `noUnusedLocals` + `noUnusedParameters` + `verbatimModuleSyntax`
  (usar `import type` para tipos).
- Estilo/estética: fondo `#0a0a0a`, superficie `#141414`, línea `#2b2b2b`, acento
  cyan `#00d9ff`, acento pink `#ff2e9e`. Tokens de Tailwind con prefijo `brand-`
  (ej. `bg-brand-surface`, `text-brand-cyan`). Títulos `font-display`.
- Componentes: función + named export (excepto `App`/`Landing`). Hooks con prefijo
  `use`. Sin dependencias nuevas sin evaluar.
- No romper las reglas de `react-hooks` v7: nada de `setState` síncrono en effects ni
  espejos de estado en refs. Usar lazy init / updater form / estado derivado.

## Tests

- **Vitest** (`vitest.config.ts`, entorno `node` por defecto). Los archivos son
  `src/**/*.test.ts(x)`. Los que necesitan DOM/localStorage llevan
  `// @vitest-environment jsdom` como primera línea.
- Typecheck: los tests viven en `tsconfig.test.json` (extiende el app, agrega
  tipos de Node) para que `tsc -b` los cubra sin filtrar APIs de Node al código
  de la app.
- Cada test nuevo va cerca del módulo que prueba (`store.test.ts` junto a
  `store.ts`). Probar comportamiento, no implementación.

## Arquitectura (mapa)

```
src/
  content/   types.ts, defaults.ts, store.ts, ContentProvider.tsx,
             MediaImage.tsx, useResolvedImage.ts
  admin/     AdminApp.tsx, Login.tsx, useAuth.ts, useDraft.ts,
             fields.tsx, ImageField.tsx, RepeatableList.tsx,
             RichTitleField.tsx, panels/*
  components/  Nav, Hero, Catalog, HowItWorks, Contact, Footer,
               RichTitle, editor/*
  lib/       storage.ts, useEditor.ts, useHistory.ts, useElementSize.ts,
             exportImage.ts, images.ts, imageFilters.ts
  data/      products.ts (DEFAULT_PRODUCTS)
  types.ts   tipos del editor (Layer, Design, ProductView)
```

## Seam de datos (clave para el roadmap)

`src/content/store.ts` y `src/admin/useAuth.ts` son el **único** punto a reemplazar
para migrar de local-first a un backend (Supabase o propio). Mantené esas interfaces
estables: `loadContent`/`saveContent`/`resetContent`/`uploadMedia`/`removeMedia`/
`resolveMediaSrc` y `isAuthed`/`login`/`logout`. Los componentes del dashboard y la
landing no deberían enterarse del backend.

## Constraints del editor (no romper)

- **Filtros de imagen**: no usar `Konva.Filters` + `cache()` (rompe el `Transformer`,
  konvajs/konva#835). Se pre-renderizan con `ctx.filter` en `src/lib/imageFilters.ts`.
- **Texto editable**: usa un `<textarea>` DOM superpuesto (`TextOverlay.tsx`), no
  `Konva.Text` editable.
- **Imágenes**: en el documento se guarda la clave `trama:blob:<id>` (nunca un object
  URL). `MediaRef` es un path de `public/` o una clave de blob. Toda `<img>` de
  contenido pasa por `MediaImage`.
- `useResolvedImage` resuelve blobs de forma asíncrona; no mezclar con src síncrono.

## Convenciones de contenido

- Todo texto/imagen editable vive en `SiteContent` (`src/content/types.ts`) y tiene
  default en `defaults.ts`. El merge de `store.ts` combina **objetos campo a campo** y
  **reemplaza arrays enteros** (para que borrar de verdad borre).
- Al agregar un campo nuevo a `SiteContent`: agregarlo en `types.ts`, en
  `DEFAULT_CONTENT` y en el panel correspondiente. Así el contenido viejo no rompe.
