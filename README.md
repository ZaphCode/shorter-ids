# Shorter API

API REST de acortador de URLs con `Node.js`, `Express`, `TypeScript`, `JWT`, `TypeORM` y `PostgreSQL`.

La app ahora soporta:

- registro e inicio de sesion con JWT,
- suscripciones de 7 dias para poder consultar y operar tus URLs,
- endpoint de pago simulado que activa o extiende la suscripcion,
- historial de pagos por usuario,
- CRUD completo de URLs cortas con activar y desactivar,
- redireccion publica de la URL corta.

## Stack

- `Express` para la API REST
- `TypeORM` para persistencia
- `PostgreSQL` en Docker
- `jsonwebtoken` para autenticacion
- `sql.js` para pruebas en memoria

## Requisitos

- Node.js 20+
- Docker

## Configuracion

1. Instala dependencias:

```bash
pnpm install
```

2. Crea tu archivo de entorno:

```bash
cp .env.example .env
```

3. Levanta PostgreSQL con Docker:

```bash
make db-up
```

4. Inicia la API:

```bash
npm run dev
```

La API corre por defecto en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

```env
PORT=3000
APP_BASE_URL=http://localhost:3000
JWT_SECRET=super-secret-jwt
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=shorter
DB_SYNCHRONIZE=true
```

## Makefile

- `make db-up`: inicia PostgreSQL en Docker
- `make db-down`: detiene PostgreSQL
- `make dev`: corre la API en modo desarrollo
- `make test`: corre los tests

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
```

## Reglas de negocio

- El login entrega JWT aunque el usuario no tenga suscripcion activa.
- La suscripcion activa dura 7 dias.
- Si el usuario vuelve a pagar antes de vencer, la suscripcion se extiende 7 dias mas desde el vencimiento actual.
- Si la suscripcion ya vencio, se reinicia desde el momento del nuevo pago.
- Para listar, crear, consultar detalle, editar, activar, desactivar o eliminar URLs se requiere JWT y suscripcion activa.
- La redireccion publica `GET /url/:shortCode` no requiere autenticacion.

## Endpoints

### Health

`GET /health`

### Auth

#### Registrar usuario

`POST /auth/register`

```json
{
  "email": "ana@example.com",
  "password": "secreto123"
}
```

Respuesta:

```json
{
  "id": "uuid",
  "email": "ana@example.com"
}
```

#### Iniciar sesion

`POST /auth/login`

```json
{
  "email": "ana@example.com",
  "password": "secreto123"
}
```

Respuesta:

```json
{
  "token": "jwt",
  "user": {
    "id": "uuid",
    "email": "ana@example.com"
  }
}
```

### Suscripciones

#### Pagar suscripcion

`POST /subscriptions/pay`

Header:

```text
Authorization: Bearer <jwt>
```

Respuesta:

```json
{
  "subscription": {
    "id": "uuid",
    "isActive": true,
    "status": "active",
    "startsAt": "2026-06-03T20:00:00.000Z",
    "expiresAt": "2026-06-10T20:00:00.000Z"
  },
  "payment": {
    "id": "uuid",
    "subscriptionId": "uuid",
    "amountInCents": 999,
    "currency": "MXN",
    "status": "paid",
    "paidAt": "2026-06-03T20:00:00.000Z"
  }
}
```

#### Consultar suscripcion actual

`GET /subscriptions/me`

Header:

```text
Authorization: Bearer <jwt>
```

Respuesta sin suscripcion:

```json
{
  "isActive": false,
  "status": "inactive",
  "startsAt": null,
  "expiresAt": null
}
```

### Pagos

#### Historial de pagos

`GET /payments/history`

Header:

```text
Authorization: Bearer <jwt>
```

### URLs protegidas

Todos los endpoints de esta seccion requieren:

```text
Authorization: Bearer <jwt>
```

y una suscripcion activa.

#### Crear URL corta

`POST /urls`

```json
{
  "originalUrl": "https://example.com/articulo"
}
```

#### Listar mis URLs

`GET /urls`

#### Obtener una URL por id

`GET /urls/:id`

#### Actualizar URL original

`PUT /urls/:id`

```json
{
  "originalUrl": "https://openai.com/research"
}
```

#### Activar URL

`PATCH /urls/:id/activate`

#### Desactivar URL

`PATCH /urls/:id/deactivate`

#### Eliminar URL

`DELETE /urls/:id`

### Redireccion publica

`GET /url/:shortCode`

Si la URL existe y esta activa, responde con `302`.

## Estructura

```text
src/
  config/
  db/
  modules/
    auth/
    payments/
    subscriptions/
    urls/
  shared/
  utils/
```

## Verificacion

Los cambios fueron verificados con:

```bash
npm test
npm run build
```
