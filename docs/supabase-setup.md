# Puesta en marcha de Supabase

Guía para conectar el sitio a Supabase (contenido + imágenes en la nube y auth del
panel). Mientras no haya credenciales, la app sigue funcionando en modo local-first
(localStorage + IndexedDB): no hace falta Supabase para desarrollar.

> Estado: el driver de Supabase y la auth ya están implementados. Sin credenciales la
> app corre en modo local-first (el SDK ni se carga); al completar `.env.local` cambia
> solo a Supabase. Sólo falta crear el proyecto y correr el SQL/bucket/RLS/usuario de
> abajo. El código está en `src/content/drivers/supabase.ts` y `src/admin/useAuth.ts`.

## 1. Crear el proyecto

1. Entrá a <https://supabase.com> y creá una organización/proyecto (plan free).
2. En **Project Settings → API** copiá:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

La *anon key* es pública a propósito (va al bundle del cliente); la seguridad real
vive en las políticas RLS de abajo.

## 2. Variables de entorno

Copiá `.env.example` a `.env.local` (ya está en `.gitignore`) y completá:

```dotenv
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_ADMIN_EMAIL=tu@email.com
```

Reiniciá `npm run dev` después de tocar `.env.local` (Vite las lee al arrancar).

## 3. Esquema de contenido (tabla de una sola fila + jsonb)

En el **SQL Editor** del proyecto:

```sql
create table if not exists public.site_content (
  id integer primary key default 1,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

alter table public.site_content enable row level security;

-- El sitio es público: cualquiera puede leer.
create policy "contenido legible por todos"
  on public.site_content for select
  using (true);

-- Sólo el admin autenticado escribe.
create policy "contenido editable por autenticados"
  on public.site_content for all
  to authenticated
  using (true)
  with check (true);
```

Todo el `SiteContent` se guarda como un único `jsonb`. Al leerlo, la app le aplica
`mergeContent` contra los defaults (`src/content/merge.ts`), así que agregar campos
nuevos no rompe el contenido ya guardado.

## 4. Bucket de imágenes

Las imágenes del contenido van a Storage (bucket **público** salvo escritura):

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media editable por autenticados"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'media' and (select auth.uid()) is not null)
  with check (bucket_id = 'media' and (select auth.uid()) is not null);
```

No hace falta una policy de `SELECT` para lectura: al ser un bucket **público**,
cualquiera accede al objeto por su URL (`/storage/v1/object/public/media/...`) sin
pasar por RLS. La policy de arriba sólo la usa el admin autenticado para subir,
borrar y listar (el GC de `cleanupMedia`). La condición extra
`(select auth.uid()) is not null` evita el aviso del linter
`0025_public_bucket_allows_listing` ("un SELECT amplio permite listar el bucket"),
que es sólo un warning de exposición, no un bloqueo de subidas ni de lecturas.

La ref guardada en el contenido pasa a ser la **URL pública** del objeto (hoy es un
path de `public/` o la clave `trama:blob:<id>`). `MediaImage` ya resuelve ambos casos.

## 5. Usuario admin

1. En **Authentication → Users** creá un usuario con el email `VITE_ADMIN_EMAIL` y una
   contraseña fuerte (o invitá el email).
2. El Login sólo pide la contraseña: el email sale de `VITE_ADMIN_EMAIL`.

## 6. Verificación

- `npm run dev`, entrá a `/admin`, iniciá sesión y guardá un cambio.
- En **Table Editor** debería aparecer/actualizarse la fila `id = 1` de `site_content`.
- Subí una imagen y confirmá el objeto en **Storage → media**.

## Notas

- **Arranque desde cero**: no se migra el contenido local a la nube; el primer guardado
  crea la fila.
- **Fallback**: si faltan `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`,
  `isSupabaseConfigured()` es `false` y `store.ts` usa el driver local.
- Los **diseños del editor** (los que hace el visitante) siguen siendo locales en
  IndexedDB: no se suben al backend.
