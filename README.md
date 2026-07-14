# Learning Vibe Coding API

Backend sederhana menggunakan Bun, ElysiaJS, Drizzle, dan MySQL.

## Tech Stack

- Bun sebagai runtime dan package manager.
- ElysiaJS sebagai framework HTTP API.
- Drizzle ORM untuk schema, query, dan migration.
- MySQL sebagai database.

## Setup

1. Install dependency:

   ```bash
   bun install
   ```

2. Salin `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi MySQL.

3. Buat migration awal dari schema:

   ```bash
   bun run db:generate
   ```

4. Jalankan migration ke database:

   ```bash
   bun run db:migrate
   ```

5. Jalankan server development:

   ```bash
   bun run dev
   ```

## Endpoint Awal

- `GET /health` untuk memastikan server berjalan.
- `GET /todos` untuk membaca contoh data dari MySQL.
- `POST /todos` untuk membuat contoh data baru.
- `POST /api/users` untuk registrasi user baru.

Contoh body untuk `POST /todos`:

```json
{
  "title": "Hello from Elysia"
}
```

Contoh body untuk `POST /api/users`:

```json
{
  "name": "Eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

## Script

- `bun run dev` menjalankan server dengan watch mode.
- `bun run start` menjalankan server tanpa watch mode.
- `bun run db:generate` membuat file migration dari schema.
- `bun run db:migrate` menjalankan migration ke MySQL.
- `bun run db:push` melakukan push schema langsung ke database.
- `bun run db:studio` membuka Drizzle Studio.

## Catatan

Jangan commit file `.env` karena berisi kredensial lokal. Gunakan `.env.example` sebagai referensi konfigurasi.
