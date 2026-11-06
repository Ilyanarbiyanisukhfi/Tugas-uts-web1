# Tugas-uts-web1

# Pustaka Terbuka – Toko Buku Online

Aplikasi website toko buku online yang dibuat dengan **HTML, CSS, dan JavaScript murni** (tanpa framework, tanpa backend). Proyek ini dibuat untuk **Tugas UTS Pemrograman Web 1**.

| | |
|---|---|
| **Nama** | `[Ilyan Arbiyani Sukhfi]` |
| **NIM** | `[312510536]` |
| **Mata kuliah** | Pemrograman Web 1 |
| **Video penjelasan (YouTube)** | [([https://youtube.com/](https://youtu.be/8kKYwSYKZXI)) |

---

## 1. Deskripsi Singkat

Pustaka Terbuka adalah simulasi sistem toko buku online. Pengguna dapat login, melihat katalog dan stok buku, membuat pemesanan, melacak pengiriman berdasarkan Nomor Delivery Order (DO), melihat riwayat transaksi, dan (khusus Admin) melihat laporan penjualan.

Semua data disimpan di browser (`localStorage` dan `sessionStorage`) sehingga aplikasi bisa dijalankan hanya dengan membuka `index.html`.

## 2. Fitur Utama

| Halaman | File | Fitur |
|---|---|---|
| Login | `index.html` | Validasi form, tampil/sembunyi password, Lupa Password dan Daftar (modal), carousel sampul buku yang bergeser otomatis |
| Dashboard | `dashboard.html` | Sapaan sesuai jam, menu utama, ringkasan data, kartu Buku terlaris, Pesanan terakhir, Paket aktif |
| Katalog / Stok | `stok.html` | Tampilan Tabel dan Kartu, pencarian, tambah stok baru (validasi), hapus, reset data |
| Pemesanan | `checkout.html` | Keranjang, hitung subtotal dan ongkir, validasi data pemesan, konfirmasi, konfeti saat berhasil |
| Tracking | `tracking.html` | Cari Nomor DO, progres pengiriman dengan ikon truk, riwayat perjalanan, tombol Salin nomor DO |
| Riwayat | `history.html` | Daftar transaksi, cari dan filter status, detail pesanan di modal |
| Laporan | `laporan.html` | Khusus Admin: ringkasan, grafik pendapatan per judul, tabel rincian, cetak |
| Umum | semua halaman | Mode gelap/terang, menu sesuai peran, notifikasi kecil (toast), desain responsif |

### Akun contoh

| Email | Password | Peran |
|---|---|---|
| rina@gmail.com | rina123 | User |
| agus@gmail.com | agus123 | User |
| siti@gmail.com | siti123 | Admin |

## 3. Struktur Folder

```
├── index.html          # Login
├── dashboard.html
├── stok.html
├── checkout.html
├── tracking.html
├── history.html
├── laporan.html
├── login.html         
├── assets/
│   └── logo.svg
├── css/
│   └── style.css
├── js/
│   ├── data.js        
│   └── script.js     
├── img/
```

## 4. Cara Menjalankan

1. Unduh atau clone repository ini.
2. Buka `index.html` di browser (Chrome, Edge, atau Firefox).
3. Login memakai salah satu akun contoh di atas.

Tidak perlu instalasi apa pun. Untuk mengembalikan data awal, gunakan tombol **Reset ke data awal** di halaman Katalog atau hapus data situs dari browser.

---

## 5. Sistematika dan Alur Berpikir

Perancangan dilakukan bertahap dari data ke tampilan, lalu ke perilaku:

1. **Menganalisis kebutuhan.** Dari soal ditentukan halaman yang dibutuhkan (login, dashboard, stok, pemesanan, tracking, laporan, riwayat) dan alur antarhalaman.
2. **Merancang data (`data.js`).** Data dummy dibuat dulu dalam bentuk array dan object (`dataPengguna`, `dataKatalogBuku`, `dataRiwayat`, `dataTracking`). Dengan begitu semua halaman memakai satu sumber data yang sama.
3. **Menyusun kerangka HTML.** Setiap halaman memakai struktur yang sama (header, menu, konten, footer) dan elemen semantik (`header`, `nav`, `main`, `section`, `table`, `dialog`) supaya rapi dan mudah diakses.
4. **Mendesain CSS (`style.css`).** Warna, font, dan ukuran disimpan sebagai variabel CSS di `:root`. Mode gelap cukup mengganti variabel tersebut lewat atribut `data-theme`. Tata letak memakai Flexbox dan Grid, serta media query untuk layar kecil.
5. **Menulis JavaScript (`script.js`).** Kode dibagi per bagian: utilitas, data dan sesi, dialog, validasi, lalu satu fungsi `init...` untuk tiap halaman. Satu file dipakai semua halaman, dan fungsi yang dijalankan ditentukan lewat atribut `data-page` pada `<body>`.
6. **Menyempurnakan.** Menambah fitur visual (kartu katalog, truk tracking, dashboard dinamis, konfeti, carousel otomatis) tanpa mengubah tema dan fungsi yang sudah berjalan.

## 6. Argumentasi Pilihan Teknis

| Keputusan | Alasan |
|---|---|
| HTML, CSS, JS murni | Sesuai tujuan mata kuliah: memahami dasar web tanpa bergantung pada framework |
| Data di `data.js` dan `localStorage` | Tidak ada backend, tetapi data tetap bertahan antarhalaman dan setelah halaman dimuat ulang |
| Sesi login di `sessionStorage` | Sesi hilang saat tab ditutup, mirip perilaku login sungguhan |
| Menu dan halaman dibedakan menurut peran | User hanya melihat pesanannya sendiri; halaman Laporan diblokir bagi non-Admin, termasuk lewat URL langsung |
| Elemen `<dialog>` bawaan browser | Modal dan alert box mendukung fokus keyboard dan tombol Esc tanpa library tambahan |
| Validasi dengan regex dan pesan di bawah kolom | Pengguna langsung tahu kolom mana yang salah dan apa perbaikannya |
| Variabel CSS untuk warna | Satu tempat untuk mengatur tema, sehingga mode gelap mudah dibuat |
| Carousel dengan `scroll-snap` | Geser dengan sentuhan dan mouse berjalan natural, ditambah putar otomatis tiap 3,5 detik |
| Konten dibuat lewat DOM (`createElement`, template string) | Tabel, kartu, dan keranjang selalu mengikuti data terbaru |

---

## 7. Proses Pengerjaan dan Tangkapan Layar

> Simpan gambar di folder `docs/screenshots/` dengan nama seperti di bawah, lalu tulisan dalam kurung siku akan diganti gambar otomatis.

### 7.1 Halaman Login

Form login dengan validasi, carousel sampul buku yang bergeser otomatis, serta tombol Lupa Password dan Daftar.

<img width="1366" height="768" alt="01-login" src="https://github.com/user-attachments/assets/a6e1148f-518c-4005-8ba9-8bc7b509d096" />

### 7.2 Validasi dan Modal (Daftar, Lupa Password, Alert)

Pesan error muncul di bawah kolom, dan alert box buatan sendiri tampil saat login gagal.

<img width="1366" height="768" alt="02-validasi-login" src="https://github.com/user-attachments/assets/894aad81-1fdc-4427-a6e9-d42280b563c6" />

<img width="1366" height="768" alt="03-modal-daftar" src="https://github.com/user-attachments/assets/945cbdeb-8c5d-4acf-bb75-0d11f0c44c65" />

### 7.3 Dashboard

Menu utama, ringkasan data, Buku terlaris, Pesanan terakhir, dan Paket aktif.

<img width="1366" height="1057" alt="04-dashboard" src="https://github.com/user-attachments/assets/8d3c4e3d-0820-4ebf-9005-94b2d783283b" />

### 7.4 Katalog / Informasi Stok

Tampilan tabel, tampilan kartu, pencarian, dan form tambah stok baru.

<img width="1366" height="1021" alt="05-katalog-tabel" src="https://github.com/user-attachments/assets/365d9611-83a4-4131-bbc6-938a728d7015" />

<img width="1366" height="1669" alt="06-katalog-kartu" src="https://github.com/user-attachments/assets/fe4a4476-47d6-459c-ae06-3be441b3f36c" />

<img width="1080" height="449" alt="07-tambah-stok" src="https://github.com/user-attachments/assets/3f94cc68-b9de-4eb7-a16a-c0a84c9f3963" />

### 7.5 Pemesanan (Checkout)

Keranjang, perhitungan ongkir dan total, validasi data pemesan, serta dialog sukses dengan konfeti.

<img width="1366" height="1022" alt="08-checkout" src="https://github.com/user-attachments/assets/ebd815dd-de55-4bd9-9424-3bf87d5aea32" />

<img width="1366" height="768" alt="09-pesanan-berhasil" src="https://github.com/user-attachments/assets/25f7ebe6-cc6b-453d-9e0b-febda5b0c3b7" />

### 7.6 Tracking Pengiriman

Pencarian Nomor DO, progres dengan ikon truk, detail pengiriman, dan riwayat perjalanan.

<img width="1366" height="1161" alt="10-tracking" src="https://github.com/user-attachments/assets/4d2ebb71-84bd-403d-8a3a-e160b497c9dc" />

### 7.7 Riwayat Transaksi

Daftar transaksi dengan pencarian, filter status, dan modal detail.

<img width="1366" height="768" alt="11-history" src="https://github.com/user-attachments/assets/0ec6351c-467d-46bf-9f99-be3605a95085" />

### 7.8 Laporan Pemesanan (Admin)

Ringkasan penjualan, grafik pendapatan per judul, dan tabel rincian.

<img width="1366" height="1051" alt="12-laporan" src="https://github.com/user-attachments/assets/da34770c-f4a9-4b7a-8029-3558664f0825" />

### 7.9 Mode Gelap dan Tampilan Mobile

<img width="1366" height="1057" alt="13-mode-gelap" src="https://github.com/user-attachments/assets/c68528bd-de4e-478c-8079-9a4574d161ac" />

<img width="780" height="5112" alt="14-mobile" src="https://github.com/user-attachments/assets/cc8ab7eb-126d-4a25-ae02-1888137c4f3b" />


---

## 8. Video Penjelasan

Penjelasan sistematika, alur berpikir, dan argumentasi perancangan aplikasi (durasi kurang dari 8 menit):

**[`[([https://youtube.com/](https://youtu.be/8kKYwSYKZXI))**

## 9
. Teknologi

- HTML5
- CSS3 (variabel CSS, Flexbox, Grid, media query, animasi)
- JavaScript ES6+ (DOM, Web Storage, `<dialog>`, Canvas untuk konfeti)
- Google Fonts: Nunito Sans dan Sora

---

&copy; 2026 Pustaka Terbuka – Tugas UTS Pemrograman Web 1
