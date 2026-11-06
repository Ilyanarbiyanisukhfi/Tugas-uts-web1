/* =========================================================
   script.js - Logika seluruh halaman (butuh js/data.js lebih dulu)
   Bagian: 1 Utilitas · 2 Data & sesi · 3 Dialog · 4 Validasi
           5 Login+Carousel · 6 Dashboard · 7 Stok · 8 Checkout
           9 Tracking · 10 Laporan & Riwayat · 11 Init
   ========================================================= */
"use strict";

/* 1. Utilitas ------------------------------------------------ */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const parseRupiah = s => Number(String(s).replace(/[^\d]/g, "")) || 0;
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const pad = n => String(n).padStart(2, "0");
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const sekarang = () => { const d = new Date(); return `${hariIni()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const namaCover = path => path.split("/").pop().replace(/\.\w+$/, "").replace(/_/g, " ");
const kelasStatus = s => ({ "Selesai": "ok", "Dalam Perjalanan": "info", "Dikirim": "info", "Diproses": "warn" }[s] || "");

/* 2. Data & sesi (localStorage supaya data tetap ada antar halaman) */
const KEY = { users: "ut_users", sesi: "ut_sesi", katalog: "ut_katalog", riwayat: "ut_riwayat", tracking: "ut_tracking" };
const muat = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const simpan = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* abaikan */ } };

const getUsers   = () => muat(KEY.users, dataPengguna);
const getKatalog = () => muat(KEY.katalog, dataKatalogBuku);
const getRiwayat = () => muat(KEY.riwayat, dataRiwayat);
const getTracking = () => ({ ...dataTracking, ...muat(KEY.tracking, {}) });
const getSesi = () => { try { return JSON.parse(sessionStorage.getItem(KEY.sesi)); } catch { return null; } };

function wajibLogin() {
    const sesi = getSesi();
    if (!sesi) { location.replace("index.html"); return null; }
    if (sesi.role !== "Admin") $$("[data-admin]").forEach(el => el.remove());   // menu khusus Admin
    const nama = $("#namaPengguna");
    if (nama) nama.textContent = `${sesi.nama} (${sesi.role})`;
    $("#btnLogout")?.addEventListener("click", () => { sessionStorage.removeItem(KEY.sesi); location.href = "index.html"; });
    return sesi;
}
/* Admin melihat semua transaksi, User hanya miliknya sendiri */
const pesananTampil = sesi => getRiwayat().filter(o => sesi.role === "Admin" || o.nama === sesi.nama);

/* 3. Dialog (modal box, pop-up, alert box) --------------------- */
function bukaDialog(id) { const d = document.getElementById(id); if (d && !d.open) d.showModal(); }
function tutupDialog(d) { d.close(); }
function aktifkanDialog() {
    $$("dialog").forEach(d => {
        d.addEventListener("click", e => { if (e.target === d) d.close(); });      // klik latar = tutup
        $$("[data-tutup]", d).forEach(b => b.addEventListener("click", () => d.close()));
    });
    $$("[data-buka]").forEach(b => b.addEventListener("click", () => bukaDialog(b.dataset.buka)));
}
/* Alert box buatan sendiri; mengembalikan Promise<boolean> */
function tampilAlert(pesan, { judul = "Informasi", tipe = "info", konfirmasi = false, teksOk = "OK" } = {}) {
    return new Promise(resolve => {
        const d = document.createElement("dialog");
        d.className = "alert-" + tipe;
        d.setAttribute("role", "alertdialog");
        d.innerHTML = `<div class="dlg-kepala"><h2>${esc(judul)}</h2></div>
            <div class="dlg-badan"><p style="margin:0">${esc(pesan)}</p></div>
            <div class="dlg-kaki">${konfirmasi ? '<button class="btn btn-ghost" data-nilai="0">Batal</button>' : ""}
            <button class="btn ${tipe === "error" ? "" : "btn-accent"}" data-nilai="1">${esc(teksOk)}</button></div>`;
        document.body.appendChild(d);
        let hasil = false;
        d.addEventListener("click", e => { const n = e.target.dataset?.nilai; if (n !== undefined) { hasil = n === "1"; d.close(); } });
        d.addEventListener("close", () => { d.remove(); resolve(hasil); });
        d.showModal();
        $("[data-nilai='1']", d).focus();
    });
}

/* 3b. Mode gelap / terang -------------------------------------- */
function terapkanTema(t) {
    document.documentElement.dataset.theme = t;
    const btn = $("#btnTema"); if (!btn) return;
    const gelap = t === "dark";
    $(".ikon", btn).textContent = gelap ? "\u2600" : "\u263E";
    $(".teks", btn).textContent = gelap ? "Terang" : "Gelap";
    btn.setAttribute("aria-pressed", String(gelap));
}
function initTema() {
    let t = document.documentElement.dataset.theme || "light";
    terapkanTema(t);
    $("#btnTema")?.addEventListener("click", () => {
        t = t === "dark" ? "light" : "dark";
        terapkanTema(t);
        try { localStorage.setItem("ut_tema", t); } catch { /* abaikan */ }
    });
}

/* 4. Validasi form ------------------------------------------- */
function setError(id, pesan) {
    const input = document.getElementById(id); if (!input) return;
    const field = input.closest(".field");
    field.classList.toggle("error", !!pesan);
    input.setAttribute("aria-invalid", pesan ? "true" : "false");
    const el = $(".pesan-error", field); if (el) el.textContent = pesan || "";
}
const bersihkanError = form => $$(".field", form).forEach(f => { f.classList.remove("error"); const e = $(".pesan-error", f); if (e) e.textContent = ""; });
const emailValid = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const telpValid  = s => /^(\+62|62|0)8\d{7,12}$/.test(s.replace(/[\s-]/g, ""));

/* 5. Halaman login + carousel foto buku ----------------------- */
function initLogin() {
    initCarousel();

    // tampil/sembunyi password
    $$(".pw-toggle").forEach(btn => btn.addEventListener("click", () => {
        const input = $("input", btn.parentElement);
        const tampil = input.type === "password";
        input.type = tampil ? "text" : "password";
        btn.textContent = tampil ? "Sembunyi" : "Lihat";
    }));

    $("#formLogin").addEventListener("submit", e => {
        e.preventDefault();
        bersihkanError(e.target);
        const email = $("#email").value.trim(), pw = $("#password").value;
        let ok = true;
        if (!email) { setError("email", "Email wajib diisi"); ok = false; }
        else if (!emailValid(email)) { setError("email", "Format email tidak valid"); ok = false; }
        if (!pw) { setError("password", "Password wajib diisi"); ok = false; }
        if (!ok) return;

        const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pw);
        if (!user) {
            tampilAlert("Email/password yang anda masukkan salah", { judul: "Login gagal", tipe: "error" });
            return;
        }
        sessionStorage.setItem(KEY.sesi, JSON.stringify({ id: user.id, nama: user.nama, email: user.email, role: user.role }));
        location.href = "dashboard.html";
    });

    // Lupa password (modal)
    $("#formLupa").addEventListener("submit", async e => {
        e.preventDefault();
        bersihkanError(e.target);
        const email = $("#emailLupa").value.trim();
        if (!emailValid(email)) { setError("emailLupa", "Masukkan email yang valid"); return; }
        const ada = getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
        if (!ada) { setError("emailLupa", "Email tidak terdaftar"); return; }
        $("#dlgLupa").close(); e.target.reset();
        await tampilAlert(`Tautan reset password telah dikirim ke ${email} (simulasi).`, { judul: "Cek email Anda", tipe: "ok" });
    });

    // Daftar (modal)
    $("#formDaftar").addEventListener("submit", async e => {
        e.preventDefault();
        bersihkanError(e.target);
        const nama = $("#namaDaftar").value.trim(), email = $("#emailDaftar").value.trim();
        const pw = $("#pwDaftar").value, pw2 = $("#pwDaftar2").value;
        const users = getUsers();
        let ok = true;
        if (nama.length < 3) { setError("namaDaftar", "Nama minimal 3 karakter"); ok = false; }
        if (!emailValid(email)) { setError("emailDaftar", "Format email tidak valid"); ok = false; }
        else if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { setError("emailDaftar", "Email sudah terdaftar"); ok = false; }
        if (pw.length < 6) { setError("pwDaftar", "Password minimal 6 karakter"); ok = false; }
        if (pw2 !== pw) { setError("pwDaftar2", "Konfirmasi password tidak sama"); ok = false; }
        if (!ok) return;

        users.push({ id: Math.max(...users.map(u => u.id)) + 1, nama, email, password: pw, role: "User" });
        simpan(KEY.users, users);
        $("#dlgDaftar").close(); e.target.reset();
        $("#email").value = email;
        await tampilAlert("Akun berhasil dibuat. Silakan login dengan email tersebut.", { judul: "Pendaftaran berhasil", tipe: "ok" });
        $("#password").focus();
    });
}

function initCarousel() {
    const track = $("#carouselTrack"), dots = $("#carouselTitik");
    const buku = getKatalog().filter(b => b.cover);
    buku.forEach((b, i) => {
        const li = document.createElement("li");
        li.className = "slide";
        li.innerHTML = `<img src="${esc(b.cover)}" alt="Sampul buku ${esc(b.namaBarang)}" draggable="false">`;
        li.addEventListener("click", () => pindahKe(i));
        track.appendChild(li);
        const t = document.createElement("button");
        t.type = "button"; t.className = "titik"; t.setAttribute("aria-label", `Buku ${i + 1}: ${b.namaBarang}`);
        t.addEventListener("click", () => pindahKe(i));
        dots.appendChild(t);
    });
    const slides = [...track.children], titik = [...dots.children];
    let aktif = -1, timer = null;

    const terdekat = () => {
        const tengah = track.scrollLeft + track.clientWidth / 2;
        let best = 0, jarak = Infinity;
        slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - tengah); if (d < jarak) { jarak = d; best = i; } });
        return best;
    };
    function pindahKe(i) {
        i = (i + slides.length) % slides.length;
        const s = slides[i];
        track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: "smooth" });
    }
    function perbarui() {
        const i = terdekat();
        if (i === aktif) return;
        aktif = i;
        slides.forEach((s, n) => s.classList.toggle("aktif", n === i));
        titik.forEach((t, n) => { t.classList.toggle("aktif", n === i); n === i ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"); });
        const b = buku[i];
        $("#infoJudul").textContent = b.namaBarang;
        $("#infoDetail").textContent = `${b.jenisBarang} · Edisi ${b.edisi} · ${b.harga}`;
    }
    let raf = 0;
    track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(perbarui); });

    // geser dengan mouse (sentuhan sudah native lewat scroll-snap)
    let tekan = false, mulaiX = 0, mulaiScroll = 0;
    track.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; tekan = true; mulaiX = e.clientX; mulaiScroll = track.scrollLeft; track.classList.add("menyeret"); henti(); });
    window.addEventListener("pointermove", e => { if (tekan) track.scrollLeft = mulaiScroll - (e.clientX - mulaiX); });
    window.addEventListener("pointerup", () => { if (!tekan) return; tekan = false; track.classList.remove("menyeret"); pindahKe(terdekat()); mulai(); });

    $("#panahKiri").addEventListener("click", () => { pindahKe(aktif - 1); henti(); mulai(); });
    $("#panahKanan").addEventListener("click", () => { pindahKe(aktif + 1); henti(); mulai(); });
    track.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { e.preventDefault(); pindahKe(aktif + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); pindahKe(aktif - 1); }
    });

    // putar otomatis tiap 3,5 detik (jeda hanya saat sampul sedang diseret atau tab tidak aktif)
    function mulai() { henti(); timer = setInterval(() => { if (!tekan) pindahKe(terdekat() + 1); }, 3500); }
    function henti() { clearInterval(timer); }
    document.addEventListener("visibilitychange", () => document.hidden ? henti() : mulai());

    requestAnimationFrame(() => { track.scrollLeft = 0; aktif = -1; pindahKe(0); perbarui(); mulai(); });
}

/* 6. Dashboard ------------------------------------------------ */
function sapaan(jam) {
    if (jam < 11) return "Selamat pagi";
    if (jam < 15) return "Selamat siang";
    if (jam < 18) return "Selamat sore";
    return "Selamat malam";
}
function initDashboard(sesi) {
    $("#salam").textContent = `${sapaan(new Date().getHours())}, ${sesi.nama.split(" ")[0]}!`;

    const katalog = getKatalog(), pesanan = pesananTampil(sesi);
    $("#ringkasKatalog").textContent = `${katalog.length} judul · ${katalog.reduce((a, b) => a + b.stok, 0).toLocaleString("id-ID")} eksemplar tersedia`;
    $("#ringkasTracking").textContent = `${Object.keys(getTracking()).length} nomor DO dapat dilacak`;
    const lap = $("#ringkasLaporan");
    if (lap) lap.textContent = `Pendapatan ${rupiah(pesanan.reduce((a, o) => a + o.total, 0))}`;
    $("#ringkasHistory").textContent = `${pesanan.length} transaksi tercatat`;
    dashboardHidup(sesi);
}

/* 7. Informasi stok / katalog --------------------------------- */
function initStok() {
    let katalog = getKatalog();
    const tbody = $("#tbodyStok");

    // pilihan cover diambil dari data awal (gambar di folder img/)
    const selCover = $("#cover");
    [...new Set(dataKatalogBuku.map(b => b.cover))].forEach(c => selCover.add(new Option(namaCover(c), c)));

    const statusStok = n => n < 200 ? ["Menipis", "warn"] : ["Tersedia", "ok"];
    const sel = (tag, cls, teks) => { const e = document.createElement(tag); if (cls) e.className = cls; if (teks !== undefined) e.textContent = teks; return e; };

    function buatBaris(b, baru = false) {
        const tr = sel("tr", baru ? "baris-baru" : ""); tr.dataset.kode = b.kodeBarang;
        const tdCover = sel("td");
        if (b.cover) { const img = sel("img", "thumb"); img.src = b.cover; img.alt = "Sampul " + b.namaBarang; img.loading = "lazy"; tdCover.appendChild(img); }
        else tdCover.appendChild(sel("div", "thumb-kosong", "No img"));
        const [lbl, kls] = statusStok(b.stok);
        const tdStatus = sel("td"); tdStatus.appendChild(sel("span", "badge " + kls, lbl));
        const tdAksi = sel("td");
        const pesan = sel("a", "btn btn-sm btn-accent", "Pesan"); pesan.href = "checkout.html?kode=" + encodeURIComponent(b.kodeBarang);
        const hapus = sel("button", "btn btn-sm btn-danger", "Hapus"); hapus.type = "button"; hapus.style.marginLeft = ".4rem";
        hapus.addEventListener("click", async () => {
            if (!(await tampilAlert(`Hapus "${b.namaBarang}" dari katalog?`, { judul: "Konfirmasi hapus", tipe: "error", konfirmasi: true, teksOk: "Hapus" }))) return;
            katalog = katalog.filter(x => x.kodeBarang !== b.kodeBarang); simpan(KEY.katalog, katalog);
            tr.remove(); perbaruiStat(); cekKosong(); renderKartu();
        });
        tdAksi.append(pesan, hapus);
        const angka = sel("td", "angka", b.stok.toLocaleString("id-ID"));
        const harga = sel("td", "angka", b.harga);
        tr.append(tdCover, sel("td", "", b.kodeBarang), sel("td", "", b.namaBarang), sel("td", "", b.jenisBarang), sel("td", "", b.edisi), angka, harga, tdStatus, tdAksi);
        return tr;
    }
    /* Tampilan kartu (alternatif tabel) */
    const grid = sel("div", "grid-kartu"); grid.hidden = true;
    $(".tabel-bungkus").after(grid);
    const ganti = sel("div", "ganti-tampilan"); ganti.setAttribute("role", "group"); ganti.setAttribute("aria-label", "Pilih tampilan katalog");
    ganti.innerHTML = '<button type="button" data-mode="tabel">Tabel</button><button type="button" data-mode="kartu">Kartu</button>';
    $("#cariStok").after(ganti);
    let mode = "tabel"; try { mode = localStorage.getItem("ut_tampilan") === "kartu" ? "kartu" : "tabel"; } catch { /* abaikan */ }
    function setMode(m) {
        mode = m; try { localStorage.setItem("ut_tampilan", m); } catch { /* abaikan */ }
        $(".tabel-bungkus").hidden = m === "kartu";
        grid.hidden = m !== "kartu";
        $$("button", ganti).forEach(b => { const on = b.dataset.mode === m; b.classList.toggle("aktif", on); b.setAttribute("aria-pressed", String(on)); });
        if (m === "kartu") renderKartu();
    }
    ganti.addEventListener("click", e => { const m = e.target.dataset?.mode; if (m) setMode(m); });
    function renderKartu() {
        const q = $("#cariStok").value.toLowerCase();
        const terjual = jumlahTerjual();
        const juara = Object.keys(terjual).sort((a, b) => terjual[b] - terjual[a])[0];
        const data = katalog.filter(b => `${b.kodeBarang} ${b.namaBarang} ${b.jenisBarang}`.toLowerCase().includes(q));
        grid.innerHTML = data.map((b, i) => { const [lbl, kls] = statusStok(b.stok); return `
          <article class="kartu-buku" style="--i:${i}">
            <div class="kartu-sampul">${b.cover ? `<img src="${esc(b.cover)}" alt="Sampul ${esc(b.namaBarang)}" loading="lazy">` : '<div class="kartu-kosong">No img</div>'}
              <span class="badge ${kls}">${lbl}</span>${b.kodeBarang === juara ? '<span class="pita">Terlaris</span>' : ""}</div>
            <div class="kartu-isi"><span class="kartu-kode">${esc(b.kodeBarang)} · Edisi ${esc(b.edisi)}</span><h3>${esc(b.namaBarang)}</h3>
              <p class="kartu-meta">${esc(b.jenisBarang)} · Stok ${b.stok.toLocaleString("id-ID")}</p>
              <div class="kartu-bawah"><strong>${esc(b.harga)}</strong><a class="btn btn-sm btn-accent" href="checkout.html?kode=${encodeURIComponent(b.kodeBarang)}">Pesan</a></div></div>
          </article>`; }).join("") || '<p class="kosong">Tidak ada buku yang cocok.</p>';
    }
    function render() { tbody.replaceChildren(...katalog.map(b => buatBaris(b))); perbaruiStat(); cekKosong(); renderKartu(); }
    function perbaruiStat() {
        $("#statJudul").textContent = katalog.length;
        $("#statStok").textContent = katalog.reduce((a, b) => a + b.stok, 0).toLocaleString("id-ID");
        $("#statNilai").textContent = rupiah(katalog.reduce((a, b) => a + b.stok * parseRupiah(b.harga), 0));
    }
    function cekKosong() { $("#stokKosong").hidden = $$("tr", tbody).some(r => !r.hidden); }

    $("#cariStok").addEventListener("input", e => {
        const q = e.target.value.toLowerCase();
        $$("tr", tbody).forEach(r => r.hidden = !r.textContent.toLowerCase().includes(q));
        cekKosong(); renderKartu();
    });

    $("#formStok").addEventListener("submit", async e => {
        e.preventDefault(); bersihkanError(e.target);
        const kode = $("#kode").value.trim().toUpperCase(), nama = $("#nama").value.trim();
        const edisi = $("#edisi").value.trim(), stok = $("#stok").value.trim(), harga = $("#harga").value.trim();
        let ok = true;
        if (!/^[A-Z]{4}\d{4}$/.test(kode)) { setError("kode", "Format 4 huruf + 4 angka, mis. EKMA4101"); ok = false; }
        else if (katalog.some(b => b.kodeBarang === kode)) { setError("kode", "Kode sudah dipakai"); ok = false; }
        if (nama.length < 3) { setError("nama", "Nama buku minimal 3 karakter"); ok = false; }
        if (!/^[1-9]\d?$/.test(edisi)) { setError("edisi", "Edisi 1–99"); ok = false; }
        if (!/^\d+$/.test(stok)) { setError("stok", "Stok harus angka ≥ 0"); ok = false; }
        if (!/^[1-9]\d*$/.test(harga)) { setError("harga", "Harga harus angka > 0"); ok = false; }
        if (!ok) return;

        const buku = { kodeBarang: kode, namaBarang: nama, jenisBarang: $("#jenis").value, edisi, stok: Number(stok), harga: rupiah(harga), cover: $("#cover").value };
        katalog.push(buku); simpan(KEY.katalog, katalog);
        tbody.appendChild(buatBaris(buku, true));     // tambah baris lewat DOM
        perbaruiStat(); cekKosong(); renderKartu(); e.target.reset(); $("#kode").focus();
        tampilAlert(`"${nama}" berhasil ditambahkan ke katalog.`, { judul: "Stok baru ditambahkan", tipe: "ok" });
    });

    $("#btnReset").addEventListener("click", async () => {
        if (await tampilAlert("Kembalikan katalog ke data awal? Buku yang Anda tambahkan akan hilang.", { judul: "Reset katalog", tipe: "info", konfirmasi: true, teksOk: "Reset" })) {
            localStorage.removeItem(KEY.katalog); katalog = getKatalog(); render();
        }
    });
    render();
    setMode(mode);
}

/* 8. Checkout / pemesanan ------------------------------------- */
const ONGKIR = { "JNE": 15000, "Pos Indonesia": 12000, "J&T Express": 18000 };

function initCheckout(sesi) {
    const katalog = getKatalog();
    let keranjang = [];                       // [{kode, qty}]
    const cari = kode => katalog.find(b => b.kodeBarang === kode);
    const tbody = $("#tbodyKeranjang");

    katalog.forEach(b => $("#pilihBuku").add(new Option(`${b.namaBarang} (${b.harga}) – stok ${b.stok}`, b.kodeBarang)));
    $("#namaPemesan").value = sesi.nama; $("#emailPemesan").value = sesi.email;

    function tambah(kode, qty) {
        const buku = cari(kode); if (!buku) return;
        const ada = keranjang.find(k => k.kode === kode);
        const total = (ada ? ada.qty : 0) + qty;
        if (total > buku.stok) { tampilAlert(`Stok "${buku.namaBarang}" hanya ${buku.stok}.`, { judul: "Stok tidak cukup", tipe: "error" }); return; }
        ada ? ada.qty = total : keranjang.push({ kode, qty });
        renderKeranjang();
    }
    function renderKeranjang() {
        tbody.replaceChildren();
        keranjang.forEach(item => {
            const b = cari(item.kode), tr = document.createElement("tr");
            const harga = parseRupiah(b.harga);
            tr.innerHTML = `<td><strong>${esc(b.namaBarang)}</strong><br><small class="muted">${esc(b.kodeBarang)}</small></td>
                <td class="angka">${rupiah(harga)}</td>
                <td><input class="input-qty" type="number" min="1" max="${b.stok}" value="${item.qty}" aria-label="Jumlah ${esc(b.namaBarang)}"></td>
                <td class="angka">${rupiah(harga * item.qty)}</td>
                <td><button type="button" class="btn btn-sm btn-danger">Hapus</button></td>`;
            $("input", tr).addEventListener("change", e => {
                let q = parseInt(e.target.value, 10);
                if (!q || q < 1) q = 1;
                if (q > b.stok) { q = b.stok; tampilAlert(`Stok tersedia hanya ${b.stok}.`, { judul: "Melebihi stok", tipe: "info" }); }
                item.qty = q; renderKeranjang();
            });
            $("button", tr).addEventListener("click", () => { keranjang = keranjang.filter(k => k !== item); renderKeranjang(); });
            tbody.appendChild(tr);
        });
        $("#keranjangKosong").hidden = keranjang.length > 0;
        hitung();
    }
    function hitung() {
        const sub = keranjang.reduce((a, k) => a + parseRupiah(cari(k.kode).harga) * k.qty, 0);
        const ongkir = keranjang.length ? (ONGKIR[$("#ekspedisi").value] || 0) : 0;
        $("#subtotal").textContent = rupiah(sub); $("#ongkir").textContent = rupiah(ongkir); $("#grandTotal").textContent = rupiah(sub + ongkir);
        return { sub, ongkir, total: sub + ongkir };
    }

    $("#btnTambah").addEventListener("click", () => {
        bersihkanError($("#formPilih"));
        const kode = $("#pilihBuku").value, qty = parseInt($("#jumlah").value, 10);
        if (!kode) { setError("pilihBuku", "Pilih buku terlebih dahulu"); return; }
        if (!qty || qty < 1) { setError("jumlah", "Min. 1"); return; }
        tambah(kode, qty);
    });
    $("#ekspedisi").addEventListener("change", hitung);

    const kodeUrl = new URLSearchParams(location.search).get("kode");
    if (kodeUrl && cari(kodeUrl)) tambah(kodeUrl, 1); else renderKeranjang();

    $("#formPesan").addEventListener("submit", async e => {
        e.preventDefault(); bersihkanError(e.target);
        const nama = $("#namaPemesan").value.trim(), email = $("#emailPemesan").value.trim(), telp = $("#telepon").value.trim();
        const alamat = $("#alamat").value.trim(), eks = $("#ekspedisi").value, metode = $("#metode").value;
        let ok = true;
        if (nama.length < 3) { setError("namaPemesan", "Nama minimal 3 karakter"); ok = false; }
        if (!emailValid(email)) { setError("emailPemesan", "Format email tidak valid"); ok = false; }
        if (!telpValid(telp)) { setError("telepon", "Nomor HP tidak valid, mis. 081234567890"); ok = false; }
        if (alamat.length < 10) { setError("alamat", "Alamat minimal 10 karakter"); ok = false; }
        if (!eks) { setError("ekspedisi", "Pilih ekspedisi"); ok = false; }
        if (!metode) { setError("metode", "Pilih metode pembayaran"); ok = false; }
        if (!keranjang.length) { tampilAlert("Keranjang masih kosong. Tambahkan minimal satu buku.", { judul: "Keranjang kosong", tipe: "error" }); return; }
        if (!ok) return;

        const { total, ongkir } = hitung();
        if (!(await tampilAlert(`Total pembayaran ${rupiah(total)} via ${metode}. Lanjutkan pemesanan?`, { judul: "Konfirmasi pesanan", konfirmasi: true, teksOk: "Pesan sekarang" }))) return;

        const riwayat = getRiwayat();
        const noDO = String(Math.max(...riwayat.map(o => Number(o.nomorDO)), 20230000) + 1);
        const items = keranjang.map(k => { const b = cari(k.kode); return { kode: b.kodeBarang, nama: b.namaBarang, harga: parseRupiah(b.harga), qty: k.qty }; });
        riwayat.push({ nomorDO: noDO, tanggal: hariIni(), nama, metode, ongkir, items, total, status: "Diproses" });
        simpan(KEY.riwayat, riwayat);

        const lacak = muat(KEY.tracking, {});
        lacak[noDO] = { nomorDO: noDO, nama, status: "Diproses", ekspedisi: eks, tanggalKirim: hariIni(), paket: "0WEB" + noDO.slice(-4), total: rupiah(total),
            perjalanan: [{ waktu: sekarang(), keterangan: "Pesanan diterima, sedang dikemas oleh gudang Universitas Terbuka" }] };
        simpan(KEY.tracking, lacak);

        const baru = getKatalog();               // kurangi stok
        keranjang.forEach(k => { const b = baru.find(x => x.kodeBarang === k.kode); if (b) b.stok -= k.qty; });
        simpan(KEY.katalog, baru);

        $("#doBaru").textContent = noDO; $("#totalBaru").textContent = rupiah(total);
        $("#linkLacak").href = "tracking.html?do=" + noDO;
        bukaDialog("dlgSukses");
        setTimeout(() => konfeti($("#dlgSukses")), 200);
        $("#dlgSukses").addEventListener("close", () => location.href = "history.html", { once: true });
    });
}

/* 9. Tracking pengiriman -------------------------------------- */
const LANGKAH = ["Diproses", "Dikirim", "Dalam Perjalanan", "Selesai"];

function initTracking() {
    const hasil = $("#hasilTracking");
    function cariDO(no) {
        bersihkanError($("#formCari"));
        no = no.trim();
        if (!no) { setError("nomorDO", "Nomor Delivery Order wajib diisi"); hasil.replaceChildren(); return; }
        if (!/^\d{6,12}$/.test(no)) { setError("nomorDO", "Nomor DO terdiri dari 6–12 angka"); hasil.replaceChildren(); return; }
        const d = getTracking()[no];
        if (!d) {
            hasil.innerHTML = `<p class="pesan-info" role="alert">Nomor DO ${esc(no)} tidak ditemukan. Periksa kembali nomor Anda.</p>`;
            tampilAlert(`Nomor Delivery Order ${no} tidak ditemukan.`, { judul: "Data tidak ada", tipe: "error" });
            return;
        }
        const idx = Math.max(LANGKAH.indexOf(d.status), 0);
        const langkah = LANGKAH.map((l, i) => {
            const kls = (i < idx || (i === idx && d.status === "Selesai")) ? "selesai" : i === idx ? "sekarang" : "";
            return `<li class="${kls}"><span class="bulat">${kls === "selesai" ? "✓" : i + 1}</span>${l}</li>`;
        }).join("");
        const jejak = [...d.perjalanan].reverse().map(p => `<li><time>${esc(p.waktu)}</time>${esc(p.keterangan)}</li>`).join("");
        hasil.innerHTML = `
          <section class="card" aria-labelledby="hNama">
            <div class="kepala-hasil"><div><span class="muted">Nama pemesan</span><h2 id="hNama">${esc(d.nama)}</h2></div>
              <span class="badge ${kelasStatus(d.status)}">${esc(d.status)}</span></div>
            <ol class="stepper ada-truk" aria-label="Progres pengiriman"><span class="garis-isi" id="garisIsi"></span><span class="truk" id="truk" aria-hidden="true">${SVG_TRUK}</span>${langkah}</ol>
          </section>
          <section class="card" aria-labelledby="hDetail"><h2 id="hDetail">Detail pengiriman</h2>
            <dl class="detail-daftar">
              <div><dt>Nomor DO</dt><dd>${esc(d.nomorDO)}<button type="button" class="btn btn-sm btn-ghost btn-salin" data-salin="${esc(d.nomorDO)}">Salin nomor DO</button></dd></div><div><dt>Ekspedisi</dt><dd>${esc(d.ekspedisi)}</dd></div>
              <div><dt>Tanggal kirim</dt><dd>${esc(d.tanggalKirim)}</dd></div><div><dt>Jenis paket</dt><dd>${esc(d.paket)}</dd></div>
              <div><dt>Total pembayaran</dt><dd>${esc(d.total)}</dd></div></dl></section>
          <section class="card" aria-labelledby="hJejak"><h2 id="hJejak">Riwayat perjalanan</h2><ul class="linimasa">${jejak}</ul></section>`;
        setTimeout(() => { const g = $("#garisIsi"); if (g) g.style.width = (idx / 3 * 75) + "%"; jalankanTruk(idx); }, 80);
        $("[data-salin]", hasil)?.addEventListener("click", e => salinTeks(e.currentTarget.dataset.salin, e.currentTarget));
    }
    $("#formCari").addEventListener("submit", e => { e.preventDefault(); cariDO($("#nomorDO").value); });
    $$(".contoh-do").forEach(b => b.addEventListener("click", () => { $("#nomorDO").value = b.textContent; cariDO(b.textContent); }));
    const dariUrl = new URLSearchParams(location.search).get("do");
    if (dariUrl) { $("#nomorDO").value = dariUrl; cariDO(dariUrl); }
}

/* 10. Laporan & riwayat transaksi ------------------------------ */
function initLaporan(sesi) {
    const pesanan = pesananTampil(sesi);
    const perBuku = {};
    pesanan.forEach(o => o.items.forEach(i => {
        perBuku[i.kode] ??= { kode: i.kode, nama: i.nama, terjual: 0, omzet: 0 };
        perBuku[i.kode].terjual += i.qty; perBuku[i.kode].omzet += i.qty * i.harga;
    }));
    const daftar = Object.values(perBuku).sort((a, b) => b.omzet - a.omzet);
    const omzet = pesanan.reduce((a, o) => a + o.total, 0), terjual = daftar.reduce((a, b) => a + b.terjual, 0);
    $("#lapPesanan").textContent = pesanan.length;
    $("#lapTerjual").textContent = terjual;
    $("#lapOmzet").textContent = rupiah(omzet);
    $("#lapRata").textContent = rupiah(pesanan.length ? Math.round(omzet / pesanan.length) : 0);
    $("#lapCakupan").textContent = sesi.role === "Admin" ? "Seluruh pengguna" : "Pesanan milik " + sesi.nama;

    const maks = Math.max(...daftar.map(d => d.omzet), 1);
    $("#grafik").innerHTML = daftar.map(d => `<div class="grafik-baris"><span>${esc(d.nama)}</span>
        <div class="grafik-lintasan"><div class="grafik-isi" data-lebar="${d.omzet / maks * 100}"></div></div><strong class="angka">${rupiah(d.omzet)}</strong></div>`).join("")
        || '<p class="kosong">Belum ada data penjualan.</p>';
    setTimeout(() => $$(".grafik-isi").forEach(g => g.style.width = g.dataset.lebar + "%"), 80);
    $("#tbodyLaporan").innerHTML = daftar.map(d => `<tr><td>${esc(d.kode)}</td><td>${esc(d.nama)}</td><td class="angka">${d.terjual}</td><td class="angka">${rupiah(d.omzet)}</td></tr>`).join("");
    $("#btnCetak").addEventListener("click", () => window.print());
}

function initHistory(sesi) {
    const semua = pesananTampil(sesi).sort((a, b) => b.nomorDO.localeCompare(a.nomorDO));
    const tbody = $("#tbodyHistory");
    function render() {
        const q = $("#cariHistory").value.toLowerCase(), st = $("#filterStatus").value;
        const data = semua.filter(o => (!st || o.status === st) && (`${o.nomorDO} ${o.nama}`.toLowerCase().includes(q)));
        tbody.innerHTML = data.map(o => `<tr><td><strong>${esc(o.nomorDO)}</strong></td><td>${esc(o.tanggal)}</td><td>${esc(o.nama)}</td>
            <td class="angka">${o.items.reduce((a, i) => a + i.qty, 0)}</td><td class="angka">${rupiah(o.total)}</td><td>${esc(o.metode)}</td>
            <td><span class="badge ${kelasStatus(o.status)}">${esc(o.status)}</span></td>
            <td><button class="btn btn-sm btn-ghost" data-do="${esc(o.nomorDO)}">Detail</button></td></tr>`).join("");
        $("#historyKosong").hidden = data.length > 0;
    }
    tbody.addEventListener("click", e => {
        const no = e.target.dataset.do; if (!no) return;
        const o = semua.find(x => x.nomorDO === no);
        $("#detailJudul").textContent = "Pesanan " + o.nomorDO;
        $("#detailIsi").innerHTML = `<p class="muted">${esc(o.tanggal)} · ${esc(o.nama)} · ${esc(o.metode)}</p>
          <div class="tabel-bungkus"><table><thead><tr><th>Buku</th><th class="angka">Qty</th><th class="angka">Subtotal</th></tr></thead><tbody>
          ${o.items.map(i => `<tr><td>${esc(i.nama)}</td><td class="angka">${i.qty}</td><td class="angka">${rupiah(i.harga * i.qty)}</td></tr>`).join("")}
          </tbody></table></div><p style="margin:.8rem 0 0;text-align:right"><strong>Total: ${rupiah(o.total)}</strong>${o.ongkir ? ` (termasuk ongkir ${rupiah(o.ongkir)})` : ""}</p>`;
        $("#linkLacakDetail").href = "tracking.html?do=" + o.nomorDO;
        bukaDialog("dlgDetail");
    });
    $("#cariHistory").addEventListener("input", render);
    $("#filterStatus").addEventListener("change", render);
    render();
}

/* 11. Init --------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    aktifkanDialog();
    initTema();
    const halaman = document.body.dataset.page;
    if (halaman === "login") return initLogin();
    const sesi = wajibLogin(); if (!sesi) return;
    if (halaman === "laporan" && sesi.role !== "Admin") {      // blokir akses lewat URL langsung
        tampilAlert("Halaman Laporan hanya dapat dibuka oleh Admin.", { judul: "Akses ditolak", tipe: "error" }).then(() => location.replace("dashboard.html"));
        return;
    }
    ({ dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking, laporan: initLaporan, history: initHistory })[halaman]?.(sesi);
});

/* 12. Tambahan fitur visual ------------------------------------ */

/* Jumlah eksemplar terjual per kode buku (dari seluruh pesanan) */
function jumlahTerjual() {
    const m = {};
    getRiwayat().forEach(o => o.items.forEach(i => { m[i.kode] = (m[i.kode] || 0) + i.qty; }));
    return m;
}

/* Notifikasi kecil di pojok */
function toast(pesan) {
    let w = $(".toast-wadah");
    if (!w) { w = document.createElement("div"); w.className = "toast-wadah"; w.setAttribute("role", "status"); w.setAttribute("aria-live", "polite"); document.body.appendChild(w); }
    const t = document.createElement("div"); t.className = "toast"; t.textContent = pesan; w.appendChild(t);
    setTimeout(() => { t.classList.add("keluar"); setTimeout(() => t.remove(), 300); }, 2200);
}

/* Salin teks ke clipboard (dengan cadangan bila API clipboard tidak tersedia) */
async function salinTeks(teks, tombol) {
    let ok = false;
    try { await navigator.clipboard.writeText(teks); ok = true; }
    catch {
        const ta = document.createElement("textarea");
        ta.value = teks; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand("copy"); } catch { /* abaikan */ }
        ta.remove();
    }
    toast(ok ? `Nomor DO ${teks} disalin` : "Gagal menyalin, silakan salin manual");
    if (ok && tombol) { const awal = tombol.textContent; tombol.textContent = "Tersalin ✓"; setTimeout(() => { tombol.textContent = awal; }, 1600); }
}

/* Truk di atas progress bar tracking */
const SVG_TRUK = '<svg viewBox="0 0 48 28" width="48" height="28" fill="none"><path d="M1 8h6M0 13h8M2 18h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".5"/><rect x="9" y="3" width="22" height="16" rx="2.5" fill="#ff5d8f"/><path d="M31 8h7l5 5v6H31z" fill="#7c3aed"/><path d="M34 10.2h3.2l2.6 2.8H34z" fill="#e0e7ff"/><circle cx="17" cy="21" r="4" fill="#2a1650" stroke="#fff" stroke-width="1.6"/><circle cx="37" cy="21" r="4" fill="#2a1650" stroke="#fff" stroke-width="1.6"/></svg>';
function jalankanTruk(idx) {
    const truk = $("#truk"); if (!truk) return;
    const akhir = 12.5 + idx / 3 * 75;                 // sejajar dengan bulatan langkah
    truk.style.left = akhir + "%";
    if (!truk.animate || idx === 0) return;
    truk.animate([{ left: "12.5%" }, { left: akhir + "%" }], { duration: 900, easing: "ease-in-out" });
    $("svg", truk).animate([{ transform: "translateY(0)" }, { transform: "translateY(-2px)" }, { transform: "translateY(0)" }], { duration: 220, iterations: 4 });
}

/* Dashboard: buku terlaris, pesanan terakhir, paket aktif */
function dashboardHidup(sesi) {
    const katalog = getKatalog(), pesanan = pesananTampil(sesi), lacak = getTracking();
    const cover = kode => katalog.find(b => b.kodeBarang === kode)?.cover;
    const urut = [...pesanan].sort((a, b) => b.nomorDO.localeCompare(a.nomorDO));

    const terjual = {};
    pesanan.forEach(o => o.items.forEach(i => { terjual[i.kode] ??= { kode: i.kode, nama: i.nama, qty: 0 }; terjual[i.kode].qty += i.qty; }));
    const top = Object.values(terjual).sort((a, b) => b.qty - a.qty).slice(0, 3);
    const maks = Math.max(...top.map(t => t.qty), 1);
    const terakhir = urut.slice(0, 4);
    const aktif = urut.filter(o => o.status !== "Selesai");

    const kosong = t => `<p class="kosong" style="padding:1rem 0">${t}</p>`;
    const htmlTop = top.map((t, i) => `<li class="baris-mini"><span class="peringkat">${i + 1}</span>
        ${cover(t.kode) ? `<img src="${esc(cover(t.kode))}" alt="" loading="lazy">` : ""}
        <span class="info"><strong>${esc(t.nama)}</strong><span class="muted">${t.qty} eksemplar terjual</span>
        <span class="bar-mini"><i data-lebar="${t.qty / maks * 100}"></i></span></span></li>`).join("");
    const htmlAkhir = terakhir.map(o => `<li><a class="baris-mini" href="tracking.html?do=${esc(o.nomorDO)}">
        <span class="info"><strong>${esc(o.nomorDO)}</strong><span class="muted">${esc(o.tanggal)} · ${o.items.reduce((a, i) => a + i.qty, 0)} buku</span></span>
        <span class="kanan"><strong>${rupiah(o.total)}</strong><span class="badge ${kelasStatus(o.status)}">${esc(o.status)}</span></span></a></li>`).join("");
    const htmlAktif = aktif.map(o => {
        const idx = Math.max(LANGKAH.indexOf(o.status), 0);
        return `<li><a class="baris-mini" href="tracking.html?do=${esc(o.nomorDO)}">
        <span class="info"><strong>${esc(o.nomorDO)}</strong><span class="muted">${esc(lacak[o.nomorDO]?.ekspedisi || "Ekspedisi")} · ${esc(o.status)}</span>
        <span class="langkah-mini" aria-hidden="true">${LANGKAH.map((_, n) => `<i class="${n <= idx ? "isi" : ""}"></i>`).join("")}</span></span>
        <span class="kanan"><span class="aksi-lacak">Lacak &rsaquo;</span></span></a></li>`;
    }).join("");

    const sec = document.createElement("section");
    sec.className = "dash-hidup"; sec.setAttribute("aria-label", "Ringkasan aktivitas");
    sec.innerHTML = `
      <article class="card"><h2>Buku terlaris</h2>${top.length ? `<ol class="daftar-mini">${htmlTop}</ol>` : kosong("Belum ada data penjualan.")}</article>
      <article class="card"><h2>Pesanan terakhir</h2>${terakhir.length ? `<ul class="daftar-mini">${htmlAkhir}</ul>` : kosong("Belum ada pesanan.")}</article>
      <article class="card"><h2>Paket aktif <span class="badge info">${aktif.length}</span></h2>${aktif.length ? `<ul class="daftar-mini">${htmlAktif}</ul>` : kosong("Tidak ada paket yang sedang diproses atau dikirim.")}</article>`;
    ($(".aksi-cepat") || $("main.konten")).after(sec);
    setTimeout(() => $$(".bar-mini i", sec).forEach(i => { i.style.width = i.dataset.lebar + "%"; }), 120);
}

/* Konfeti (canvas) saat pesanan berhasil */
function konfeti(induk = document.body) {
    const c = document.createElement("canvas"); c.className = "konfeti"; c.setAttribute("aria-hidden", "true");
    induk.appendChild(c);
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const warna = ["#ff5d8f", "#ffc857", "#2ec4b6", "#7c3aed", "#ffffff"];
    const kepingan = [];
    const semburan = (x, y, sudutPusat, sebaran, jumlah, kuat) => {
        for (let i = 0; i < jumlah; i++) {
            const a = sudutPusat + (Math.random() - .5) * sebaran, v = kuat * (.45 + Math.random() * .75);
            kepingan.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
                rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35, warna: warna[(Math.random() * warna.length) | 0], bulat: Math.random() < .25 });
        }
    };
    semburan(W / 2, H * .38, -Math.PI / 2, Math.PI * 1.7, 120, 11);      // letupan tengah
    semburan(0, H, -Math.PI / 3, .9, 60, 17);                            // sudut kiri bawah
    semburan(W, H, -Math.PI * 2 / 3, .9, 60, 17);                        // sudut kanan bawah
    let frame = 0;
    const dlg = induk.closest?.("dialog");
    const bersih = () => c.remove();
    dlg?.addEventListener("close", bersih, { once: true });
    (function gambar() {
        if (!c.isConnected) return;
        ctx.clearRect(0, 0, W, H);
        frame++;
        kepingan.forEach(k => {
            k.vy += .22; k.vx *= .99; k.vy *= .992; k.x += k.vx; k.y += k.vy; k.rot += k.vr;
            ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, (300 - frame) / 70));
            ctx.translate(k.x, k.y); ctx.rotate(k.rot); ctx.fillStyle = k.warna;
            if (k.bulat) { ctx.beginPath(); ctx.arc(0, 0, k.h / 1.6, 0, 6.28); ctx.fill(); } else ctx.fillRect(-k.w / 2, -k.h / 2, k.w, k.h);
            ctx.restore();
        });
        if (frame < 300) requestAnimationFrame(gambar); else bersih();
    })();
}