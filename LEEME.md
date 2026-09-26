# Agenda · Patri S. Rodeiro Strength & Rehab

App web para la agenda, alojada gratis en GitHub Pages con los datos en Supabase (plan gratuito, servidores en la UE). Tú y tu secretaria entráis con vuestro email y contraseña desde el móvil o el ordenador y veis los cambios de la otra al momento.

Tiempo total de montaje: unos 30 minutos.

## Archivos

- `index.html`: la app.
- `config.js`: aquí pegas los datos de tu Supabase (paso 2).
- `supabase.sql`: crea la base de datos (paso 1).
- `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`: para instalarla en el móvil como una app.

## Paso 1. Crear la base de datos en Supabase

1. Entra en supabase.com y crea una cuenta gratuita.
2. Pulsa **New project**. Nombre: `agenda-psr`. Pon una contraseña de base de datos (guárdala). En **Region** elige una de Europa (por ejemplo, Frankfurt o París).
3. Cuando el proyecto esté listo, ve a **SQL Editor → New query**, pega todo el contenido de `supabase.sql` y pulsa **Run**. Debe decir "Success".

## Paso 2. Copiar tus claves a config.js

1. En Supabase ve a **Project Settings → API Keys** (en algunas cuentas aparece como **Data API** o **API**).
2. Copia la **Project URL** (algo como `https://abcdxyz.supabase.co`).
3. Copia la clave **publishable** (empieza por `sb_publishable_`). En proyectos antiguos se llama **anon public**.
4. Abre `config.js` con el Bloc de notas y sustituye los dos textos `PEGA_AQUI...` por esos valores, manteniendo las comillas.

Nunca uses la clave **secret** ni la **service_role**: esas dan acceso total y no deben subirse a GitHub.

## Paso 3. Crear los dos usuarios y cerrar el registro

1. En Supabase ve a **Authentication → Users → Add user → Create new user**.
2. Crea tu usuario con tu email y una contraseña, marcando **Auto Confirm User**.
3. Repite con el email de tu secretaria.
4. Ve a **Authentication → Sign In / Providers** y desactiva **Allow new users to sign up**. Así nadie más puede crearse una cuenta.

## Paso 4. Publicar la app en GitHub

1. Crea una cuenta gratuita en github.com.
2. Pulsa **New repository**. Nombre: `agenda`. Déjalo en **Public** (GitHub Pages gratis solo funciona con repositorios públicos; el código es público, pero tus datos no, porque están en Supabase y solo se ven con usuario y contraseña).
3. En el repositorio, pulsa **Add file → Upload files** y arrastra todos los archivos de esta carpeta (con `config.js` ya rellenado). Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/(root)**, y guarda.
5. En uno o dos minutos tendrás la dirección: `https://TU-USUARIO.github.io/agenda/`.

## Paso 5. Ajustar la recuperación de contraseña

En Supabase ve a **Authentication → URL Configuration** y en **Site URL** pega la dirección de tu app (`https://TU-USUARIO.github.io/agenda/`). Así el enlace de "He olvidado mi contraseña" lleva a tu app.

## Paso 6. Pasar tus datos desde la versión de Claude

1. En la versión antigua (la de Claude), ve a **Mes → Guardar copia en el ordenador**.
2. En la app nueva, entra con tu usuario, ve a **Mes → Restaurar una copia** y elige ese archivo.

La primera vez que cada una entre, la app pregunta el nombre para registrar quién hace cada cambio.

## Paso 7. Instalarla en el móvil

- **Android (Chrome):** abre la dirección, menú de los tres puntos → **Añadir a pantalla de inicio**.
- **iPhone (Safari):** abre la dirección, botón **Compartir** → **Añadir a pantalla de inicio**.

## Mantenimiento

- **Copia semanal:** sigue haciendo **Mes → Guardar copia en el ordenador** una vez por semana y guárdala en tu carpeta. La app te avisa si pasan más de 7 días.
- **Pausa por inactividad:** Supabase gratis pausa los proyectos que no se usan durante una semana. Usándola a diario no pasa; si alguna vez ocurre, entra en Supabase y pulsa **Restore project**.
- **Cambios en la app:** si modificamos `index.html`, solo tienes que volver a subirlo a GitHub (**Add file → Upload files**) y sustituirá al anterior.
