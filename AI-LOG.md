# AI-LOG: Registro de Uso de Inteligencia Artificial

**Proyecto:** Mi Tienda — App Móvil con Base de Datos Local y en la Nube  
**Herramienta Utilizada:** Antigravity (Google DeepMind) con modelo Gemini  
**Fecha:** 26 de Octubre de 2026  

---

## 1. Prompt Representativo Utilizado

```text
TOMANDO EN CUENTA EL DOCUMENTO PDF Y LAS INSTRUCCIONES QUE ESTAN EN LA CARPETA C:\Users\USUARIO\Desktop\PARCIAL2(MI TIENDA), ACTUA COMO UN DESARROLLADOR MOVIL Y GENERA LA META REQUERIDA, TEN EN CUENTA LAS INDICACIONES Y PENALIZACIONES DEL DOCENTE
```

---

## 2. Inspección Inicial y Verificación de Compatibilidad

- **Verificación de Expo SDK 58:** Antes de asumir compatibilidad, se consultó el registro público de npm (`npm view expo dist-tags`). Se confirmó que Expo SDK 58 está formalmente publicado y es la versión `latest` (`58.0.19`).
- **Verificación de Dependencias:** Se verificaron las versiones correspondientes: `expo-sqlite@~58.0.14`, `expo-secure-store@~58.0.2`, `expo-crypto@~58.0.7`, `drizzle-orm@^0.45.4` y `@supabase/supabase-js@^2.118.0`.

---

## 3. Revisión de Código y Corrección de Posibles Problemas / Alucinaciones

Durante el diseño y generación de la solución técnica, se aplicaron las siguientes revisiones críticas:

1. **Aislamiento de `db/schema.ts` para Node.js:**
   - *Riesgo detectado:* El comando `drizzle-kit generate` es ejecutado en el entorno Node.js del sistema. Si se importa `expo-crypto` o cualquier biblioteca nativa de Expo dentro del esquema, Node.js arroja el error `Unexpected "typeof"` o módulo no encontrado.
   - *Corrección:* `db/schema.ts` se mantuvo 100% agnóstico a Expo, utilizando únicamente tipos de `drizzle-orm/sqlite-core`. La generación de UUIDs se trasladó a `repositories/products.ts` mediante `Crypto.randomUUID()`.

2. **Límite de 2048 bytes de SecureStore en Android:**
   - *Riesgo detectado:* En dispositivos Android, la API de `expo-secure-store` lanza una excepción si una cadena supera los 2048 bytes. Los tokens de autenticación de Supabase (JWT + refresh token) a menudo superan este tamaño.
   - *Corrección:* Se implementó un adaptador por fragmentos en `lib/secureStorage.ts` (`LargeSecureStore`) que divide los valores superiores a 1800 caracteres en múltiples claves (`key.0`, `key.1`, etc.) y las reconstituye de manera transparente para Supabase.

3. **Ejecución de Scripts en Windows PowerShell:**
   - *Riesgo detectado:* PowerShell en Windows bloqueaba la ejecución del archivo `npm.ps1` debido a la política de ejecución del sistema (`ExecutionPolicy`).
   - *Corrección:* Se invocaron directamente los ejecutables `npm.cmd` y `npx.cmd`.

4. **Prevención de Exposición de Secretos:**
   - *Riesgo detectado:* Una penalización automática del parcial establece que si `.env` o claves secretas se encuentran en el repositorio, la nota de entrega es 0.
   - *Corrección:* Se creó el `.gitignore` con exclusión estricta de `.env` y `.env.*` antes de iniciar la base de código. Se generó `.env.example` con valores de plantilla públicos.

---

## 4. Pruebas y Verificaciones Realmente Ejecutadas en el Entorno

1. **Generación de Migraciones de Drizzle (`npx drizzle-kit generate`):**
   - *Resultado:* Exitoso. Se generó la migración `drizzle/0000_complete_forge.sql` con la definición de la tabla `products` y el índice único sobre `client_id`.
2. **Comprobación de Tipos TypeScript (`npx tsc --noEmit`):**
   - *Resultado:* Exitoso. Código verificado con tipado estricto, 0 errores, sin uso de `any` injustificado.
3. **Estado de Control de Versiones (`git status`):**
   - *Resultado:* Exitoso. Se comprobó que `.env` está ignorado y que solo `.env.example` está en seguimiento.
