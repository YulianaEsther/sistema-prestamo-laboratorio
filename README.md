# Sistema de préstamos de equipos de laboratorio

API REST desarrollada con Node.js, npm, Express, MySQL, Sequelize y JWT. Gestiona equipos, préstamos, devoluciones e historial. Los nombres de prestatarios de las pruebas deben ser ficticios.

## Requisitos

- Node.js 20 o superior y npm.
- MySQL 8 (o compatible) en ejecución.
- Crear una base vacía, por ejemplo: `CREATE DATABASE prestamos_laboratorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

## Instalación y ejecución

1. Copiar `.env.example` como `.env` y completar las credenciales de MySQL. Reemplazar `JWT_SECRET` por un secreto aleatorio de al menos 32 caracteres; no compartir ni subir `.env`.
2. Ejecutar `npm install`.
3. Crear la base de datos configurada en `DB_NAME`.
4. Ejecutar `npm run db:migrate` para crear las tablas con migraciones.
5. (Opcional) Ejecutar `npm run db:seed` para cargar el usuario y equipos ficticios de demostración.
6. Ejecutar `npm start`; durante desarrollo se puede usar `npm run dev`. La API queda disponible en `http://localhost:3000`.

Usuario ficticio de demostración: `admin@laboratorio.test` / `Laboratorio123!`. Cambiar o eliminar estos datos en entornos reales.

## Modelo de datos

- `users`: cuentas autenticables; `password_hash` guarda bcrypt, nunca la contraseña.
- `equipment`: código único, nombre, categoría y condición (`operativo`, `mantenimiento` o `danado`).
- `loans`: cada préstamo referencia un equipo y al usuario autenticado que lo registró. `returned_at` indica devolución.
- `equipment` tiene muchos `loans`; `users` tiene muchos préstamos registrados.

`active_equipment_id` vale el ID del equipo mientras el préstamo está activo y `NULL` al devolverlo. Su índice único en MySQL impide dos préstamos simultáneos del mismo equipo incluso ante solicitudes concurrentes. El borrado de equipos con historial devuelve `409`.

## Rutas

Todas las respuestas están en JSON. Las rutas de equipos y préstamos requieren `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/api/health` | Público | Comprobar disponibilidad |
| POST | `/api/auth/register` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener JWT |
| GET | `/api/equipment` | JWT | Listar equipos y disponibilidad |
| POST | `/api/equipment` | JWT | Registrar equipo |
| GET | `/api/equipment/:id` | JWT | Consultar equipo |
| PUT/PATCH | `/api/equipment/:id` | JWT | Actualizar equipo |
| DELETE | `/api/equipment/:id` | JWT | Eliminar solo si no tiene historial |
| GET | `/api/equipment/:id/history` | JWT | Historial de un equipo |
| POST | `/api/loans` | JWT | Registrar préstamo |
| GET | `/api/loans/active` | JWT | Consultar préstamos activos |
| PATCH | `/api/loans/:id/return` | JWT | Registrar devolución |

### Códigos de respuesta principales

- `200`: consulta o actualización correcta; `201`: creación correcta.
- `400`: datos ausentes o inválidos (incluye `details` por campo).
- `401`: credenciales incorrectas o token ausente, inválido o expirado.
- `404`: equipo, préstamo o ruta inexistente.
- `409`: código/correo duplicado, equipo ya prestado, devolución repetida o eliminación con historial.
- `500`: error inesperado del servidor; se registra en la consola del servidor.

### Ejemplos de prueba (Postman, Insomnia o curl)

1. **Registro** — `POST /api/auth/register`, JSON:
   ```json
   { "name": "Usuario Demostración", "email": "persona@ejemplo.test", "password": "ClaveFicticia123" }
   ```
   Esperado: `201`, usuario sin hash de contraseña.
2. **Inicio de sesión** — `POST /api/auth/login` con el correo y la contraseña de arriba (o el usuario seed). Esperado: `200` y `token`.
3. **Equipo** — `POST /api/equipment` con Bearer token:
   ```json
   { "code": "LAB-PIP-004", "name": "Pipeta de prueba", "category": "Volumetría", "condition": "operativo" }
   ```
   Esperado: `201`; repetir el código devuelve `409`.
4. **Préstamo** — `POST /api/loans` con Bearer token:
   ```json
   { "equipmentId": 1, "borrowerName": "Estudiante Ficticio", "loanDate": "2026-11-02", "dueDate": "2026-11-05" }
   ```
   Esperado: `201`; intentar prestar el equipo 1 nuevamente antes de devolverlo da `409`.
5. **Activos e historial** — `GET /api/loans/active` y `GET /api/equipment/1/history`, ambos autenticados. El historial conserva también los préstamos ya devueltos.
6. **Devolución** — `PATCH /api/loans/1/return`. Esperado: `200`; el equipo vuelve a estar disponible y puede prestarse de nuevo. Repetir la devolución da `409`.
7. **Validación y protección** — una solicitud sin token a `/api/equipment` da `401`; enviar una categoría vacía o fecha prevista anterior a la fecha de préstamo da `400`. Eliminar un equipo con historial da `409`.

Utilicen únicamente usuarios y prestatarios ficticios al demostrar el sistema. `npm test` ejecuta las pruebas automatizadas independientes de MySQL.

## Organización colaborativa y sustentación

Completen esta tabla con las personas reales del grupo y registren aportes individuales en commits del repositorio:

| Integrante | Responsabilidad | Evidencia/commit |
|---|---|---|
| Integrante 1: completar | Modelos, relaciones y migraciones | Completar |
| Integrante 2: completar | Autenticación JWT y usuarios | Completar |
| Integrante 3: completar | API de equipos y préstamos | Completar |
| Integrante 4: completar | Pruebas, documentación y demostración | Completar |

Preguntas guía: Node.js ejecuta JavaScript en el servidor; Express facilita rutas y middleware HTTP. Un middleware procesa una solicitud antes de su controlador, por ejemplo para verificar JWT. Las migraciones guardan cambios versionados y reproducibles del esquema. El middleware valida el JWT con el secreto y verifica expiración, emisor y audiencia. Un índice único sobre `active_equipment_id`, junto con transacciones, impide préstamos activos duplicados.
