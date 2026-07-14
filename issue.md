# Planning: Registrasi User Baru

## Tujuan

Menambahkan fitur registrasi user baru pada API ElysiaJS yang sudah ada. Fitur ini mencakup penambahan tabel `users`, hash password menggunakan bcrypt, pengecekan email yang sudah terdaftar, dan endpoint `POST /api/users`.

Dokumen ini ditujukan untuk programmer atau AI model yang akan mengimplementasikan fitur, jadi instruksi dibuat cukup high level tetapi tetap jelas.

## Perubahan Database

Buat tabel `users` dengan kolom:

- `id` integer auto increment sebagai primary key.
- `name` varchar 255 not null.
- `email` varchar 255 not null.
- `password` varchar 255 not null, berisi hasil hash bcrypt dari password user.
- `created_at` timestamp default current_timestamp.

Pastikan email dapat dicek sebelum insert agar user dengan email yang sama tidak dibuat lebih dari satu kali.

## Endpoint Baru

Buat endpoint:

```http
POST /api/users
```

Request body:

```json
{
  "name": "Eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

Response body jika sukses:

```json
{
  "data": "OK"
}
```

Response body jika email sudah terdaftar:

```json
{
  "error": "Email sudah terdaftar"
}
```

## Struktur Folder

Tambahkan struktur folder di dalam `src`:

- `src/routes` untuk routing ElysiaJS.
- `src/services` untuk logic bisnis aplikasi.

Gunakan format nama file:

- Route: `users-route.ts`.
- Service: `users-service.ts`.

## Rencana Implementasi

1. Tambahkan dependency bcrypt yang sesuai untuk Bun/TypeScript.
2. Tambahkan schema Drizzle untuk tabel `users`.
3. Buat migration baru untuk tabel `users`.
4. Buat `src/services/users-service.ts` untuk menampung logic registrasi user.
5. Di service, lakukan pengecekan apakah email sudah terdaftar.
6. Jika email sudah ada, kembalikan error dengan pesan `Email sudah terdaftar`.
7. Jika email belum ada, hash password menggunakan bcrypt sebelum menyimpan ke database.
8. Simpan user baru ke tabel `users`.
9. Buat `src/routes/users-route.ts` untuk mendefinisikan endpoint `POST /api/users`.
10. Hubungkan route baru ke aplikasi utama di `src/index.ts`.
11. Pastikan response sukses dan error mengikuti format yang diminta.
12. Jalankan typecheck dan generate migration untuk memastikan perubahan valid.
13. Jika tersedia database MySQL lokal, jalankan migration dan tes endpoint secara manual.

## Catatan Implementasi

- Jangan menyimpan password mentah ke database.
- Logic pengecekan email dan hashing password sebaiknya berada di service, bukan langsung di route.
- Route cukup bertanggung jawab menerima request, memanggil service, dan mengembalikan response.
- Pertahankan struktur tetap sederhana. Jangan menambahkan arsitektur tambahan yang belum diperlukan.
- Jika project belum memiliki validasi request body yang rapi, gunakan validasi bawaan ElysiaJS.

## Kriteria Selesai

- Tabel `users` tersedia di schema dan migration.
- Endpoint `POST /api/users` tersedia.
- User baru bisa diregistrasikan dengan `name`, `email`, dan `password`.
- Password yang tersimpan adalah hash bcrypt.
- Email yang sudah terdaftar menghasilkan response error sesuai format.
- Struktur `routes` dan `services` sudah digunakan.
- Typecheck berhasil.
