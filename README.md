# Trama

Sitio web de **Trama**, ropa deportiva personalizada. Incluye una landing comercial
y un **editor** para estampar logos y texto sobre prendas base, más un **panel de
administración** (`/admin`) para editar todo el contenido del sitio sin tocar código.

## Stack

- **Vite 8** + **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS 4**
- **Konva / react-konva 10** (motor del editor en canvas)
- **react-router-dom 7** (rutas `/` y `/admin`)
- **idb-keyval** (IndexedDB para imágenes subidas)
- **sharp** (script de optimización de assets)

Persistencia **local-first**: el contenido va a `localStorage` y las imágenes a
`IndexedDB`. No requiere backend por ahora.

## Requisitos

- Node 20+ (desarrollado con Node 24.13.1 / npm 11.8.0)

## Scripts

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo        -> http://localhost:5173
npm run build      # typecheck (tsc -b) + build prod -> dist/
npm run preview    # sirve el build                 -> http://localhost:4173
npm run lint       # ESLint
npm test           # tests (Vitest, una corrida)
npm run test:watch # tests en modo watch
npm run assets     # reprocesa los assets originales a public/
```

## Acceso al panel de administración

1. Levantá el sitio (`npm run dev` o `npm run preview`).
2. Entrá a **`/admin`** (ej. http://localhost:5173/admin).
3. Contraseña inicial: **`trama`**. Cambiala desde el panel (sección "Seguridad").

> El candado de admin es **del lado del navegador** (hash SHA-256 en `localStorage`).
> No es seguridad real: cualquiera con acceso al navegador puede saltearlo. El acceso
> a datos está aislado en `src/content/store.ts` y `src/admin/useAuth.ts` para
> reemplazarlo por un backend real más adelante.

## Arquitectura

```
src/
  content/      Modelo de contenido editable + provider + resolución de imágenes
  admin/        Dashboard (/admin): auth, draft, campos y paneles por sección
  components/   Landing (Nav, Hero, Catalog, HowItWorks, Contact, Footer) y editor/
  lib/          Lógica del editor: storage, export, imágenes, hooks
  data/         DEFAULT_PRODUCTS (prendas base por defecto del editor)
  types.ts      Tipos del editor (Layer, Design, ProductView)
```

Seam de datos: **`src/content/store.ts`** y **`src/admin/useAuth.ts`** son el único
punto a cambiar para migrar a un backend (Supabase o propio). El resto del código no
se toca.

## Deploy

Es una SPA. En hosting estático configurá un **rewrite** de todas las rutas a
`index.html` (si no, `/admin` da 404 en el servidor):

- Netlify: `public/_redirects` con `/*  /index.html  200`
- Vercel: `vercel.json` con un rewrite a `/index.html`

## Documentación interna

- `AGENTS.md` — convenciones y comandos para trabajar en el repo.
- `MEMORY.md` — decisiones, limitaciones conocidas y roadmap.
