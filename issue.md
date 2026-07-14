# Planning: Backend Bun dengan ElysiaJS, Drizzle, dan MySQL

## Tujuan

Membuat project backend baru di folder ini menggunakan Bun sebagai runtime, ElysiaJS sebagai framework API, Drizzle sebagai ORM, dan MySQL sebagai database.

## Rencana Implementasi

1. Inisialisasi project Bun dan siapkan struktur folder yang sederhana serta mudah dikembangkan.
2. Tambahkan ElysiaJS, Drizzle, driver MySQL, dan dependency pendukung yang diperlukan.
3. Siapkan konfigurasi environment untuk koneksi database, termasuk file contoh environment tanpa menyimpan kredensial asli.
4. Konfigurasikan Drizzle agar terhubung ke MySQL dan mendukung pengelolaan schema serta migration.
5. Buat satu schema database sederhana sebagai contoh awal.
6. Buat aplikasi ElysiaJS dengan endpoint dasar untuk health check dan satu contoh operasi database.
7. Tambahkan script Bun yang diperlukan untuk menjalankan aplikasi dan mengelola migration database.
8. Dokumentasikan cara instalasi, konfigurasi, menjalankan aplikasi, dan menjalankan migration secara singkat.
9. Verifikasi bahwa aplikasi dapat dijalankan, endpoint dapat diakses, dan koneksi ke MySQL bekerja dengan benar.

## Kriteria Selesai

- Project dapat diinstal dan dijalankan menggunakan Bun.
- API ElysiaJS berjalan dan menyediakan health check.
- Drizzle berhasil terhubung ke MySQL.
- Schema dan migration awal tersedia serta dapat dijalankan.
- Tersedia contoh operasi database melalui API.
- Konfigurasi rahasia tidak masuk ke repository.
- README berisi petunjuk penggunaan yang ringkas.

## Catatan

Pertahankan implementasi tetap sederhana. Hindari arsitektur atau abstraksi tambahan yang belum diperlukan pada tahap awal.
