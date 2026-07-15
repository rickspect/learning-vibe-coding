# Planning: Login

## Tujuan

Menambahkan fitur login pada API ElysiaJS yang sudah ada. Fitur ini mencakup penambahan tabel `sessions`, validasi email dan password user, pembuatan token login berbentuk UUID, dan penyimpanan session ke database.

Dokumen ini ditujukan untuk programmer atau AI model yang akan mengimplementasikan fitur, jadi instruksi dibuat cukup high level tetapi tetap jelas.

## Perubahan Database

Buat tabel `sessions` dengan kolom:

- `id` integer auto increment sebagai primary key.
- `token` varchar 255 not null, berisi UUID untuk token user yang login.
- `user_id` integer sebagai foreign key ke tabel `users`.
- `created_at` timestamp default current_timestamp.

Pastikan relasi `sessions.user_id` mengarah ke `users.id`.

## Endpoint Baru

Buat endpoint:

```http
POST /api/users/login
```

Request body:

```json
{
  "email": "eko@localhost",
  "password": "rahasia"
}
```

Response body jika sukses:

```json
{
  "data": "token"
}
```

Response body jika email atau password salah:

```json
{
  "error": "Email atau password salah"
}
```

## Struktur Folder

Gunakan struktur folder yang sudah ada di dalam `src`:

- `src/routes` untuk routing ElysiaJS.
- `src/services` untuk logic bisnis aplikasi.

Gunakan format nama file:

- Route: `users-route.ts`.
- Service: `users-service.ts`.

## Rencana Implementasi

1. Tambahkan schema Drizzle untuk tabel `sessions`.
2. Buat migration baru untuk tabel `sessions`.
3. Tambahkan logic login di `src/services/users-service.ts`.
4. Di service, cari user berdasarkan email.
5. Jika user tidak ditemukan, kembalikan error dengan pesan `Email atau password salah`.
6. Jika user ditemukan, bandingkan password dari request dengan hash password di database menggunakan bcrypt.
7. Jika password salah, kembalikan error dengan pesan `Email atau password salah`.
8. Jika password benar, buat token UUID untuk session login.
9. Simpan token dan `user_id` ke tabel `sessions`.
10. Kembalikan response sukses dengan format `{ "data": "token" }`.
11. Tambahkan route `POST /api/users/login` di `src/routes/users-route.ts`.
12. Pastikan route login menggunakan service, bukan menaruh logic database langsung di route.
13. Jalankan typecheck dan generate migration untuk memastikan perubahan valid.
14. Jika tersedia database MySQL lokal, jalankan migration dan tes endpoint login secara manual.

## Catatan Implementasi

- Jangan mengembalikan detail apakah email atau password yang salah.
- Gunakan pesan error yang sama: `Email atau password salah`.
- Token session harus berupa UUID.
- Logic validasi login, pengecekan password, pembuatan token, dan penyimpanan session sebaiknya berada di service.
- Route cukup bertanggung jawab menerima request, memanggil service, dan mengembalikan response.
- Pertahankan struktur tetap sederhana dan ikuti pola registrasi user yang sudah ada.

## Kriteria Selesai

- Tabel `sessions` tersedia di schema dan migration.
- Tabel `sessions` memiliki foreign key ke tabel `users`.
- Endpoint `POST /api/users/login` tersedia.
- Login berhasil jika email dan password valid.
- Password dibandingkan menggunakan bcrypt.
- Token UUID dibuat dan disimpan ke tabel `sessions`.
- Response sukses mengembalikan token dalam field `data`.
- Email atau password salah menghasilkan response error sesuai format.
- Typecheck berhasil.
