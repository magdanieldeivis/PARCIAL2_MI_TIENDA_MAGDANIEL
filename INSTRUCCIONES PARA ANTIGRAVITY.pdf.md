INSTRUCCIONES PARA ANTIGRAVITY + GEMINI PROYECTO: MI TIENDA — INVENTARIO MÓVIL CON BASE DE DATOS LOCAL Y EN LA NUBE ENTORNO: VISUAL STUDIO CODE + EXPO GO (SDK/EXPO 58, SI ESTÁ DISPONIBLE EN EL ENTORNO)

IMPORTANTE SOBRE EL ENFOQUE Este documento convierte los requisitos del parcial “Mi Tienda” en una especificación para que Antigravity, con ayuda de Gemini, construya el proyecto de forma organizada. La guía original indica Expo con TypeScript, Expo Router, SQLite con Drizzle ORM y Supabase. No asumas que Expo SDK 58 está publicado o que todas las bibliotecas son compatibles con esa versión: primero verifica las versiones disponibles y compatibles en la fecha de implementación. Si SDK 58 no está disponible en el entorno, informa claramente y usa la versión compatible que indique el docente; no inventes compatibilidad. El proyecto debe ser comprensible y ejecutable, no solo una maqueta visual.

DEBES ACTUALIZAR EXPO A LA VERSION 58

============================================================

1. OBJETIVO GENERAL ============================================================ Construye una aplicación móvil llamada “Mi Tienda” para que el tendero de una tienda de barrio en Riohacha pueda administrar productos sin depender permanentemente de Internet. La aplicación debe:
- Permitir registro e inicio de sesión con correo y contraseña.
- Mantener la sesión al cerrar y volver a abrir la app.

- Guardar siempre los productos primero en una base de datos local SQLite.
- Permitir crear, consultar, editar y eliminar productos incluso en modo avión.
- Mostrar los productos guardados localmente y el estado de sincronización de cada uno.
- Permitir sincronizar manualmente con Supabase cuando haya conexión.
- Descargar de Supabase productos que estén en la nube y no existan localmente.
- Subir los productos locales pendientes sin duplicarlos.
- Incluir documentación, capturas y registro del uso de IA.
- Poder ejecutarse desde Visual Studio Code y probarse en un teléfono con Expo Go. No entregues únicamente pantallas estáticas. Los botones, formularios, operaciones de base de datos y mensajes deben funcionar de verdad. ============================================================
2. TECNOLOGÍAS Y RESTRICCIONES ============================================================ Usa:
- React Native con Expo.
- TypeScript con tipado estricto. Evita “any”.
- Expo Router para navegación.
- SQLite como fuente local de verdad.
- Drizzle ORM para el esquema, migraciones y acceso a SQLite.
- Supabase Auth para autenticación.
- Supabase Database para respaldo remoto.
- Expo SecureStore para persistir la sesión.
- UUID para identificar productos entre teléfono y nube.

- Git y GitHub para control de versiones y entrega. Antes de instalar paquetes:
1. Comprueba qué versión de Expo SDK está realmente disponible y cuál funciona con Expo Go instalado en el dispositivo.
2. Verifica compatibilidad entre Expo, expo-router, expo-sqlite, drizzle-orm, drizzle-kit, @supabase/supabase-js, expo-secure-store y las herramientas de configuración.
3. Usa los comandos de instalación compatibles con la versión elegida, por ejemplo “npx expo install” para paquetes Expo cuando corresponda.
4. No actualices dependencias indiscriminadamente ni mezcles versiones incompatibles.
5. Si una dependencia o API no es compatible, explica el problema y propone una alternativa compatible antes de cambiar la arquitectura. El proyecto debe poder arrancar con:
- npm install (o el procedimiento coherente con el lockfile generado)
- npx expo start No inventes comandos que no correspondan a las versiones instaladas. ============================================================
3. FLUJO DE TRABAJO QUE DEBE SEGUIR LA IA ============================================================ Trabaja directamente sobre la carpeta abierta en Visual Studio Code. FASE A — INSPECCIÓN Y PLAN
- Inspecciona los archivos existentes antes de modificarlos.
- Identifica si ya existe un proyecto Expo y conserva lo útil.

- Presenta un resumen breve de la estructura propuesta.
- No borres archivos ni sobrescribas configuración existente sin explicar por qué.
- Implementa por etapas y verifica errores después de cada etapa. FASE B — PROYECTO Y DEPENDENCIAS
- Configura Expo Router y TypeScript.
- Configura SQLite y Drizzle.
- Configura Supabase.
- Configura SecureStore para persistir la sesión.
- Configura variables de entorno y .gitignore.
- Genera los archivos de configuración necesarios según las versiones reales. FASE C — BASE LOCAL
- Implementa el esquema de productos.
- Genera una migración de Drizzle.
- Aplica la migración correctamente.
- Crea un repositorio de datos para CRUD.
- Expón los datos a las pantallas mediante hooks; las pantallas no deben consultar Drizzle directamente.
- Implementa una lista reactiva con useLiveQuery si la versión compatible de expo-sqlite/drizzle lo permite. Si la API disponible cambia, usa una alternativa reactiva compatible y documenta la decisión. FASE D — AUTENTICACIÓN Y NAVEGACIÓN
- Implementa registro, login y cierre de sesión.
- Mantén la sesión con SecureStore.
- Protege las rutas de acuerdo con el estado de autenticación.

- Sin sesión: solo Login y Registro.
- Con sesión: Principal y Formulario de producto.
- Evita que las pantallas protegidas se puedan abrir mediante navegación directa cuando no hay sesión. FASE E — INTERFAZ Y OPERACIONES
- Implementa las cuatro pantallas obligatorias.
- Implementa validaciones, estados de carga, errores y confirmaciones.
- Crea y edita productos en SQLite.
- Elimina con confirmación.
- Calcula totales usando los datos locales.
- Muestra visualmente qué productos están pendientes y cuáles sincronizados. FASE F — SINCRONIZACIÓN
- Implementa la descarga desde Supabase y después la subida de productos pendientes, en ese orden.
- Respeta el usuario autenticado y las políticas RLS.
- Evita duplicados mediante client_id.
- Marca los registros sincronizados solo cuando la operación remota haya sido exitosa.
- Muestra el resultado o un error entendible. FASE G — PRUEBAS Y ENTREGA
- Ejecuta comprobaciones de TypeScript y revisa errores del bundler.
- Verifica las rutas, operaciones CRUD, persistencia de sesión y sincronización.
- Prepara README.md, AI-LOG.md, .env.example y carpeta capturas/.
- Deja el repositorio listo para subir a GitHub, sin secretos.

- No afirmes que algo fue probado si no lo ejecutaste realmente. ============================================================
4. ESTRUCTURA SUGERIDA DEL PROYECTO ============================================================ Usa una estructura clara como la siguiente, adaptándola a las APIs compatibles: app/ _layout.tsx login.tsx registro.tsx index.tsx producto.tsx db/ schema.ts index.ts drizzle/ repositories/ products.ts hooks/ useProducts.ts context/

AuthContext.tsx

lib/ supabase.ts secureStorage.ts

services/ sync.ts

types/ index.ts

drizzle/ [migraciones generadas]

capturas/ 01-login.png 02-registro.png 03-principal.png 04-formulario.png 05-sin-conexion.png 06-sincronizado.png 07-supabase.png

.env.example .gitignore

README.md AI-LOG.md drizzle.config.ts package.json tsconfig.json

Si la versión instalada requiere otra organización, adapta la estructura sin perder la separación entre pantallas, contexto, repositorio local y servicio de sincronización.

============================================================

5. PANTALLAS OBLIGATORIAS ============================================================
5.1 LOGIN — app/login.tsx Debe mostrar:
- Nombre o logotipo textual “Mi Tienda”.
- Campo de correo electrónico.
- Campo de contraseña.
- Botón “Ingresar”.
- Enlace “Crear cuenta” que navegue a Registro.
- Mensaje visible si las credenciales fallan.
- Indicador de carga mientras inicia sesión.
- Validación básica del correo y campos obligatorios.
- No imprimir contraseñas ni tokens en consola. Al iniciar sesión correctamente, navegar a la pantalla principal.

5.2 REGISTRO — app/registro.tsx Debe mostrar:
- Campo de correo.
- Campo de contraseña.
- Campo de confirmar contraseña.
- Botón “Crear cuenta”.
- Enlace para volver al login.
- Validar que las contraseñas coincidan.
- Validar mínimo 6 caracteres en la contraseña.
- Mostrar errores claros.
- Evitar dobles envíos mientras procesa la petición. Usa Supabase Auth signUp. La guía del parcial indica desactivar la confirmación por correo en el proveedor Email para que el registro pueda iniciar sesión inmediatamente. Si la configuración real no lo permite, muestra un mensaje honesto para revisar el correo o la configuración; no simules que el usuario quedó autenticado.
5.3 PRINCIPAL / INVENTARIO — app/index.tsx Debe mostrar:
- Título “Mi Tienda — Inventario”.
- Lista de productos de SQLite.
- Cada fila debe mostrar nombre, cantidad, precio en pesos colombianos y estado de sincronización.
- Total de unidades sumando quantity.
- Valor total del inventario calculado como suma de quantity × price.
- Cantidad de productos pendientes de sincronización.

- Botón “Agregar producto”.
- Botón “Sincronizar”.
- Botón “Cerrar sesión”.
- Mensajes de carga, lista vacía, error y resultado de sincronización. La lista y los totales deben actualizarse cuando cambien los registros locales. Formatea los valores en pesos colombianos sin decimales. Indicadores sugeridos:
- “Sincronizado” cuando syncedAt no sea nulo y sea igual o posterior a updatedAt.
- “Pendiente” cuando syncedAt sea nulo o anterior a updatedAt. Al seleccionar un producto, abrir el formulario en modo edición con su ID local. Para eliminar, implementar una acción clara y pedir confirmación, por ejemplo con Alert o una acción accesible equivalente.
5.4 FORMULARIO DE PRODUCTO — app/producto.tsx Debe servir para crear y editar:
- Nombre del producto.
- Cantidad de unidades.
- Precio en pesos colombianos, sin decimales.
- Botón Guardar.
- Botón Cancelar o Volver.
- Si recibe un id por parámetros de ruta, cargar el producto existente.
- Validar nombre obligatorio.
- Cantidad: entero mayor o igual a 0.
- Precio: entero mayor o igual a 0.

- Mostrar errores junto al campo o en un mensaje visible.
- Al guardar, escribir primero en SQLite.
- Cada creación o edición debe actualizar updatedAt.
- Cada creación debe generar clientId UUID.
- No marcar como sincronizado un cambio que aún no se ha subido. ============================================================
6. MODELO DE DATOS LOCAL: SQLITE + DRIZZLE ============================================================ La tabla local products debe tener estas columnas:
- id: entero autoincremental, clave primaria local.
- clientId: texto único con UUID; identifica el mismo producto en el dispositivo y en la nube.
- name: texto obligatorio.
- quantity: entero obligatorio.
- price: entero obligatorio.
- updatedAt: timestamp en milisegundos.
- syncedAt: timestamp en milisegundos opcional/nulo. Reglas:
- SQLite es la fuente de verdad para las operaciones normales de la aplicación.
- Todas las lecturas de inventario vienen de SQLite.
- Todas las creaciones, ediciones y eliminaciones locales se hacen en SQLite.
- No reemplazar SQLite con arrays en memoria ni AsyncStorage.
- No usar AsyncStorage para persistir la sesión: usar SecureStore.

- Generar el UUID en el repositorio o capa de servicio, no dentro de db/schema.ts si eso provoca errores de drizzle-kit al ejecutar con Node.
- Si se usa expo-crypto, importarlo en el repositorio o servicio según la API compatible; nunca introducir dependencias de Expo en el archivo de esquema que drizzle-kit evalúa con Node.
- Generar migraciones con drizzle-kit y aplicarlas mediante el mecanismo compatible con la versión instalada, por ejemplo useMigrations cuando corresponda.
- Mantener las operaciones de base de datos fuera de las pantallas. Regla de producto pendiente: syncedAt es nulo O syncedAt < updatedAt. Para editar:
- Actualizar los campos modificados.
- Actualizar updatedAt con la fecha/hora actual.
- Conservar syncedAt como estaba para que el producto quede pendiente si hubo un cambio nuevo. Para crear:
- Generar clientId UUID único.
- Asignar updatedAt actual.
- Dejar syncedAt nulo. IMPORTANTE: el enunciado del parcial no exige sincronización de borrados. No implementes borrado remoto como si estuviera resuelto sin diseñar un mecanismo. El alcance base permite eliminar localmente y pide confirmación. Documenta esta limitación en README. ============================================================

7. SUPABASE: CONFIGURACIÓN REMOTA ============================================================ Crea un proyecto propio de Supabase. No reutilices las credenciales de otra persona. Variables locales: EXPO_PUBLIC_SUPABASE_URL= EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY= Crea un archivo .env local con esos valores. No lo subas a GitHub. Incluye en el repositorio solo .env.example con valores vacíos o marcadores de ejemplo. Nunca incluir:
- Secret key de Supabase.
- Contraseña de la base de datos.
- Tokens de sesión.
- Credenciales personales.
- El archivo .env real. La app solo debe usar la publishable key. Activa RLS y crea políticas para que cada usuario autenticado solo pueda ver, insertar, actualizar y borrar sus propios productos. Ejecuta en el SQL Editor de Supabase el siguiente SQL, verificando el resultado antes de continuar:
## CREATE TABLE public.products (

id bigint generated always as identity primary key, user_id uuid not null default auth.uid() references auth.users (id) on delete cascade, client_id uuid not null unique, name text not null, quantity integer not null check (quantity >= 0), price integer not null check (price >= 0), updated_at timestamptz not null, created_at timestamptz not null default now() );

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ver los míos" ON public.products FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crear los míos" ON public.products FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "editar los míos" ON public.products FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "borrar los míos" ON public.products FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

No intentes ejecutar este SQL automáticamente desde la app móvil. El usuario debe ejecutarlo en el panel SQL de su propio proyecto.

En la configuración del proveedor Email de Supabase Auth, revisa la confirmación por correo. Para el flujo inmediato de registro que describe el parcial, el documento del curso indica desactivarla antes de probar.

============================================================

8. SESIÓN Y RUTAS PROTEGIDAS ============================================================ Implementa Supabase Auth con:
- signUp para registro.
- signInWithPassword para login.
- signOut para cerrar sesión.
- Listener de cambios de autenticación.
- Persistencia de sesión mediante SecureStore. Crea lib/secureStorage.ts con un adaptador compatible con la versión de Supabase JS instalada. No supongas una firma de API sin verificarla. Configura rutas protegidas con Stack.Protected si está disponible y es compatible con la versión de Expo Router instalada. El comportamiento requerido:
- Usuario no autenticado: login y registro.

- Usuario autenticado: principal e interfaz de productos.
- Al cerrar sesión, limpiar el estado de autenticación y redirigir a login.
- Al reiniciar la app, restaurar la sesión desde SecureStore antes de decidir la ruta.
- Mostrar una pantalla de carga mientras se comprueba la sesión para evitar parpadeos o redirecciones incorrectas. ============================================================
9. SERVICIO DE SINCRONIZACIÓN ============================================================ Crea services/sync.ts con una función equivalente a syncProducts(userId). La sincronización manual debe ejecutarse en este orden: PASO 1 — DESCARGAR
- Consultar en Supabase los productos que el usuario autenticado puede leer.
- Si hay error de red o de Supabase, detener la sincronización y mostrar un error comprensible.
- Para cada producto remoto, buscar en SQLite por clientId/client_id.
- Si no existe localmente, insertarlo en SQLite.
- Convertir correctamente updated_at a Date o timestamp local.
- Marcar el producto descargado como sincronizado: syncedAt debe reflejar la versión remota descargada.
- No duplicar productos al pulsar Sincronizar varias veces. PASO 2 — SUBIR
- Consultar productos locales pendientes: syncedAt nulo o syncedAt anterior a updatedAt.

- Para cada producto pendiente, enviar client_id, name, quantity, price y updated_at a Supabase.
- Usar upsert con onConflict: 'client_id' para evitar duplicados.
- El registro remoto debe pertenecer al usuario autenticado; verifica cómo se asigna user_id mediante el default auth.uid() y el contexto de sesión.
- Solo después de confirmar que el upsert fue exitoso, marcar en SQLite syncedAt con la fecha de updatedAt que realmente se subió.
- No marcar como sincronizado si la subida falla.
- Gestionar los errores por operación y mostrar un mensaje final. Resultado sugerido: “Sincronización completada: 2 productos subidos y 1 descargado”. Si no hay cambios: “Todo está sincronizado”. Si no hay internet: “No se pudo sincronizar. Tus datos siguen guardados en este dispositivo”. IMPORTANTE SOBRE CONFLICTOS: El enunciado base no exige resolución de conflictos. No sobrescribas silenciosamente una versión local pendiente con una versión remota. Si detectas que existe el mismo clientId con cambios locales pendientes, conserva el dato local y documenta que la resolución avanzada de conflictos está fuera del alcance, salvo que implementes de forma correcta la regla opcional de “gana el último cambio”. La sincronización descrita por el parcial no incluye borrados sincronizados ni sincronización automática al recuperar internet. ============================================================
10. SEGURIDAD Y MANEJO DE ERRORES ============================================================

- La publishable key puede estar en la app; una secret key nunca. -.env debe estar en .gitignore.
- No registrar contraseñas, tokens ni claves en consola.
- No desactivar RLS para “hacer que funcione”.
- No permitir acceso a productos de otro usuario.
- Validar los datos tanto en la interfaz como en la base de datos.
- Mostrar errores de autenticación, base local y sincronización en lenguaje claro.
- Evitar que un error remoto borre o invalide el inventario local.
- No simular conexión, sincronización o persistencia.
- No reemplazar las funciones faltantes con datos ficticios sin indicarlo.
- Mantener la app usable si Supabase no responde: el CRUD local debe seguir funcionando. ============================================================
11. DISEÑO VISUAL ============================================================ Diseño claro, moderno y fácil de usar; la prioridad es funcionalidad y legibilidad.
- Idioma: español.
- Nombre visible: “Mi Tienda”.
- Moneda: pesos colombianos (COP), sin decimales.
- Campos con etiquetas claras.
- Botones con texto explícito.
- Contraste suficiente y tamaños táctiles adecuados.
- Estados vacíos y errores visibles.
- Indicadores de sincronización comprensibles.

- No sacrificar la funcionalidad por animaciones o decoración. ============================================================
12. PRUEBAS FUNCIONALES OBLIGATORIAS ============================================================
## Realiza y documenta estas pruebas:

1. Registro:
- Contraseñas diferentes: debe impedir el registro y mostrar mensaje.
- Contraseña de menos de 6 caracteres: debe mostrar validación.
- Registro válido: debe responder según la configuración de Supabase.
2. Login:
- Credenciales incorrectas: error visible.
- Credenciales correctas: abrir inventario.
- Cerrar y volver a abrir la app: restaurar sesión.
3. CRUD local:
- Crear un producto.
- Editarlo.
- Eliminarlo y confirmar.
- Verificar que la lista y los totales se actualizan.
- Reiniciar la app y verificar que los datos locales persisten.
4. Modo avión:

- Con la sesión ya iniciada, activar modo avión.
- Crear un producto y verificar que aparece como pendiente.
- Editarlo y verificar que sigue pendiente.
- La aplicación no debe bloquear el CRUD local por un fallo de internet.
5. Sincronización:
- Recuperar internet.
- Pulsar Sincronizar.
- Verificar que los pendientes suben.
- Verificar que los productos remotos que faltan se descargan.
- Pulsar Sincronizar otra vez y comprobar que no hay duplicados.
- Revisar la tabla products en Supabase.
6. Seguridad:
- Verificar que no se subió .env.
- Verificar que solo está configurada la publishable key en la app.
- Revisar que RLS y sus cuatro políticas estén activas.
No declares una prueba aprobada si no se realizó en el entorno real. Distingue entre “implementado”, “verificado” y “pendiente de probar”.

============================================================

13. GITHUB Y ENTREGA ============================================================
## Nombre sugerido del repositorio público:

parcial-mi-tienda-<apellido>

La entrega del parcial pide:

- Repositorio público en GitHub.
- Al menos 4 commits descriptivos, idealmente uno por cada bloque de trabajo.
- Carpeta drizzle/ con migraciones. -.env.example incluido. -.env excluido.
- README.md con instrucciones y capturas.
- AI-LOG.md con registro del uso de IA.
- Siete capturas dentro de capturas/. Capturas requeridas:
1. capturas/01-login.png — pantalla de login.
2. capturas/02-registro.png — registro con mensaje de validación visible.
3. capturas/03-principal.png — al menos tres productos, totales e indicadores.
4. capturas/04-formulario.png — formulario editando un producto existente.
5. capturas/05-sin-conexion.png — producto creado en modo avión, pendiente.
6. capturas/06-sincronizado.png — pantalla tras sincronizar con mensaje de resultado.
7. capturas/07-supabase.png — tabla products en Supabase con filas del usuario. No generes capturas falsas ni afirmes que muestran una prueba real si no fueron tomadas de la app ejecutándose. Si Antigravity no puede acceder al teléfono, deja instrucciones concretas para tomarlas manualmente.
## README.md debe incluir:

- Nombre completo y código del estudiante, dejando marcadores para que el usuario los complete si no se conocen.
- Descripción del proyecto.
- Requisitos y versiones utilizadas.
- Cómo crear .env a partir de .env.example.
- Cómo ejecutar el SQL de Supabase.
- Cómo instalar y arrancar el proyecto.
- Las siete capturas con enlaces Markdown.
- Qué funciona y qué queda pendiente. AI-LOG.md debe registrar:
- Herramienta utilizada: Antigravity y Gemini (si efectivamente se usaron).
- Un prompt representativo.
- Qué partes del código generado fueron revisadas o corregidas.
- Errores detectados o posibles alucinaciones.
- Qué pruebas se ejecutaron realmente. No inventes correcciones ni pruebas: registra lo ocurrido. Antes del push:
- Revisar git status.
- Confirmar que .env no esté rastreado.
- Buscar claves secretas y contraseñas en los archivos.
- Confirmar que las migraciones estén incluidas.
- Verificar que el README no tenga enlaces rotos.
- Subir los cambios a GitHub y comprobar que el repositorio sea público.

============================================================

14. ORDEN DE IMPLEMENTACIÓN PRIORITARIO ============================================================ Prioridad 1:
- Proyecto arranca en Expo Go.
- Login, registro, sesión persistente y rutas protegidas.
- SQLite + Drizzle con migración real.
- CRUD local completo y reactivo.
- Totales correctos.
- Sincronización manual bidireccional básica.
- Seguridad de Supabase y .env. Prioridad 2:
- Mensajes y validaciones detallados.
- Diseño visual pulido.
- README y AI-LOG.
- Capturas reales.
- Commits y push. Prioridad 3 (solo si lo anterior funciona):
- Búsqueda por nombre.
- Resolución de conflictos con regla “gana el último cambio”.
- Borrado lógico sincronizado.
- Sincronización automática al recuperar conexión.

No empieces por puntos extra. No gastes el tiempo construyendo decoración antes de que el almacenamiento local, autenticación y sincronización funcionen.

============================================================

15. INSTRUCCIÓN FINAL PARA ANTIGRAVITY ============================================================ Implementa esta aplicación en la carpeta de trabajo abierta en Visual Studio Code. Primero inspecciona el proyecto y comprueba las versiones reales de Expo y sus dependencias. Después implementa por etapas, conservando lo que ya funciona. No te limites a responder con una explicación: crea y modifica los archivos del proyecto. Tras cada etapa, ejecuta las verificaciones que el entorno permita, corrige los errores reales y resume:
- Archivos creados o modificados.
- Comandos ejecutados.
- Resultado de las comprobaciones.
- Problemas que requieren intervención manual.
- Pasos concretos que debo realizar en Supabase, Expo Go y GitHub. No inventes credenciales, URLs, pruebas, capturas, commits ni resultados. Si necesitas que yo realice una acción externa, detente en ese punto y dame pasos claros. No incluyas el archivo .env ni claves secretas en el repositorio. Al terminar, entrega una lista de verificación indicando para cada requisito: IMPLEMENTADO, VERIFICADO o PENDIENTE. El objetivo es que el proyecto sea entendible y defendible por el estudiante, no una caja negra.