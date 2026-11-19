import { renderCariSponsor, renderDetailSponsor, renderTersimpan, renderSmartMatching, getSponsorLogo } from './sponsors.js';
import { renderAcaraSaya } from './events.js';
import { renderPengajuan, renderApplicationDetail } from './applications.js';
import { StorageManager } from './storage.js';
import { sponsors } from './data.js';

// ─── Global State ────────────────────────────────────────────────────────────
window.navigate = navigate;
window.showToast = showToast;
window.showModal = showModal;

let currentPage = 'landing';

// ─── Toast System ─────────────────────────────────────────────────────────────
export function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: 'check-circle-2', warning: 'alert-triangle', danger: 'x-circle' };
  toast.innerHTML = `<i data-lucide="${icons[type]||'info'}" style="width:18px;height:18px;flex-shrink:0;"></i><span>${message}</span><button class="toast-close"><i data-lucide="x" style="width:14px;height:14px;"></i></button>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
  setTimeout(() => dismissToast(toast), 3000);
}

function dismissToast(toast) {
  toast.classList.add('toast-out');
  setTimeout(() => toast.remove(), 300);
}

// ─── Modal System ─────────────────────────────────────────────────────────────
export function showModal({ title = '', content = '', confirmText = 'Konfirmasi', confirmClass = 'btn-primary', cancelText = 'Batal', onConfirm = null, onCancel = null }) {
  const existing = document.getElementById('appModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'appModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="btn-icon modal-close-btn"><i data-lucide="x" style="width:20px;height:20px;"></i></button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        <button class="btn btn-outline modal-cancel-btn">${cancelText}</button>
        <button class="btn ${confirmClass} modal-confirm-btn">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => modal.classList.add('modal-visible'), 10);

  const close = () => { modal.classList.remove('modal-visible'); setTimeout(() => modal.remove(), 200); };
  modal.querySelector('.modal-close-btn').addEventListener('click', close);
  modal.querySelector('.modal-cancel-btn').addEventListener('click', () => { close(); if (onCancel) onCancel(); });
  modal.querySelector('.modal-confirm-btn').addEventListener('click', () => { close(); if (onConfirm) onConfirm(); });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // Wire up view-app-btn inside modal content
  setTimeout(() => {
    modal.querySelectorAll('.view-app-btn').forEach(btn => {
      btn.addEventListener('click', () => { close(); renderApplicationDetail(btn.dataset.id); });
    });
  }, 50);
}

// ─── SPA Router ───────────────────────────────────────────────────────────────
const routes = {
  'landing': renderLandingPage,
  'dashboard': renderDashboard,
  'cari-sponsor': renderCariSponsor,
  'detail-sponsor': renderDetailSponsor,
  'acara-saya': renderAcaraSaya,
  'pengajuan': renderPengajuan,
  'tersimpan': renderTersimpan,
  'profil': renderProfil,
  'matching': renderSmartMatching
};

export function navigate(page, params = {}) {
  currentPage = page;
  const isLanding = page === 'landing';
  const app = document.getElementById('app');
  if (!app) return;

  if (isLanding) {
    app.className = 'app-landing';
    app.innerHTML = '';
    renderLandingPage(params);
  } else {
    if (app.className !== 'app-dashboard') {
      app.className = 'app-dashboard';
      renderShell();
    }
    updateSidebarActive(page);
    updateTopbarProfile();
    const renderer = routes[page];
    if (renderer) {
      renderer(params);
    } else {
      document.getElementById('main-content').innerHTML = `
        <div class="empty-state">
          <i data-lucide="file-question" style="width:48px;height:48px;color:#E5EAF1;"></i>
          <h3>Halaman tidak ditemukan</h3>
          <button class="btn btn-primary" onclick="navigate('dashboard')">Kembali ke Dashboard</button>
        </div>`;
      if (window.lucide) lucide.createIcons();
    }
  }

  // Wire up view-app-btn in history table (after render)
  setTimeout(() => {
    document.querySelectorAll('.view-app-btn').forEach(btn => {
      btn.addEventListener('click', () => renderApplicationDetail(btn.dataset.id));
    });
  }, 100);
}

// ─── Shell (Sidebar + Topbar) ─────────────────────────────────────────────────
function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#F4A340"/><path d="M7 14 Q14 6 21 14 Q14 22 7 14Z" fill="#173B67"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>
        </div>
        <span class="sidebar-brand-name">TemuSponsor</span>
        <button class="sidebar-close btn-icon" id="sidebarClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <nav class="sidebar-nav">
        <a class="sidebar-item" data-page="dashboard"><i data-lucide="layout-dashboard" style="width:18px;height:18px;"></i><span>Dashboard</span></a>
        <a class="sidebar-item" data-page="cari-sponsor"><i data-lucide="search" style="width:18px;height:18px;"></i><span>Cari Sponsor</span></a>
        <a class="sidebar-item" data-page="matching"><i data-lucide="zap" style="width:18px;height:18px;"></i><span>Smart Matching</span></a>
        <a class="sidebar-item" data-page="tersimpan"><i data-lucide="bookmark" style="width:18px;height:18px;"></i><span>Sponsor Tersimpan</span></a>
        <a class="sidebar-item" data-page="acara-saya"><i data-lucide="calendar" style="width:18px;height:18px;"></i><span>Acara Saya</span></a>
        <a class="sidebar-item" data-page="pengajuan"><i data-lucide="send" style="width:18px;height:18px;"></i><span>Pengajuan</span></a>
        <div class="sidebar-divider"></div>
        <a class="sidebar-item" data-page="profil"><i data-lucide="user-circle-2" style="width:18px;height:18px;"></i><span>Profil</span></a>
      </nav>
    </aside>
    <div class="page-wrapper" id="pageWrapper">
      <header class="topbar" id="topbar">
        <button class="btn-icon hamburger-btn" id="hamburgerBtn"><i data-lucide="menu" style="width:22px;height:22px;"></i></button>
        <div class="topbar-search">
          <i data-lucide="search" style="width:16px;height:16px;"></i>
          <input type="text" class="topbar-search-input" placeholder="Cari sponsor..." id="topbarSearch">
        </div>
        <div class="topbar-right">
          <button class="btn-icon topbar-notif" title="Notifikasi"><i data-lucide="bell" style="width:20px;height:20px;"></i></button>
          <div class="topbar-profile" id="topbarProfile" title="Profil">
            <div class="topbar-avatar" id="topbarAvatar">?</div>
            <span class="topbar-username" id="topbarUsername">Pengguna</span>
          </div>
        </div>
      </header>
      <main class="main-content" id="main-content"></main>
    </div>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
  `;

  if (window.lucide) lucide.createIcons();

  // Sidebar navigation
  document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.page);
      closeMobileSidebar();
    });
  });

  // Mobile hamburger
  document.getElementById('hamburgerBtn')?.addEventListener('click', openMobileSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeMobileSidebar);

  // Topbar search
  document.getElementById('topbarSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val) navigate('cari-sponsor', {});
    }
  });

  // Profile click
  document.getElementById('topbarProfile')?.addEventListener('click', () => navigate('profil'));
}

function openMobileSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('visible');
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('visible');
}

function updateSidebarActive(page) {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

function updateTopbarProfile() {
  const profile = StorageManager.getProfile();
  const name = profile.organizationName || profile.fullName || 'Pengguna';
  const avatarEl = document.getElementById('topbarAvatar');
  const nameEl = document.getElementById('topbarUsername');
  if (nameEl) nameEl.textContent = name.length > 16 ? name.substring(0,16)+'…' : name;
  if (avatarEl) {
    if (profile.logoDataUrl) {
      avatarEl.innerHTML = `<img src="${profile.logoDataUrl}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avatarEl.textContent = name.charAt(0).toUpperCase();
    }
  }
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function renderLandingPage() {
  const app = document.getElementById('app');
  const totalSponsors = sponsors.length;
  const categories = [...new Set(sponsors.map(s => s.category))].length;

  app.innerHTML = `
    <!-- NAVBAR -->
    <nav class="landing-nav" id="landingNav">
      <div class="landing-nav-inner">
        <div class="landing-brand" onclick="navigate('landing')" style="cursor:pointer;">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#F4A340"/><path d="M7 14 Q14 6 21 14 Q14 22 7 14Z" fill="#173B67"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>
          <span>TemuSponsor</span>
        </div>
        <div class="landing-nav-links" id="landingNavLinks">
          <a href="#hero" class="nav-link">Beranda</a>
          <a href="#how" class="nav-link">Cara Kerja</a>
          <a href="#categories" class="nav-link">Kategori</a>
          <a href="#about" class="nav-link">Tentang Kami</a>
        </div>
        <div class="landing-nav-cta">
          <button class="btn btn-outline btn-sm" onclick="navigate('dashboard')">Masuk</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('cari-sponsor')">Daftar Sekarang</button>
        </div>
        <button class="btn-icon landing-hamburger" id="landingHamburger"><i data-lucide="menu" style="width:22px;height:22px;"></i></button>
      </div>
    </nav>

    <main class="landing-main">

      <!-- HERO -->
      <section class="hero-section" id="hero">
        <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge"><i data-lucide="zap" style="width:14px;height:14px;"></i> Platform Pencarian Sponsor #1</div>
          <h1 class="hero-title">Temukan Sponsor yang Tepat untuk Acara Hebatmu.</h1>
          <p class="hero-subtitle">Jangan biarkan keterbatasan sponsor menghambat acaramu. Temukan perusahaan dan brand yang sesuai dengan kebutuhan acara melalui satu platform.</p>
          <div class="hero-actions">
            <button class="btn btn-accent btn-lg" onclick="navigate('cari-sponsor')">
              <i data-lucide="search" style="width:18px;height:18px;"></i> Mulai Cari Sponsor
            </button>
            <a href="#how" class="btn btn-outline-white btn-lg">
              <i data-lucide="play-circle" style="width:18px;height:18px;"></i> Pelajari Cara Kerja
            </a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><span class="hero-stat-num">${totalSponsors}+</span><span class="hero-stat-label">Calon Sponsor</span></div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat"><span class="hero-stat-num">75+</span><span class="hero-stat-label">Peluang Kolaborasi</span></div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat"><span class="hero-stat-num">${categories}+</span><span class="hero-stat-label">Kategori Bisnis</span></div>
          </div>
        </div>
        <div class="hero-illustration">
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background circles -->
            <circle cx="200" cy="160" r="140" fill="#315D8A" opacity="0.08"/>
            <circle cx="200" cy="160" r="100" fill="#315D8A" opacity="0.08"/>
            <!-- Center node: Event -->
            <rect x="150" y="120" width="100" height="80" rx="16" fill="#173B67"/>
            <text x="200" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="600">EVENT</text>
            <text x="200" y="172" text-anchor="middle" fill="#F4A340" font-size="10">Organizer</text>
            <!-- Sponsor nodes -->
            <rect x="30" y="60" width="80" height="56" rx="12" fill="#F4A340"/>
            <text x="70" y="90" text-anchor="middle" fill="#173B67" font-size="9" font-weight="700">FOOD &amp;</text>
            <text x="70" y="103" text-anchor="middle" fill="#173B67" font-size="9" font-weight="700">BEVERAGE</text>
            <rect x="290" y="60" width="80" height="56" rx="12" fill="#16A36A"/>
            <text x="330" y="90" text-anchor="middle" fill="white" font-size="9" font-weight="700">TECH</text>
            <text x="330" y="103" text-anchor="middle" fill="white" font-size="9" font-weight="700">STARTUP</text>
            <rect x="30" y="204" width="80" height="56" rx="12" fill="#315D8A"/>
            <text x="70" y="234" text-anchor="middle" fill="white" font-size="9" font-weight="700">MEDIA</text>
            <text x="70" y="247" text-anchor="middle" fill="white" font-size="9" font-weight="700">PARTNER</text>
            <rect x="290" y="204" width="80" height="56" rx="12" fill="#DC5353"/>
            <text x="330" y="234" text-anchor="middle" fill="white" font-size="9" font-weight="700">RETAIL</text>
            <text x="330" y="247" text-anchor="middle" fill="white" font-size="9" font-weight="700">GROUP</text>
            <!-- Connection lines -->
            <line x1="110" y1="88" x2="150" y2="145" stroke="#F4A340" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>
            <line x1="290" y1="88" x2="250" y2="145" stroke="#16A36A" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>
            <line x1="110" y1="232" x2="150" y2="175" stroke="#315D8A" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>
            <line x1="290" y1="232" x2="250" y2="175" stroke="#DC5353" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>
            <!-- Match indicator -->
            <circle cx="200" cy="160" r="6" fill="#F4A340"/>
          </svg>
        </div>
        </div><!-- /.hero-inner -->
      </section>

      <!-- WHY TEMUSPONSOR -->
      <section class="why-section" id="why">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Mengapa TemuSponsor?</h2>
            <p class="section-subtitle">Platform yang dirancang khusus untuk mempertemukan panitia acara dengan sponsor yang tepat.</p>
          </div>
          <div class="why-grid">
            <div class="why-card">
              <div class="why-icon" style="background:#173B6710;color:#173B67;"><i data-lucide="target" style="width:28px;height:28px;"></i></div>
              <h3>Pencocokan Cerdas</h3>
              <p>Algoritma Smart Matching kami menghitung kesesuaian sponsor dengan acaramu berdasarkan kategori, lokasi, dan target audiens.</p>
            </div>
            <div class="why-card">
              <div class="why-icon" style="background:#F4A34010;color:#F4A340;"><i data-lucide="database" style="width:28px;height:28px;"></i></div>
              <h3>Database Lengkap</h3>
              <p>Temukan sponsor dari berbagai kategori bisnis — mulai dari F&B, teknologi, pendidikan, hingga media dan retail.</p>
            </div>
            <div class="why-card">
              <div class="why-icon" style="background:#16A36A10;color:#16A36A;"><i data-lucide="file-text" style="width:28px;height:28px;"></i></div>
              <h3>Proses Terstruktur</h3>
              <p>Kelola pengajuan kerja sama dengan mudah, pantau statusnya, dan simpan catatan semua sponsor yang sudah dihubungi.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="how-section" id="how">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Bagaimana Cara Kerjanya?</h2>
            <p class="section-subtitle">Empat langkah mudah untuk menemukan sponsor yang tepat.</p>
          </div>
          <div class="how-steps">
            <div class="how-step">
              <div class="step-num">1</div>
              <h3>Daftarkan Acaramu</h3>
              <p>Isi informasi acara termasuk kategori, lokasi, target audiens, dan jenis dukungan yang kamu butuhkan.</p>
            </div>
            <div class="how-arrow"><i data-lucide="arrow-right" style="width:24px;height:24px;color:#E5EAF1;"></i></div>
            <div class="how-step">
              <div class="step-num">2</div>
              <h3>Jalankan Smart Matching</h3>
              <p>Sistem kami mencocokkan profil acaramu dengan database sponsor dan menghasilkan rekomendasi berdasarkan skor kesesuaian.</p>
            </div>
            <div class="how-arrow"><i data-lucide="arrow-right" style="width:24px;height:24px;color:#E5EAF1;"></i></div>
            <div class="how-step">
              <div class="step-num">3</div>
              <h3>Simpan & Pelajari</h3>
              <p>Bookmark sponsor yang menarik, baca detail persyaratan, dan pelajari kontak yang tersedia.</p>
            </div>
            <div class="how-arrow"><i data-lucide="arrow-right" style="width:24px;height:24px;color:#E5EAF1;"></i></div>
            <div class="how-step">
              <div class="step-num">4</div>
              <h3>Kirim Pengajuan</h3>
              <p>Isi formulir pengajuan lengkap dan upload proposal. Pantau status pengajuanmu dari dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="cat-section" id="categories">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Kategori Sponsor Populer</h2>
            <p class="section-subtitle">Temukan sponsor dari berbagai bidang bisnis sesuai kebutuhan acaramu.</p>
          </div>
          <div class="cat-grid">
            ${[
              {cat:'Food & Beverage',icon:'coffee',color:'#E6A23C'},
              {cat:'Technology',icon:'cpu',color:'#315D8A'},
              {cat:'Education',icon:'book-open',color:'#16A36A'},
              {cat:'Fashion',icon:'shirt',color:'#DC5353'},
              {cat:'Healthcare',icon:'heart-pulse',color:'#06b6d4'},
              {cat:'Media',icon:'radio',color:'#173B67'},
              {cat:'Printing',icon:'printer',color:'#8b5cf6'},
              {cat:'Retail',icon:'shopping-bag',color:'#78716c'}
            ].map(({cat,icon,color}) => `
              <div class="cat-card" onclick="navigate('cari-sponsor')" style="cursor:pointer;">
                <div class="cat-icon" style="background:${color}15;color:${color};"><i data-lucide="${icon}" style="width:24px;height:24px;"></i></div>
                <span>${cat}</span>
                <span class="cat-count">${sponsors.filter(s=>s.category===cat).length} sponsor</span>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <!-- FEATURED SPONSORS -->
      <section class="featured-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Sponsor yang Direkomendasikan</h2>
            <p class="section-subtitle">Data demonstrasi — semua nama perusahaan adalah fiktif untuk keperluan prototype.</p>
          </div>
          <div class="featured-grid">
            ${sponsors.slice(0,4).map(s => `
              <div class="featured-card">
                ${getSponsorLogo(s, 48)}
                <div class="featured-info">
                  <strong>${s.name}</strong>
                  <span class="text-muted" style="font-size:0.8rem;">${s.category} · ${s.location}</span>
                  <div class="badges-row" style="margin-top:4px;">${s.supportTypes.slice(0,2).map(t=>`<span class="badge badge-outline" style="font-size:0.72rem;">${t}</span>`).join('')}</div>
                </div>
                <button class="btn btn-outline btn-xs" onclick="navigate('detail-sponsor',{sponsorId:'${s.id}'})">Detail</button>
              </div>`).join('')}
          </div>
          <div style="text-align:center;margin-top:2rem;">
            <button class="btn btn-primary btn-lg" onclick="navigate('cari-sponsor')">
              <i data-lucide="search" style="width:18px;height:18px;"></i> Lihat Semua Sponsor
            </button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section" id="about">
        <div class="cta-inner">
          <h2>Siap Memulai Pencarian Sponsor?</h2>
          <p>Bergabunglah dengan panitia acara yang sudah menggunakan TemuSponsor untuk menemukan mitra terbaik mereka.</p>
          <div class="cta-actions">
            <button class="btn btn-accent btn-lg" onclick="navigate('cari-sponsor')">
              <i data-lucide="search" style="width:18px;height:18px;"></i> Mulai Cari Sponsor
            </button>
            <button class="btn btn-outline-white btn-lg" onclick="navigate('matching')">
              <i data-lucide="zap" style="width:18px;height:18px;"></i> Coba Smart Matching
            </button>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#F4A340"/><path d="M7 14 Q14 6 21 14 Q14 22 7 14Z" fill="#173B67"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>
          <span>TemuSponsor</span>
        </div>
        <p class="footer-desc">Platform pencarian calon sponsor untuk panitia acara, OSIS, organisasi mahasiswa, dan komunitas.</p>
        <p class="footer-disclaimer">TemuSponsor adalah prototype demonstrasi. Seluruh data sponsor bersifat fiktif.</p>
      </div>
    </footer>
  `;

  if (window.lucide) lucide.createIcons();

  // Navbar scroll effect
  const nav = document.getElementById('landingNav');
  window.onscroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  };

  // Landing hamburger
  document.getElementById('landingHamburger')?.addEventListener('click', () => {
    document.getElementById('landingNavLinks')?.classList.toggle('open');
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const profile = StorageManager.getProfile();
  const bookmarks = StorageManager.getBookmarks();
  const events = StorageManager.getEvents();
  const applications = StorageManager.getApplications();
  const orgName = profile.organizationName || profile.fullName || 'Organisasimu';
  const pending = applications.filter(a => a.status === 'Menunggu' || a.status === 'Diproses').length;
  const recent5 = applications.slice().reverse().slice(0,5);

  main.innerHTML = `
    <div class="dashboard-welcome">
      <div class="welcome-text">
        <h1>Selamat Datang di TemuSponsor! 👋</h1>
        <p class="text-muted">Halo, <strong>${orgName}</strong> — temukan sponsor terbaik untuk acaramu hari ini.</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('cari-sponsor')">
        <i data-lucide="search" style="width:16px;height:16px;"></i> Cari Sponsor Sekarang
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card" onclick="navigate('cari-sponsor')" style="cursor:pointer;">
        <div class="stat-icon" style="background:#173B6715;color:#173B67;"><i data-lucide="users" style="width:22px;height:22px;"></i></div>
        <div class="stat-info">
          <span class="stat-num">${sponsors.length}</span>
          <span class="stat-label">Total Sponsor Tersedia</span>
        </div>
      </div>
      <div class="stat-card" onclick="navigate('tersimpan')" style="cursor:pointer;">
        <div class="stat-icon" style="background:#F4A34015;color:#F4A340;"><i data-lucide="bookmark" style="width:22px;height:22px;"></i></div>
        <div class="stat-info">
          <span class="stat-num">${bookmarks.length}</span>
          <span class="stat-label">Sponsor Tersimpan</span>
        </div>
      </div>
      <div class="stat-card" onclick="navigate('pengajuan')" style="cursor:pointer;">
        <div class="stat-icon" style="background:#16A36A15;color:#16A36A;"><i data-lucide="send" style="width:22px;height:22px;"></i></div>
        <div class="stat-info">
          <span class="stat-num">${applications.length}</span>
          <span class="stat-label">Total Pengajuan</span>
        </div>
      </div>
      <div class="stat-card" onclick="navigate('pengajuan')" style="cursor:pointer;">
        <div class="stat-icon" style="background:#E6A23C15;color:#E6A23C;"><i data-lucide="clock" style="width:22px;height:22px;"></i></div>
        <div class="stat-info">
          <span class="stat-num">${pending}</span>
          <span class="stat-label">Pengajuan Aktif</span>
        </div>
      </div>
    </div>

    <div class="dashboard-two-col">
      <!-- Recent Applications -->
      <div class="card">
        <div class="card-header-row">
          <h2 class="card-section-title">Aktivitas Terbaru</h2>
          <button class="btn-link" onclick="navigate('pengajuan')">Lihat Semua</button>
        </div>
        ${recent5.length === 0 ? `
        <div class="empty-state empty-state-sm">
          <i data-lucide="inbox" style="width:32px;height:32px;color:#E5EAF1;"></i>
          <p>Belum ada pengajuan. <button class="btn-link" onclick="navigate('pengajuan')">Buat pengajuan pertama</button></p>
        </div>` : `
        <div class="activity-list">
          ${recent5.map(a => `
          <div class="activity-item">
            <div class="activity-dot ${getStatusDot(a.status)}"></div>
            <div class="activity-info">
              <span class="activity-title">${a.sponsorName}</span>
              <span class="activity-sub">${a.eventName}</span>
            </div>
            <span class="badge ${getStatusClass(a.status)}">${a.status}</span>
          </div>`).join('')}
        </div>`}
      </div>

      <!-- Recommended Sponsors -->
      <div class="card">
        <div class="card-header-row">
          <h2 class="card-section-title">Rekomendasi Sponsor</h2>
          <button class="btn-link" onclick="navigate('cari-sponsor')">Lihat Semua</button>
        </div>
        <div class="dashboard-sponsors">
          ${sponsors.slice(0,4).map(s => `
          <div class="dashboard-sponsor-item">
            ${getSponsorLogo(s, 40)}
            <div class="dashboard-sponsor-info">
              <strong>${s.name}</strong>
              <span class="text-muted" style="font-size:0.78rem;">${s.category} · ${s.location}</span>
            </div>
            <button class="btn btn-outline btn-xs" onclick="navigate('detail-sponsor',{sponsorId:'${s.id}'})">Detail</button>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Active Events -->
    ${events.length > 0 ? `
    <div class="card" style="margin-top:1.5rem;">
      <div class="card-header-row">
        <h2 class="card-section-title">Acara Aktif</h2>
        <button class="btn-link" onclick="navigate('acara-saya')">Kelola Acara</button>
      </div>
      <div class="dashboard-events">
        ${events.slice(0,3).map(ev => `
        <div class="dashboard-event-item">
          <div class="event-dot"></div>
          <div class="dashboard-event-info">
            <strong>${ev.name}</strong>
            <span class="text-muted">${ev.category} · ${ev.location} · ${formatDate(ev.date)}</span>
          </div>
          <button class="btn btn-outline btn-xs" onclick="navigate('cari-sponsor',{category:'${ev.category}'})">Cari Sponsor</button>
        </div>`).join('')}
      </div>
    </div>` : ''}
  `;

  if (window.lucide) lucide.createIcons();
}

function getStatusClass(status) {
  const m = { 'Menunggu':'badge-warning','Diproses':'badge-info','Diterima':'badge-success','Ditolak':'badge-danger' };
  return m[status] || 'badge-outline';
}
function getStatusDot(status) {
  const m = { 'Menunggu':'dot-warning','Diproses':'dot-info','Diterima':'dot-success','Ditolak':'dot-danger' };
  return m[status] || '';
}

function formatDate(ds) {
  if (!ds) return '-';
  try { return new Date(ds).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}); }
  catch { return '-'; }
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function renderProfil() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const profile = StorageManager.getProfile();

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaturan Profil</h1>
        <p class="page-subtitle">Kelola informasi organisasi dan akun kamu.</p>
      </div>
    </div>

    <div class="profile-layout">
      <!-- Form -->
      <div class="card profile-form-card">
        <form id="profileForm" novalidate>
          <div class="form-group">
            <label class="form-label">Nama Lengkap <span class="required">*</span></label>
            <input type="text" id="pFullName" class="form-input" value="${profile.fullName||''}" placeholder="Nama lengkap kamu">
            <span class="field-error" id="err-pFullName"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Organisasi <span class="required">*</span></label>
            <input type="text" id="pOrgName" class="form-input" value="${profile.organizationName||''}" placeholder="Nama OSIS, UKM, komunitas, dll.">
            <span class="field-error" id="err-pOrgName"></span>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Email <span class="required">*</span></label>
              <input type="email" id="pEmail" class="form-input" value="${profile.email||''}" placeholder="email@contoh.com">
              <span class="field-error" id="err-pEmail"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Telepon</label>
              <input type="tel" id="pPhone" class="form-input" value="${profile.phone||''}" placeholder="08xx-xxxx-xxxx">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Lokasi Organisasi</label>
            <input type="text" id="pLocation" class="form-input" value="${profile.location||''}" placeholder="Kota domisili organisasi">
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi Organisasi</label>
            <textarea id="pDesc" class="form-input" rows="3" placeholder="Deskripsikan organisasimu...">${profile.description||''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Logo Organisasi</label>
            <div class="file-upload-wrap">
              <input type="file" id="pLogo" class="file-input" accept="image/*">
              <label for="pLogo" class="file-upload-label">
                <i data-lucide="image" style="width:20px;height:20px;"></i>
                <span id="logoFileName">Klik untuk upload gambar</span>
              </label>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              <i data-lucide="save" style="width:16px;height:16px;"></i> Simpan Profil
            </button>
          </div>
        </form>
      </div>

      <!-- Preview -->
      <aside class="profile-preview-card card">
        <h3 class="card-section-title">Pratinjau Profil</h3>
        <div class="profile-preview">
          <div class="profile-avatar" id="profileAvatarPreview">
            ${profile.logoDataUrl ? `<img src="${profile.logoDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span>${(profile.organizationName||'O').charAt(0).toUpperCase()}</span>`}
          </div>
          <strong id="profileNamePreview">${profile.organizationName || profile.fullName || 'Nama Organisasi'}</strong>
          <span class="text-muted" id="profileEmailPreview">${profile.email || 'email@contoh.com'}</span>
          ${profile.location ? `<span class="text-muted" id="profileLocPreview"><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${profile.location}</span>` : `<span class="text-muted" id="profileLocPreview"></span>`}
        </div>
        <div class="profile-stats">
          <div class="profile-stat"><span class="stat-num">${StorageManager.getEvents().length}</span><span>Acara</span></div>
          <div class="profile-stat"><span class="stat-num">${StorageManager.getBookmarks().length}</span><span>Tersimpan</span></div>
          <div class="profile-stat"><span class="stat-num">${StorageManager.getApplications().length}</span><span>Pengajuan</span></div>
        </div>
      </aside>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Live preview updates
  ['pFullName','pOrgName','pEmail','pLocation'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateProfilePreview);
  });

  // Logo upload preview
  document.getElementById('pLogo')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('logoFileName').textContent = file.name;
      const reader = new FileReader();
      reader.onload = ev => {
        const preview = document.getElementById('profileAvatarPreview');
        if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('profileForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitProfile();
  });
}

function updateProfilePreview() {
  const name = document.getElementById('pOrgName')?.value || document.getElementById('pFullName')?.value || 'Nama Organisasi';
  const email = document.getElementById('pEmail')?.value || 'email@contoh.com';
  const loc = document.getElementById('pLocation')?.value || '';
  const nameEl = document.getElementById('profileNamePreview');
  const emailEl = document.getElementById('profileEmailPreview');
  const locEl = document.getElementById('profileLocPreview');
  const avatarEl = document.getElementById('profileAvatarPreview');
  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (locEl) locEl.textContent = loc;
  if (avatarEl && !avatarEl.querySelector('img')) {
    const span = avatarEl.querySelector('span');
    if (span) span.textContent = name.charAt(0).toUpperCase();
  }
}

function submitProfile() {
  const fullName = document.getElementById('pFullName')?.value.trim();
  const orgName = document.getElementById('pOrgName')?.value.trim();
  const email = document.getElementById('pEmail')?.value.trim();

  let valid = true;
  if (!fullName) { document.getElementById('err-pFullName').textContent = 'Nama lengkap wajib diisi'; valid = false; }
  else document.getElementById('err-pFullName').textContent = '';
  if (!orgName) { document.getElementById('err-pOrgName').textContent = 'Nama organisasi wajib diisi'; valid = false; }
  else document.getElementById('err-pOrgName').textContent = '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('err-pEmail').textContent = 'Masukkan format email yang valid'; valid = false; }
  else document.getElementById('err-pEmail').textContent = '';
  if (!valid) return;

  const logoInput = document.getElementById('pLogo');
  const file = logoInput?.files[0];

  const saveProfile = (logoDataUrl) => {
    const profile = {
      fullName,
      organizationName: orgName,
      email,
      phone: document.getElementById('pPhone')?.value.trim() || '',
      location: document.getElementById('pLocation')?.value.trim() || '',
      description: document.getElementById('pDesc')?.value.trim() || '',
      logoDataUrl: logoDataUrl || StorageManager.getProfile().logoDataUrl || ''
    };
    StorageManager.saveProfile(profile);
    updateTopbarProfile();
    window.showToast('Profil berhasil disimpan!', 'success');
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = ev => saveProfile(ev.target.result);
    reader.readAsDataURL(file);
  } else {
    saveProfile();
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;
  navigate('landing');
});