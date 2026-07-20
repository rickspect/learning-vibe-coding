# Learning Vibe Coding API

Backend API sederhana untuk latihan membangun aplikasi menggunakan Bun, ElysiaJS, Drizzle ORM, dan MySQL.

Aplikasi ini menyediakan contoh fitur dasar seperti health check, todo sederhana, registrasi user, login, mengambil current user berdasarkan session token, dan logout.

## Tech Stack

- Bun sebagai runtime, package manager, dan test runner.
- TypeScript sebagai bahasa utama.
- ElysiaJS sebagai framework HTTP API.
- Drizzle ORM untuk schema database, query, dan migration.
- MySQL sebagai database.

## Library Utama

- `elysia` untuk routing dan validasi request body.
- `drizzle-orm` untuk query database.
- `drizzle-kit` untuk generate dan menjalankan migration.
- `mysql2` sebagai driver MySQL.
- `bcryptjs` untuk hash dan verifikasi password.
- `@types/bun` untuk type Bun.

## Arsitektur Project

Struktur utama project:

```text
src
  app.ts
  index.ts
  db
    client.ts
    schema.ts
  routes
    users-route.ts
  services
    users-service.ts
tests
  api.test.ts
drizzle
  *.sql
  meta
```

Penjelasan folder dan file:

- `src/app.ts` berisi definisi Elysia app, route utama, dan penggabungan route module.
- `src/index.ts` adalah entrypoint aplikasi untuk menjalankan server.
- `src/db/client.ts` berisi koneksi Drizzle ke MySQL.
- `src/db/schema.ts` berisi schema tabel database.
- `src/routes` berisi routing ElysiaJS. Format nama file menggunakan pola seperti `users-route.ts`.
- `src/services` berisi logic bisnis aplikasi. Format nama file menggunakan pola seperti `users-service.ts`.
- `tests` berisi test API menggunakan `bun test`.
- `drizzle` berisi file migration hasil generate Drizzle.

Pola sederhana yang dipakai:

- Route bertanggung jawab membaca request, menjalankan validasi, memanggil service, dan mengembalikan response.
- Service bertanggung jawab menjalankan logic bisnis dan akses database.
- Schema database didefinisikan terpusat di `src/db/schema.ts`.

## Schema Database

### `todos`

Tabel contoh untuk fitur todo sederhana.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | integer auto increment | Primary key |
| `title` | varchar(255) | Judul todo, wajib diisi |
| `created_at` | timestamp | Default current timestamp |

### `users`

Tabel user aplikasi.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | integer auto increment | Primary key |
| `name` | varchar(255) | Nama user, wajib diisi |
| `email` | varchar(255) | Email user, wajib diisi dan unique |
| `password` | varchar(255) | Hash password bcrypt, bukan password mentah |
| `created_at` | timestamp | Default current timestamp |

### `sessions`

Tabel session login user.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | integer auto increment | Primary key |
| `token` | varchar(255) | Token session berbentuk UUID |
| `user_id` | integer | Foreign key ke `users.id` |
| `created_at` | timestamp | Default current timestamp |

## Swagger

Dokumentasi interaktif API tersedia melalui Swagger UI:

```http
GET /swagger
```

OpenAPI JSON tersedia di:

```http
GET /swagger/json
```

## API yang Tersedia

### `GET /health`

Health check untuk memastikan aplikasi berjalan.

Response:

```json
{
  "status": "ok"
}
```

### `GET /todos`

Mengambil daftar todo.

### `POST /todos`

Membuat todo baru.

Request body:

```json
{
  "title": "Hello from Elysia"
}
```

Response sukses:

```json
{
  "success": true
}
```

### `POST /api/users`

Registrasi user baru.

Request body:

```json
{
  "name": "Eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

Response sukses:

```json
{
  "data": "OK"
}
```

Response jika email sudah terdaftar:

```json
{
  "error": "Email sudah terdaftar"
}
```

Catatan:

- `name`, `email`, dan `password` wajib diisi.
- Masing-masing field dibatasi maksimal 255 karakter.
- Password disimpan sebagai hash bcrypt.

### `POST /api/users/login`

Login user dan membuat session token.

Request body:

```json
{
  "email": "eko@localhost",
  "password": "rahasia"
}
```

Response sukses:

```json
{
  "data": "token"
}
```

Response jika email atau password salah:

```json
{
  "error": "Email atau password salah"
}
```

### `GET /api/users/current`

Mengambil data user yang sedang login berdasarkan session token.

Header:

```http
Authorization: Bearer <token>
```

Response sukses:

```json
{
  "data": {
    "id": 1,
    "name": "Eko",
    "email": "eko@localhost",
    "created_at": "timestamp"
  }
}
```

Response jika token tidak valid:

```json
{
  "error": "Unauthorized"
}
```

### `DELETE /api/users/logout`

Logout user dengan menghapus session token.

Header:

```http
Authorization: Bearer <token>
```

Response sukses:

```json
{
  "data": "OK"
}
```

Response jika token tidak valid:

```json
{
  "error": "Unauthorized"
}
```

## Setup Project

1. Install Bun jika belum tersedia.

2. Install dependency:

   ```bash
   bun install
   ```

3. Salin file environment:

   ```bash
   cp .env.example .env
   ```

4. Sesuaikan konfigurasi MySQL di `.env`.

   Contoh:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=learning_vibe_coding
   ```

5. Pastikan database MySQL sudah dibuat.

6. Jalankan migration:

   ```bash
   bun run db:migrate
   ```

## Menjalankan Aplikasi

Mode development dengan watch:

```bash
bun run dev
```

Mode biasa:

```bash
bun run start
```

Secara default aplikasi berjalan di port `3000`, atau mengikuti nilai `PORT` dari `.env`.

## Menjalankan Test

Test menggunakan `bun test`.

```bash
bun test
```

Test berada di folder `tests` dan mencakup API health check, todos, registrasi, login, current user, dan logout.

Pastikan database test/lokal sudah siap dan migration sudah dijalankan sebelum menjalankan test.

## Script

- `bun run dev` menjalankan server dengan watch mode.
- `bun run start` menjalankan server tanpa watch mode.
- `bun run test` menjalankan test suite.
- `bun run db:generate` membuat file migration dari schema.
- `bun run db:migrate` menjalankan migration ke MySQL.
- `bun run db:push` melakukan push schema langsung ke database.
- `bun run db:studio` membuka Drizzle Studio.

## Catatan

- Jangan commit file `.env` karena berisi konfigurasi lokal dan kredensial.
- Gunakan `.env.example` sebagai referensi konfigurasi.
- Untuk pengembangan fitur baru, ikuti pola `routes` dan `services` yang sudah ada.
