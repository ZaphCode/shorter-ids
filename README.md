# Shorter API

API basica con Node.js, Express y TypeScript para registrar usuarios, verificarlos y administrar URLs cortas.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
```

Por defecto la API corre en `http://localhost:3000`.

## Notas de implementacion

- Los datos se guardan en memoria usando `Map`, por lo que se reinician al apagar el servidor.
- La contrasena se guarda hasheada con `crypto.scryptSync` y salt aleatorio.
- `isVerified` inicia en `false`.
- El codigo de verificacion temporal es `123456`.
- Las URLs cortas inician con `isActive: true`.
- Para evitar colisiones, el codigo corto se regenera mientras ya exista en el mapa `urlsByCode`.

## Endpoints

### Registro de usuario

`POST /users/register`

```json
{
  "email": "ana@example.com",
  "password": "secreto123"
}
```

### Iniciar sesion

`POST /users/login`

```json
{
  "email": "ana@example.com",
  "password": "secreto123"
}
```

Respuesta si es valido:

```json
{
  "isValidUser": true
}
```

### Verificar usuario

`POST /users/verify`

```json
{
  "email": "ana@example.com",
  "code": "123456"
}
```

### Registrar URL

`POST /url`

```json
{
  "email": "ana@example.com",
  "originalUrl": "https://example.com/articulo"
}
```

Respuesta:

```json
{
  "id": "uuid",
  "userEmail": "ana@example.com",
  "originalUrl": "https://example.com/articulo",
  "shortCode": "abc123X",
  "shortUrl": "http://localhost:3000/url/abc123X",
  "isActive": true
}
```

### Consultar URL

`GET /url/:shortCode`

Ejemplo:

```bash
curl -i http://localhost:3000/url/abc123X
```

Si esta activa, responde con redireccion `302` hacia la URL original.

### Desactivar URL

`PATCH /url/:id/deactivate`

### Activar URL

`PATCH /url/:id/activate`
