/* =========================================================
   data.js  -  Data dummy (format Array/Object JSON)
   Dipakai bersama oleh seluruh halaman.
   ========================================================= */

const dataPengguna = [
    { id: 1, nama: "Rina Wulandari", email: "rina@gmail.com", password: "rina123", role: "User" },
    { id: 2, nama: "Agus Pranoto",   email: "agus@gmail.com", password: "agus123", role: "User" },
    { id: 3, nama: "Siti Marlina",   email: "siti@gmail.com", password: "siti123", role: "Admin" }
];

const dataKatalogBuku = [
    { kodeBarang: "ASIP4301", namaBarang: "Pengantar Ilmu Komunikasi",   jenisBarang: "Buku Ajar", edisi: "2", stok: 548, harga: "Rp 180.000", cover: "img/pengantar_komunikasi.jpg" },
    { kodeBarang: "EKMA4002", namaBarang: "Manajemen Keuangan",          jenisBarang: "Buku Ajar", edisi: "3", stok: 392, harga: "Rp 220.000", cover: "img/manajemen_keuangan.jpg" },
    { kodeBarang: "EKMA4310", namaBarang: "Kepemimpinan",                jenisBarang: "Buku Ajar", edisi: "1", stok: 278, harga: "Rp 150.000", cover: "img/kepemimpinan.jpg" },
    { kodeBarang: "BIOL4211", namaBarang: "Mikrobiologi Dasar",          jenisBarang: "Buku Ajar", edisi: "2", stok: 165, harga: "Rp 200.000", cover: "img/mikrobiologi.jpg" },
    { kodeBarang: "PAUD4401", namaBarang: "Perkembangan Anak Usia Dini", jenisBarang: "Buku Ajar", edisi: "4", stok: 204, harga: "Rp 250.000", cover: "img/paud_perkembangan.jpg" }
];

/* Riwayat transaksi / pemesanan (dipakai halaman history & laporan) */
const dataRiwayat = [
    { nomorDO: "20230012", tanggal: "2025-08-25", nama: "Rina Wulandari", metode: "Transfer Bank", ongkir: 0,
      items: [ { kode: "ASIP4301", nama: "Pengantar Ilmu Komunikasi", harga: 180000, qty: 1 } ], total: 180000, status: "Dalam Perjalanan" },
    { nomorDO: "20230013", tanggal: "2025-08-25", nama: "Agus Pranoto", metode: "QRIS", ongkir: 0,
      items: [ { kode: "EKMA4002", nama: "Manajemen Keuangan", harga: 220000, qty: 1 } ], total: 220000, status: "Selesai" },
    { nomorDO: "20230014", tanggal: "2025-09-02", nama: "Rina Wulandari", metode: "Transfer Bank", ongkir: 0,
      items: [ { kode: "BIOL4211", nama: "Mikrobiologi Dasar", harga: 200000, qty: 1 },
               { kode: "PAUD4401", nama: "Perkembangan Anak Usia Dini", harga: 250000, qty: 1 } ], total: 450000, status: "Dikirim" },
    { nomorDO: "20230015", tanggal: "2025-09-10", nama: "Agus Pranoto", metode: "COD", ongkir: 0,
      items: [ { kode: "EKMA4310", nama: "Kepemimpinan", harga: 150000, qty: 2 } ], total: 300000, status: "Diproses" },
    { nomorDO: "20230016", tanggal: "2025-09-15", nama: "Siti Marlina", metode: "QRIS", ongkir: 0,
      items: [ { kode: "ASIP4301", nama: "Pengantar Ilmu Komunikasi", harga: 180000, qty: 3 } ], total: 540000, status: "Selesai" },
    { nomorDO: "20230017", tanggal: "2025-09-20", nama: "Siti Marlina", metode: "Transfer Bank", ongkir: 0,
      items: [ { kode: "PAUD4401", nama: "Perkembangan Anak Usia Dini", harga: 250000, qty: 1 },
               { kode: "EKMA4002", nama: "Manajemen Keuangan", harga: 220000, qty: 1 } ], total: 470000, status: "Selesai" }
];

/* Data tracking pengiriman, kunci = Nomor Delivery Order */
const dataTracking = {
    "20230012": {
        nomorDO: "20230012", nama: "Rina Wulandari", status: "Dalam Perjalanan", ekspedisi: "JNE",
        tanggalKirim: "2025-08-25", paket: "0JKT01", total: "Rp 180.000",
        perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-25 16:40:05", keterangan: "Diteruskan ke Kantor Jakarta Selatan" }
        ]
    },
    "20230013": {
        nomorDO: "20230013", nama: "Agus Pranoto", status: "Selesai", ekspedisi: "Pos Indonesia",
        tanggalKirim: "2025-08-25", paket: "0UPBJJBDG", total: "Rp 220.000",
        perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-25 16:30:10", keterangan: "Diteruskan ke Kantor Kota Bandung" },
            { waktu: "2025-08-26 12:15:33", keterangan: "Tiba di Hub: Kota BANDUNG" },
            { waktu: "2025-08-26 15:06:12", keterangan: "Proses antar ke Cimahi" },
            { waktu: "2025-08-26 20:00:00", keterangan: "Selesai Antar. Penerima: Agus Pranoto" }
        ]
    },
    "20230014": {
        nomorDO: "20230014", nama: "Rina Wulandari", status: "Dikirim", ekspedisi: "J&T Express",
        tanggalKirim: "2025-09-03", paket: "0JKT02", total: "Rp 450.000",
        perjalanan: [
            { waktu: "2025-09-03 09:30:00", keterangan: "Paket diserahkan ke kurir J&T Express. Pengirim: Universitas Terbuka" },
            { waktu: "2025-09-03 13:45:12", keterangan: "Tiba di Hub: TANGERANG SELATAN" }
        ]
    },
    "20230015": {
        nomorDO: "20230015", nama: "Agus Pranoto", status: "Diproses", ekspedisi: "Pos Indonesia",
        tanggalKirim: "2025-09-11", paket: "0UPBJJBDG", total: "Rp 300.000",
        perjalanan: [
            { waktu: "2025-09-10 15:20:00", keterangan: "Pesanan diterima, sedang dikemas oleh gudang Universitas Terbuka" }
        ]
    },
    "20230016": {
        nomorDO: "20230016", nama: "Siti Marlina", status: "Selesai", ekspedisi: "JNE",
        tanggalKirim: "2025-09-15", paket: "0JKT01", total: "Rp 540.000",
        perjalanan: [
            { waktu: "2025-09-15 11:00:00", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-09-16 08:10:41", keterangan: "Tiba di Hub: JAKARTA" },
            { waktu: "2025-09-16 17:25:09", keterangan: "Selesai Antar. Penerima: Siti Marlina" }
        ]
    },
    "20230017": {
        nomorDO: "20230017", nama: "Siti Marlina", status: "Selesai", ekspedisi: "JNE",
        tanggalKirim: "2025-09-20", paket: "0JKT03", total: "Rp 470.000",
        perjalanan: [
            { waktu: "2025-09-20 10:05:00", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-09-21 09:45:30", keterangan: "Tiba di Hub: JAKARTA" },
            { waktu: "2025-09-21 15:50:00", keterangan: "Selesai Antar. Penerima: Siti Marlina" }
        ]
    }
};
