# MEMORY.md

Doc vivo con el **por qué** y lo que hay que recordar. Sin bitácora cronológica: si algo
cambia, se reescribe acá. `AGENTS.md` tiene las reglas de trabajo y los comandos.

## Estado

- Landing + editor (Konva) + panel `/admin` (content-driven). Vite + React 19 + TS strict +
  Tailwind 4 + react-router 7.
- Persistencia **local-first** por defecto; con credenciales corre contra **Supabase**
  (fases D1/D2 hechas). SPA desplegable en Vercel (`vercel.json` con rewrite).
- Repo `Hector-Olivera/trama-ropa`. Ramas `main` (estable) / `develop` (integración).
  CI (lint + typecheck + test + build) en PR/push a `main` y `develop`.

## Arquitectura (recordar)

- **Seam de datos**: `src/content/store.ts` y `src/admin/useAuth.ts` son el **único** punto a
  reemplazar para cambiar de backend. Interfaces **asíncronas**. `store.ts` delega en un
  **driver** (`driver.ts` + `drivers/local.ts` | `drivers/supabase.ts`) elegido por
  `isSupabaseConfigured()`. El SDK de Supabase se importa **dinámicamente**
  (`src/lib/supabase.ts`), así el modo local no lo carga.
- **Contenido**: todo texto/imagen editable vive en `SiteContent` (`content/types.ts`) con
  default en `defaults.ts`. El merge (`content/merge.ts`) combina **objetos campo a campo** y
  **reemplaza arrays enteros** (borrar de verdad borra). Campo nuevo → `types.ts` +
  `DEFAULT_CONTENT` + panel. `ContentProvider` maneja `loading`/`error`/`ready`.
- **Editor (no romper)**: filtros de imagen con `ctx.filter` (`lib/imageFilters.ts`), **no**
  `Konva.Filters` + `cache()` (rompe el `Transformer`); texto con `<textarea>` DOM
  (`TextOverlay`), no `Konva.Text`; la prenda base se dibuja con `useLoadedImage` (resuelve el
  `MediaRef`), nunca con el src crudo.
- **Imágenes**: en el documento se guarda la clave `trama:blob:<id>` (nunca un object URL).
  Binarios en IndexedDB; `MediaRef` = path de `public/` o clave de blob; toda `<img>` de
  contenido pasa por `MediaImage`. El GC `cleanupBlobs()` (`lib/storage.ts`) borra lo que no
  referencian el contenido ni los diseños **persistidos**; se corre sólo contra el estado ya
  guardado, nunca con un draft en memoria.
- **Centros**: claves de storage en `src/lib/storage-keys.ts`; ids estables de listas en
  `src/lib/id.ts` (`loadContent` migra contenido viejo sin ids).
- **Catálogo → editor**: las fotos que el visitante suma con "Llevar al editor" viven sólo en
  su navegador (`trama:local-products`, ids `cat-<catalogId>`), con tope **2** y descarte
  FIFO; no tocan el contenido. Las versiones guardadas **nunca** se tocan: al cargar una, su
  prenda se restaura por id desde el catálogo (`selectById`), aunque el tope la haya
  descartado. Sólo es irrecuperable si el item desapareció del catálogo.
- **Zoom del editor**: es **sólo vista** (el PNG y el adjunto siguen saliendo a resolución
  nativa, con la prenda completa). Rango 100–300% en pasos de 25%; el mínimo es el tamaño
  original. Se implementa **agrandando el `Stage`** (`lib/canvasMetrics.ts`) dentro de un
  contenedor con scroll nativo, no con `transform` CSS (rompería el hit-testing de Konva y el
  recorte del export). Paneo = arrastrar la prenda/fondo (`EditorCanvas`); arrastrar una capa
  mueve la capa. El zoom **pertenece a la prenda actual**: si cambia la prenda vuelve a 100%
  (estado `zoomFor` con el `productId` en `EditorSection`, así también cubre el alta desde el
  catálogo sin tocar el provider). Entra en la firma del autosave y en `Design.zoom`
  (opcional: los diseños viejos abren al 100%), así que cargar una versión restaura la vista.
  Las scrollbars del lienzo usan la clase `trama-scroll` (`index.css`).
- **Móvil**: el menú de la barra es una hamburguesa (`Nav`) que lista **`nav.links`** del
  contenido (no hardcodear atajos: se editan en el admin); cierra al navegar y con Escape.
  Las secciones usan `py-10 md:py-16` (el desktop conserva el espaciado grande) y las 4 fotos
  de "Cómo funciona" van en una sola fila (`grid-cols-4`) también en mobile.

## Supabase

- Contenido en la tabla `site_content` (fila `id=1`, columna `content` jsonb) con RLS (lectura
  pública, escritura autenticada). Imágenes en el bucket público `media`; la ref guardada es
  la **URL pública**. Los diseños del editor siguen locales.
- Auth del admin con email fijo `VITE_ADMIN_EMAIL` + contraseña (el Login sólo pide la
  contraseña y muestra el error real vía `mapAuthError`). Recuperación de contraseña **sólo**
  desde el dashboard de Supabase (sin botón en la app).
- `VITE_SUPABASE_URL` es la **Project URL** (`https://<ref>.supabase.co`), **sin** `/rest/v1`
  ni barra final: el SDK preserva el path del base y un `/rest/v1` rompe auth. Se arranca **de
  cero** en la nube (el primer guardado crea la fila).
- Sin credenciales, la app sigue en local (localStorage + IndexedDB).

## Contacto

- El formulario usa **Web3Forms** (sin backend; `VITE_CONTACT_ACCESS_KEY`, pública). El card
  de email es un `mailto:` (abre el cliente de correo; el "elegí una app" es del SO, no un bug).

## Deploy

- **Vercel**: SPA con rewrite de todas las rutas a `index.html` (`vercel.json`). Build
  `npm run build`, output `dist`; las `VITE_*` se hornean en el build (cargarlas en el host).
  Tras desplegar, la Site URL de Supabase Auth debe ser la URL del sitio.

## Limitaciones / deuda

- Modo local: el candado del admin es del cliente (SHA-256 en localStorage, pass inicial
  `trama`), **no es seguridad real**. Con Supabase la auth es real.
- `SiteContent.version` existe pero el merge no lo usa para migraciones.
- Tests: `pool: 'threads'` (los forks timeoutean al iniciar workers en Windows); `jsdom` por
  archivo con docblock; las `VITE_*` van vacías en `vitest.config.ts` para que `.env.local`
  no rompa el aislamiento.

## Skills / MCP

- No instalados (decisión del usuario). Candidatos: **Playwright MCP** (verificar UI/E2E),
  **GitHub MCP**, **Supabase MCP**.
