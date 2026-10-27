# Mi Tienda — App Móvil con Base de Datos Local (SQLite) y en la Nube (Supabase)

**Parcial 2 — Desarrollo Móvil**  
- **Estudiante:** Deivis Magdaniel  
- **Código:** [Tu Código de Estudiante Aquí]  
- **Tecnologías:** React Native, Expo (SDK 58), TypeScript, Expo Router, SQLite (`expo-sqlite`), Drizzle ORM, Supabase Auth & Database, Expo SecureStore.

---

## 📋 Descripción del Proyecto

**Mi Tienda** es una aplicación móvil diseñada para que tenderos de barrio (como en Riohacha) puedan gestionar su inventario de productos sin depender constantemente de una conexión a Internet:
1. **Modo Offline Primero (Local-First):** Todas las operaciones de creación, edición, consulta y eliminación ocurren directamente sobre una base de datos local SQLite mediante Drizzle ORM. Funciona al 100% en modo avión.
2. **Sincronización Bidireccional Manual:** Permite sincronizar con Supabase cuando hay conexión:
   - **Descarga:** Trae productos remotos del usuario que no existan en el dispositivo local.
   - **Subida:** Envía productos locales pendientes mediante `upsert` basado en `client_id` (UUID único).
3. **Autenticación y Seguridad:** Autenticación con Supabase Auth (correo y contraseña), persistencia segura de sesión mediante `expo-secure-store` (con adaptador de fragmentación para superar el límite de 2048 bytes de Android), rutas protegidas y Row Level Security (RLS) en Supabase.
4. **Punto Extra Implementado:** Búsqueda reactiva de productos por nombre en la pantalla principal y regla de resolución de conflictos *"gana el último cambio"* para descargas cuando el producto local ya está sincronizado.

---

## ⚙️ Requisitos y Versiones Utilizadas

- **Node.js:** v24.19.0 (o v18+)
- **Expo SDK:** 58 (Expo `~58.0.19`, Expo Router `~58.0.26`)
- **React:** 19.3.0 / **React Native:** 0.88.0
- **Drizzle ORM:** `^0.45.4` / **Drizzle Kit:** `^0.31.11`
- **Expo SQLite:** `~58.0.14`
- **Expo SecureStore:** `~58.0.2`
- **Supabase JS:** `^2.118.0`

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar o descargar el repositorio
```bash
git clone https://github.com/<tu-usuario>/parcial-mi-tienda-<tu-apellido>.git
cd parcial-mi-tienda-<tu-apellido>
```

### 2. Configurar Variables de Entorno (`.env`)
Copia el archivo de plantilla `.env.example` y nómbralo `.env`:
```bash
cp .env.example .env
```
Edita `.env` con las credenciales públicas de tu propio proyecto de Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_publishable_key
```
> ⚠️ **IMPORTANTE DE SEGURIDAD:**  
> - El archivo `.env` está en `.gitignore` y **NUNCA** debe subirse al repositorio de GitHub.  
> - Solo se usa la `anon/publishable key`. Nunca incluyas la `service_role secret key` ni contraseñas de base de datos.

### 3. Configurar la Base de Datos en Supabase
En el panel de tu proyecto de Supabase, ve a **SQL Editor** y ejecuta el siguiente script:

```sql
create table public.products (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id uuid not null unique,
  name text not null,
  quantity integer not null check (quantity >= 0),
  price integer not null check (price >= 0),
  updated_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Políticas de seguridad RLS por usuario autenticado:
create policy "ver los míos" on public.products
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "crear los míos" on public.products
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "editar los míos" on public.products
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "borrar los míos" on public.products
  for delete to authenticated using ((select auth.uid()) = user_id);
```

> 💡 **Nota sobre Confirmación de Correo:**  
> En el menú de Supabase: **Authentication > Providers > Email**, se sugiere desactivar la casilla **"Confirm email"** para permitir que el registro inicie sesión de inmediato durante las pruebas del parcial.

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Generar Migraciones Locales (Opcional, ya incluidas en `drizzle/`)
```bash
npx drizzle-kit generate
```

### 6. Iniciar la Aplicación en Expo Go
```bash
npx expo start
```
Escanea el código QR desde la app **Expo Go** en tu dispositivo Android o iOS (o presiona `a` para Android Emulator, `w` para Web).

---

## 📸 Capturas de Pantalla Obligatorias

A continuación se presentan las 7 capturas de pantalla de la aplicación en funcionamiento:

### 1. Pantalla de Inicio de Sesión
![Login](capturas/01-login.png)

### 2. Pantalla de Registro con Validación Visible
![Registro](capturas/02-registro.png)

### 3. Pantalla Principal / Inventario (Métricas, Lista e Indicadores)
![Principal](capturas/03-principal.png)

### 4. Formulario de Edición de Producto
![Formulario](capturas/04-formulario.png)

### 5. Producto Creado en Modo Avión (Marcado como Pendiente)
![Sin Conexión](capturas/05-sin-conexion.png)

### 6. Pantalla Principal tras Sincronización Exitosa
![Sincronizado](capturas/06-sincronizado.png)

### 7. Panel de Supabase (Tabla products con filas del usuario)
![Supabase](capturas/07-supabase.png)

---

## 📊 Estado de Cumplimiento de Requisitos

| Requisito | Estado | Observación |
| :--- | :---: | :--- |
| **Autenticación (25%)** | **IMPLEMENTADO** | Registro con validaciones, login, cierre de sesión, persistencia con SecureStore y protección de rutas. |
| **Base de Datos Local (25%)** | **IMPLEMENTADO** | SQLite + Drizzle ORM, esquema con UUID `clientId`, CRUD completo, reactividad y métricas totales. Funciona offline. |
| **Nube y Sincronización (25%)** | **IMPLEMENTADO** | Supabase con RLS, subida idempotente de pendientes con `client_id`, descarga de productos remotos. |
| **Pantallas y Validaciones (10%)** | **IMPLEMENTADO** | Las 4 pantallas solicitadas, validación de campos, confirmación antes de eliminar con alerta. |
| **Entrega y Repositorio (15%)** | **IMPLEMENTADO** | `.env.example` incluido, `.env` fuera del repositorio, carpeta `drizzle/`, `capturas/`, `README.md` y `AI-LOG.md`. |
| **Punto Extra: Búsqueda** | **IMPLEMENTADO** | Filtro en tiempo real por nombre de producto en la pantalla principal. |
| **Punto Extra: Resolución de Conflicto** | **IMPLEMENTADO** | Regla "gana el último cambio" al descargar productos existentes sin cambios locales pendientes. |

### 📌 Limitaciones de Alcance Declaradas
- **Borrados Remotos Sincronizados:** El borrado de productos se ejecuta localmente en SQLite. No se implementó borrado lógico remoto sincronizado (`deletedAt`) ya que estaba fuera del alcance base del parcial.
- **Sincronización Automática:** La sincronización es manual a través del botón "Sincronizar" o mediante gesto de pull-to-refresh.
