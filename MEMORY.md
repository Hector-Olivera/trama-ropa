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
- **Barra del editor** (`EditorToolbar`): una sola línea con scroll horizontal interno. Los
  carteles (`limit` / `save-first` / `limit-save` / `attached`) se dibujan con
  `position: fixed` anclados al rect del botón: un `absolute` dentro de un contenedor con
  `overflow-x-auto` queda **recortado** (CSS computa `overflow-y: auto`). Se manejan **sólo por
  puntero**: aparecen al posar el cursor (o al tocar, para mobile), se cierran al salir, y un
  `pointerdown`/`scroll` en `window` los descarta (sin timers, así no quedan pegados). Adjuntar
  nunca navega: si falta guardar sólo destella "Guardar" (`animate-glow-pulse`, 3 s) y avisa;
  un diseño ya adjuntado (misma firma) muestra "Este diseño ya está adjuntado" y no se resube.
- **Selector de prenda**: el **carrusel es para mobile** (`lg:hidden`), no para el desktop. Va
  en una fila con **scroll horizontal sin barra visible** (clase `.trama-strip`: `scrollbar-width:
  none` + `::-webkit-scrollbar { display: none }`), snap, y **flechas `‹ ›`** translúcidas
  (círculos `bg-brand-black/70 backdrop-blur`, `opacity-70`, hover cyan) que se **ocultan en cada
  extremo** y sólo aparece si hay overflow (paso de 120 px = una tarjeta). En **desktop** queda la
  grilla de 2 columnas **siempre como antes** (`hidden lg:grid`, orden original). El carrusel
  muestra las prendas **en orden inverso** y arranca scrolleado a la **primera que sumó el
  visitante** (`userAddedIds`, memoizado en `EditorSection` con `useMemo` para que el efecto no se
  recue en cada render). Las métricas de las flechas salen de `onScroll` + `resize` +
  `requestAnimationFrame` (callbacks: nunca setState sincróno en el body de un effect).
- **Capas / miniaturas**: las capas `image` muestran la **miniatura** del logo en vez del tag
  "IMG"/nombre (`name` no es editable; `alt={layer.name}` para accesibilidad). **Ojo: hay DOS
  namespaces `trama:blob:`** — los logos del editor viven en IndexedDB local y se resuelven con
  `resolveDrawableSrc` (`lib/storage.ts`, con cache de object URLs), que es lo que usa el canvas.
  `MediaImage`/`useResolvedImage` resuelven con el driver de contenido: con Supabase activo
  `resolveMediaSrc` devuelve el ref crudo → `<img src="trama:blob:...">` **rota**. Por eso el
  editor usa `DrawableImage` (resuelve con `resolveDrawableSrc` y muestra placeholder si el blob
  ya no existe, nunca una imagen rota). Al **cambiar de prenda** desde el selector, los logos
  visibles se **ocultan** (no se borran: quedan en Capas con el ojo; los textos se mantienen) —
  misma filosofía que "Vaciar". La nota del selector explica el comportamiento.

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
  Los diseños adjuntados viajan como **link firmado** en el cuerpo del mensaje; al enviar con
  éxito se limpian (`clear()` del contexto, revoca las vistas previas).
- **Botón flotante** (`FloatingAttachment`, montado en `Landing` junto a los providers):
  aparece únicamente mientras haya diseños adjuntados. Es un **flecha SVG con el texto
  adentro** (punta abajo "Enviar Diseño", punta arriba "Volver"; `fill` negro/65% +
  borde cyan `stroke-brand-cyan`, hover se llena de cyan y el texto pasa a negro; `vectorEffect`
  para que el borde no se deforme). Modo Enviar destella en loop con
  `animate-glow-arc-loop` (**drop-shadow**, no `box-shadow`: el glow cuadrado no sigue la
  silueta); Volver no destella. Scroll a `#contacto`/`#editor`; el modo se detecta con
  `IntersectionObserver` sobre `#contacto` (`rootMargin: '-40% 0px -40% 0px'`), no con el click,
  para que la etiqueta sea correcta aun scrolleando a mano. En tests jsdom el IO se stubbea a
  mano (jsdom no lo implementa).

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
