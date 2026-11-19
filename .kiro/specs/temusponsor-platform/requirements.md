# Requirements Document

## Introduction

TemuSponsor adalah platform web frontend interaktif berbasis HTML5, CSS3, dan Vanilla JavaScript yang mempertemukan panitia acara dengan calon sponsor yang sesuai. Platform ini menyediakan fitur pencarian sponsor, smart matching berbasis skor, manajemen acara, pengajuan kerja sama, dan penyimpanan data via localStorage. Seluruh antarmuka menggunakan desain modern corporate SaaS dengan bahasa Indonesia, dan navigasi berbasis SPA (Single Page Application) tanpa reload halaman.

---

## Glossary

- **TemuSponsor**: Nama platform web yang dibangun; disebut juga "sistem" dalam dokumen ini.
- **Panitia**: Pengguna platform — meliputi panitia acara sekolah, OSIS/MPK, organisasi mahasiswa, event organizer, dan komunitas non-profit.
- **Sponsor**: Perusahaan atau entitas yang menawarkan dukungan berupa dana, produk, voucher, merchandise, diskon, atau workshop kepada penyelenggara acara.
- **Acara**: Kegiatan yang direncanakan oleh Panitia dan membutuhkan dukungan dari Sponsor.
- **Pengajuan**: Formulir kerja sama yang dikirimkan oleh Panitia kepada Sponsor.
- **Matching_Engine**: Komponen JavaScript yang menghitung skor kesesuaian antara profil Acara dan data Sponsor.
- **Sponsor_Card**: Komponen UI kartu yang menampilkan ringkasan informasi satu Sponsor.
- **localStorage**: Mekanisme penyimpanan data persisten di sisi klien (browser).
- **SPA_Router**: Komponen JavaScript yang menangani navigasi antar halaman tanpa reload browser.
- **Toast**: Notifikasi ringkas yang muncul sementara di layar untuk memberikan umpan balik aksi pengguna.
- **Sidebar**: Panel navigasi vertikal tetap di sisi kiri layar.
- **Topbar**: Bar navigasi horizontal di bagian atas konten utama.
- **Modal**: Jendela dialog yang tampil di atas konten utama untuk konfirmasi atau pratinjau.
- **Badge**: Label kecil berwarna yang menampilkan status atau kategori.
- **Proposal**: Dokumen PDF yang diunggah oleh Panitia sebagai bagian dari Pengajuan.

---

## Requirements

### Requirement 1: Navigasi SPA

**User Story:** Sebagai Panitia, saya ingin berpindah antar halaman tanpa reload browser, sehingga pengalaman penggunaan terasa cepat dan mulus.

#### Acceptance Criteria

1. THE SPA_Router SHALL merender halaman yang sesuai di area konten utama ketika Panitia mengklik item navigasi pada Sidebar, tanpa memuat ulang dokumen HTML.
2. THE SPA_Router SHALL menyorot item navigasi aktif pada Sidebar sesuai halaman yang sedang ditampilkan.
3. THE SPA_Router SHALL menampilkan halaman Landing Page sebagai tampilan awal ketika pengguna pertama kali membuka aplikasi.
4. IF halaman yang diminta tidak ditemukan, THEN THE SPA_Router SHALL menampilkan pesan "Halaman tidak ditemukan" di area konten utama.

---

### Requirement 2: Landing Page

**User Story:** Sebagai Panitia, saya ingin melihat halaman utama yang informatif, sehingga saya memahami manfaat dan cara penggunaan TemuSponsor sebelum mulai menggunakannya.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan nama platform "TemuSponsor" dan tagline "Connect Your Event with the Right Partners." pada bagian hero Landing Page.
2. THE TemuSponsor SHALL menampilkan paling sedikit tiga poin manfaat utama platform pada Landing Page.
3. WHEN Panitia mengklik tombol ajakan bertindak (CTA) pada Landing Page, THE SPA_Router SHALL mengarahkan Panitia ke halaman Cari Sponsor.
4. THE TemuSponsor SHALL menampilkan statistik ringkasan (jumlah sponsor tersedia, jumlah kategori) yang diambil secara dinamis dari data dummy pada Landing Page.

---

### Requirement 3: Dashboard

**User Story:** Sebagai Panitia, saya ingin melihat ringkasan aktivitas saya di satu halaman, sehingga saya dapat memantau status acara, pengajuan, dan sponsor tersimpan dengan cepat.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan jumlah total Acara yang telah dibuat Panitia pada Dashboard, diambil dari localStorage.
2. THE TemuSponsor SHALL menampilkan jumlah total Pengajuan yang telah dikirim Panitia pada Dashboard, diambil dari localStorage.
3. THE TemuSponsor SHALL menampilkan jumlah total Sponsor yang telah disimpan Panitia pada Dashboard, diambil dari localStorage.
4. THE TemuSponsor SHALL menampilkan daftar Pengajuan terbaru (maksimal 5) beserta status masing-masing pada Dashboard.
5. WHEN Panitia mengklik tautan pintasan pada Dashboard, THE SPA_Router SHALL mengarahkan Panitia ke halaman yang sesuai.

---

### Requirement 4: Pencarian dan Filter Sponsor

**User Story:** Sebagai Panitia, saya ingin mencari dan memfilter daftar sponsor, sehingga saya dapat menemukan sponsor yang paling sesuai dengan kebutuhan acara saya secara efisien.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan paling sedikit 15 data Sponsor dalam bentuk Sponsor_Card pada halaman Cari Sponsor.
2. WHEN Panitia mengetikkan kata kunci pada search bar, THE TemuSponsor SHALL memfilter daftar Sponsor secara real-time sehingga hanya menampilkan Sponsor yang nama atau kategorinya mengandung kata kunci tersebut.
3. WHEN Panitia memilih nilai pada filter Kategori Bisnis, THE TemuSponsor SHALL memfilter daftar Sponsor sehingga hanya menampilkan Sponsor dengan kategori yang sesuai.
4. WHEN Panitia memilih nilai pada filter Lokasi, THE TemuSponsor SHALL memfilter daftar Sponsor sehingga hanya menampilkan Sponsor dengan lokasi yang sesuai.
5. WHEN Panitia memilih nilai pada filter Bentuk Dukungan, THE TemuSponsor SHALL memfilter daftar Sponsor sehingga hanya menampilkan Sponsor yang menyediakan bentuk dukungan yang dipilih.
6. WHEN Panitia memilih nilai pada filter Skala Perusahaan, THE TemuSponsor SHALL memfilter daftar Sponsor sehingga hanya menampilkan Sponsor dengan skala perusahaan yang sesuai.
7. WHEN Panitia memilih nilai pada filter Kesesuaian Acara, THE TemuSponsor SHALL memfilter daftar Sponsor berdasarkan jenis acara yang dilayani Sponsor tersebut.
8. WHEN beberapa filter diterapkan secara bersamaan, THE TemuSponsor SHALL menampilkan Sponsor yang memenuhi semua kondisi filter secara kumulatif.
9. WHEN Panitia memilih opsi pengurutan "Nama A-Z", THE TemuSponsor SHALL mengurutkan daftar Sponsor yang ditampilkan berdasarkan nama secara alfabet menaik.
10. WHEN Panitia memilih opsi pengurutan "Nama Z-A", THE TemuSponsor SHALL mengurutkan daftar Sponsor yang ditampilkan berdasarkan nama secara alfabet menurun.
11. IF tidak ada Sponsor yang cocok dengan kombinasi filter yang diterapkan, THEN THE TemuSponsor SHALL menampilkan pesan "Tidak ada sponsor yang cocok dengan filter yang dipilih."

---

### Requirement 5: Sponsor_Card dan Detail Sponsor

**User Story:** Sebagai Panitia, saya ingin melihat informasi ringkas dan lengkap tentang setiap sponsor, sehingga saya dapat menilai kesesuaiannya sebelum mengajukan kerja sama.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan logo, nama, kategori bisnis, lokasi, deskripsi singkat, bentuk dukungan yang tersedia, dan label kesesuaian acara pada setiap Sponsor_Card.
2. WHEN Panitia mengklik tombol "Detail" pada Sponsor_Card, THE TemuSponsor SHALL menampilkan halaman Detail Sponsor dengan informasi lengkap Sponsor tersebut.
3. THE TemuSponsor SHALL menampilkan kontak, website, deskripsi lengkap, dan riwayat acara yang pernah disponsori pada halaman Detail Sponsor.
4. WHEN Panitia mengklik tombol "Buat Pengajuan" pada halaman Detail Sponsor, THE SPA_Router SHALL mengarahkan Panitia ke halaman Pengajuan Kerja Sama dengan nama Sponsor tersebut telah terisi otomatis.
5. WHEN Panitia mengklik ikon Bookmark pada Sponsor_Card dan Sponsor belum disimpan, THE TemuSponsor SHALL menyimpan data Sponsor tersebut ke localStorage dan menampilkan Toast konfirmasi.
6. WHEN Panitia mengklik ikon Bookmark pada Sponsor_Card dan Sponsor sudah disimpan, THE TemuSponsor SHALL menghapus data Sponsor tersebut dari localStorage dan menampilkan Toast konfirmasi.
7. THE TemuSponsor SHALL menampilkan ikon Bookmark dalam kondisi aktif (tersimpan) atau tidak aktif secara konsisten dengan data localStorage saat halaman dimuat.

---

### Requirement 6: Smart Sponsor Matching

**User Story:** Sebagai Panitia, saya ingin mendapatkan rekomendasi sponsor berdasarkan profil acara saya, sehingga saya tidak perlu menilai satu per satu secara manual.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan formulir matching dengan field: nama acara, kategori acara, lokasi acara, target audiens, jenis acara, dan bentuk dukungan yang dibutuhkan.
2. WHEN Panitia mengisi formulir matching dan mengklik tombol "Cari Sponsor Cocok", THE Matching_Engine SHALL menghitung skor kesesuaian untuk setiap Sponsor menggunakan bobot berikut: kategori bisnis sesuai kategori acara bernilai 30 poin, lokasi sesuai bernilai 20 poin, bentuk dukungan sesuai bernilai 25 poin, target audiens sesuai bernilai 15 poin, jenis acara sesuai bernilai 10 poin.
3. THE Matching_Engine SHALL mengklasifikasikan hasil skor dengan label: skor 85 sampai 100 poin sebagai "Sangat Direkomendasikan", skor 70 sampai 84 poin sebagai "Direkomendasikan", skor 50 sampai 69 poin sebagai "Cukup Relevan", skor di bawah 50 poin sebagai "Alternatif".
4. THE TemuSponsor SHALL menampilkan hasil matching sebagai daftar Sponsor_Card yang diurutkan dari skor tertinggi ke terendah, disertai label klasifikasi dan nilai skor pada setiap kartu.
5. IF Panitia mengklik tombol "Cari Sponsor Cocok" tanpa mengisi semua field yang diwajibkan, THEN THE TemuSponsor SHALL menampilkan pesan validasi dan tidak menjalankan proses matching.
6. THE Matching_Engine SHALL menghasilkan skor total maksimum 100 poin untuk setiap Sponsor.

---

### Requirement 7: Sponsor Tersimpan

**User Story:** Sebagai Panitia, saya ingin melihat dan mengelola daftar sponsor yang telah saya simpan, sehingga saya dapat dengan mudah menemukan kembali sponsor favorit saya.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan seluruh Sponsor yang tersimpan di localStorage dalam format tabel pada halaman Sponsor Tersimpan, dengan kolom: logo, nama, kategori, lokasi, bentuk dukungan, tanggal disimpan, dan aksi.
2. WHEN Panitia mengklik aksi "Lihat Detail" pada baris tabel, THE SPA_Router SHALL mengarahkan Panitia ke halaman Detail Sponsor yang sesuai.
3. WHEN Panitia mengklik aksi "Buat Pengajuan" pada baris tabel, THE SPA_Router SHALL mengarahkan Panitia ke halaman Pengajuan Kerja Sama dengan nama Sponsor tersebut telah terisi otomatis.
4. WHEN Panitia mengklik aksi "Hapus" pada baris tabel, THE TemuSponsor SHALL menampilkan Modal konfirmasi penghapusan sebelum menghapus data dari localStorage.
5. WHEN Panitia mengkonfirmasi penghapusan pada Modal, THE TemuSponsor SHALL menghapus Sponsor tersebut dari localStorage, memperbarui tampilan tabel secara dinamis, dan menampilkan Toast konfirmasi.
6. IF tidak ada Sponsor yang tersimpan, THEN THE TemuSponsor SHALL menampilkan pesan "Belum ada sponsor yang disimpan." beserta tautan menuju halaman Cari Sponsor.

---

### Requirement 8: Pengajuan Kerja Sama

**User Story:** Sebagai Panitia, saya ingin mengisi dan mengirimkan formulir pengajuan kerja sama, sehingga saya dapat mendokumentasikan permintaan sponsorship untuk sponsor yang saya tuju.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan formulir Pengajuan dengan 14 field berikut: nama organisasi, nama penanggung jawab, email, nomor telepon, nama acara, kategori acara, tanggal acara, lokasi acara, perkiraan jumlah peserta, deskripsi acara, bentuk kerja sama yang diinginkan, benefit yang ditawarkan kepada Sponsor, nominal dukungan yang diharapkan, dan unggah file proposal (format PDF).
2. IF Panitia mengklik tombol "Pratinjau" sebelum submit, THEN THE TemuSponsor SHALL menampilkan Modal yang merangkum seluruh isian formulir untuk diperiksa kembali oleh Panitia.
3. WHEN Panitia mengklik tombol "Kirim Pengajuan", THE TemuSponsor SHALL memvalidasi bahwa semua field wajib telah diisi sebelum menyimpan data.
4. IF validasi formulir gagal, THEN THE TemuSponsor SHALL menampilkan pesan kesalahan di bawah setiap field yang tidak valid tanpa menghapus data yang telah diisi.
5. WHEN semua validasi lolos dan Panitia mengklik "Kirim Pengajuan", THE TemuSponsor SHALL menyimpan Pengajuan ke localStorage dengan ID unik yang digenerate otomatis dan status awal "Menunggu".
6. WHEN Pengajuan berhasil disimpan, THE TemuSponsor SHALL menampilkan Toast konfirmasi keberhasilan dan mereset formulir.
7. THE TemuSponsor SHALL memvalidasi bahwa field email pada formulir Pengajuan mengandung format email yang valid (mengandung karakter "@" dan domain).
8. THE TemuSponsor SHALL memvalidasi bahwa file yang diunggah pada field proposal memiliki ekstensi ".pdf".

---

### Requirement 9: Acara Saya

**User Story:** Sebagai Panitia, saya ingin membuat, melihat, mengedit, dan menghapus data acara saya, sehingga saya dapat mengelola seluruh acara dari satu tempat.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan formulir pembuatan Acara dengan field: nama acara, kategori, tanggal, lokasi, perkiraan peserta, dan deskripsi.
2. WHEN Panitia mengisi formulir dan mengklik tombol "Simpan Acara", THE TemuSponsor SHALL menyimpan data Acara ke localStorage dan menampilkan Acara baru sebagai card di halaman Acara Saya.
3. THE TemuSponsor SHALL menampilkan seluruh Acara yang tersimpan di localStorage dalam format card dengan informasi: nama acara, kategori, tanggal, lokasi, dan jumlah peserta.
4. WHEN Panitia mengklik tombol "Cari Sponsor" pada card Acara, THE SPA_Router SHALL mengarahkan Panitia ke halaman Cari Sponsor dengan filter kategori telah terisi sesuai kategori Acara tersebut.
5. WHEN Panitia mengklik tombol "Edit" pada card Acara, THE TemuSponsor SHALL menampilkan formulir yang telah terisi dengan data Acara yang bersangkutan untuk diperbarui.
6. WHEN Panitia menyimpan hasil edit, THE TemuSponsor SHALL memperbarui data Acara di localStorage dan memperbarui tampilan card secara dinamis.
7. WHEN Panitia mengklik tombol "Hapus" pada card Acara, THE TemuSponsor SHALL menampilkan Modal konfirmasi sebelum menghapus data.
8. WHEN Panitia mengkonfirmasi penghapusan, THE TemuSponsor SHALL menghapus data Acara dari localStorage, menghapus card yang sesuai dari tampilan, dan menampilkan Toast konfirmasi.
9. IF tidak ada Acara yang tersimpan, THEN THE TemuSponsor SHALL menampilkan pesan "Belum ada acara yang dibuat." beserta petunjuk untuk membuat acara pertama.

---

### Requirement 10: Profil Pengguna

**User Story:** Sebagai Panitia, saya ingin mengedit dan menyimpan informasi profil organisasi saya, sehingga data saya tersedia sebagai referensi saat mengisi formulir pengajuan.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan formulir Profil dengan field: nama lengkap, nama organisasi, email, nomor telepon, logo organisasi (unggah gambar), deskripsi organisasi, dan lokasi.
2. WHEN halaman Profil dibuka, THE TemuSponsor SHALL memuat dan menampilkan data profil yang tersimpan di localStorage ke dalam formulir secara otomatis.
3. WHEN Panitia mengklik tombol "Simpan Profil", THE TemuSponsor SHALL menyimpan seluruh perubahan ke localStorage dan menampilkan Toast konfirmasi keberhasilan.
4. THE TemuSponsor SHALL memvalidasi bahwa field email pada Profil mengandung format email yang valid sebelum menyimpan.
5. WHEN profil berhasil disimpan, THE TemuSponsor SHALL memperbarui nama dan logo yang ditampilkan pada Topbar tanpa reload halaman.

---

### Requirement 11: Notifikasi Toast

**User Story:** Sebagai Panitia, saya ingin mendapatkan umpan balik visual setiap kali melakukan aksi penting, sehingga saya tahu apakah aksi saya berhasil atau gagal.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menampilkan Toast dengan tipe "sukses" (warna #16A36A) untuk aksi: berhasil menyimpan Sponsor, berhasil menghapus Sponsor tersimpan, berhasil menyimpan Pengajuan, berhasil menyimpan Acara, berhasil menghapus Acara, dan berhasil menyimpan Profil.
2. THE TemuSponsor SHALL menampilkan Toast dengan tipe "peringatan" (warna #E6A23C) untuk aksi yang membutuhkan perhatian pengguna.
3. THE TemuSponsor SHALL menampilkan Toast dengan tipe "bahaya" (warna #DC5353) untuk aksi yang gagal atau terjadi kesalahan.
4. THE TemuSponsor SHALL menghilangkan Toast secara otomatis setelah 3 detik dari waktu kemunculannya.
5. THE TemuSponsor SHALL menampilkan Toast di sudut kanan bawah layar tanpa menghalangi konten utama.

---

### Requirement 12: Desain dan Komponen UI

**User Story:** Sebagai Panitia, saya ingin antarmuka yang konsisten dan responsif, sehingga platform nyaman digunakan di berbagai ukuran layar.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menggunakan warna sesuai palet berikut secara konsisten: Primary #173B67, Secondary #315D8A, Accent #F4A340, Background #F7F9FC, Surface #FFFFFF, Text Primary #172B4D, Text Secondary #718096, Border #E5EAF1, Success #16A36A, Warning #E6A23C, Danger #DC5353.
2. THE TemuSponsor SHALL menggunakan tipografi Plus Jakarta Sans yang dimuat via CDN untuk seluruh teks, dengan bobot 700 untuk heading dan 400 atau 500 untuk teks isi.
3. THE TemuSponsor SHALL menggunakan ikon Lucide yang dimuat via CDN untuk seluruh elemen ikon.
4. THE TemuSponsor SHALL menampilkan card dengan border-radius 12px dan tombol dengan border-radius 8px secara konsisten.
5. THE TemuSponsor SHALL menyesuaikan tata letak secara responsif sehingga seluruh konten dapat dibaca dan dioperasikan pada lebar layar minimal 320px hingga 1920px.
6. WHILE pengguna mengakses halaman pada perangkat dengan lebar layar kurang dari 768px, THE TemuSponsor SHALL menyembunyikan Sidebar dan menggantinya dengan menu hamburger yang dapat dibuka.
7. THE TemuSponsor SHALL tidak menghasilkan error JavaScript di konsol browser saat operasi normal.

---

### Requirement 13: Struktur File dan Arsitektur Kode

**User Story:** Sebagai pengembang, saya ingin kode diorganisir dalam modul JavaScript terpisah, sehingga pemeliharaan dan pengembangan lebih mudah dilakukan.

#### Acceptance Criteria

1. THE TemuSponsor SHALL mengorganisir kode dalam struktur direktori berikut: `index.html` di root, `css/style.css` untuk seluruh style, dan file JavaScript terpisah di direktori `js/` yang meliputi: `app.js` (inisialisasi dan router), `data.js` (data dummy), `sponsors.js` (logika halaman sponsor), `matching.js` (logika Matching_Engine), `events.js` (logika halaman acara), `applications.js` (logika pengajuan), dan `storage.js` (abstraksi localStorage).
2. THE TemuSponsor SHALL memuat seluruh file JavaScript sebagai modul ES6 (menggunakan `type="module"`) pada `index.html`.
3. THE TemuSponsor SHALL menyimpan seluruh data dummy Sponsor dalam `data.js` sebagai array objek JavaScript yang diekspor.
4. THE TemuSponsor SHALL menggunakan fungsi abstraksi dari `storage.js` untuk seluruh operasi baca dan tulis ke localStorage, sehingga tidak ada akses localStorage langsung di luar modul tersebut.

---

### Requirement 14: Data Dummy Sponsor

**User Story:** Sebagai Panitia, saya ingin melihat data sponsor yang realistis, sehingga prototype terlihat representatif saat didemonstrasikan.

#### Acceptance Criteria

1. THE TemuSponsor SHALL menyediakan paling sedikit 15 data Sponsor dummy dengan atribut: id, nama, kategori bisnis, lokasi, deskripsi, bentuk dukungan (array), skala perusahaan, jenis acara yang dilayani (array), kontak, website, dan logo placeholder.
2. THE TemuSponsor SHALL memastikan data Sponsor dummy mencakup paling sedikit 6 kategori bisnis yang berbeda.
3. THE TemuSponsor SHALL memastikan data Sponsor dummy mencakup paling sedikit 4 kota yang berbeda.
4. THE TemuSponsor SHALL menggunakan nama perusahaan fiktif untuk seluruh data Sponsor dummy.
