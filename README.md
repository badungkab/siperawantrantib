# SIPERAWAN TRANTIB — Backend Otomatis

Versi ini memperbaiki Dashboard, Rekomendasi Patroli, dan data sampling.

## Struktur
- `index.html` — antarmuka aplikasi.
- `code.gs` — backend Google Apps Script + akses Spreadsheet.

## Deployment
1. Buat/buka Google Spreadsheet yang akan menjadi sumber data.
2. Extensions → Apps Script.
3. Tambahkan file `code.gs` dan file HTML bernama `index` lalu isi dengan file dari paket ini.
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone (atau sesuai kebijakan organisasi).
7. Buka URL Web App `/exec`.

Tidak perlu memasukkan URL Web App ke aplikasi. `google.script.run` langsung menghubungkan frontend dengan backend Apps Script yang sedang menjalankan aplikasi.

## Spreadsheet
- Sheet `TRANTIB` dibuat otomatis.
- Header dibuat otomatis.
- Data lama dengan kategori lama dinormalisasi ke 8 kategori baru.
- Folder `FOTO_TRANTIB` dibuat otomatis saat foto pertama disimpan.

## 8 kategori
1. Tertib Jalan dan Keselamatan Pejalan Kaki
2. Tertib Jalur Hijau, Taman dan Tempat Umum
3. Tertib Sungai, Saluran Air dan Kawasan Pesisir
4. Tertib Lingkungan
5. Tertib Bangunan
6. Tertib Usaha Pariwisata
7. Tertib Sosial
8. Tertib Kependudukan

## Data sampling
- Tombol **Muat data contoh lokal** mengisi data simulasi di browser.
- Tombol **Isi sampling ke Spreadsheet** membuat sampling 90 hari di sheet jika sheet masih kosong.
- Sampling mencakup seluruh 8 kategori, beberapa wilayah Badung, sumber laporan, dampak, status, waktu, dan koordinat.

## Perbaikan Dashboard
Dashboard sekarang aman terhadap kategori lama/unknown, data kosong, dan data yang belum memiliki kategori valid. Grafik dibuat setelah kontainer dashboard tersedia.

## Perbaikan Rekomendasi Patroli
Rekomendasi tidak lagi mensyaratkan minimal 3 kejadian per zona. Semua zona dengan minimal 1 kejadian dapat dianalisis, sehingga rekomendasi tetap muncul pada dataset kecil/sampling.
