import { sponsors as allSponsors } from './data.js';
import { StorageManager } from './storage.js';
import { runMatching, classifyScore, getLabelColor, getLabelBg } from './matching.js';

// ─── Utility ────────────────────────────────────────────────────────────────

export function getSponsorLogo(sponsor, size = 48) {
  const initials = sponsor.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#173B67','#315D8A','#F4A340','#16A36A','#DC5353','#718096'];
  const colorIndex = sponsor.id.charCodeAt(sponsor.id.length - 1) % colors.length;
  const bg = colors[colorIndex];
  return `<div class="sponsor-logo-placeholder" style="width:${size}px;height:${size}px;background:${bg};border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:${Math.round(size*0.35)}px;flex-shrink:0;">${initials}</div>`;
}

function renderSupportBadges(types, limit = 3) {
  if (!Array.isArray(types)) return '';
  const shown = types.slice(0, limit);
  const extra = types.length - limit;
  let html = shown.map(t => `<span class="badge badge-outline">${t}</span>`).join('');
  if (extra > 0) html += `<span class="badge badge-outline">+${extra}</span>`;
  return html;
}

function getCategoryColor(cat) {
  const map = {
    'Food & Beverage': '#E6A23C',
    'Technology': '#315D8A',
    'Education': '#16A36A',
    'Fashion': '#DC5353',
    'Beauty': '#c084fc',
    'Healthcare': '#06b6d4',
    'Printing': '#8b5cf6',
    'Transportation': '#f97316',
    'Media': '#173B67',
    'Retail': '#78716c'
  };
  return map[cat] || '#718096';
}

// ─── Filter Logic ────────────────────────────────────────────────────────────

export function applyFilters(sponsors, filters) {
  return sponsors.filter(s => {
    // keyword
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const nameMatch = s.name.toLowerCase().includes(kw);
      const catMatch = s.category.toLowerCase().includes(kw);
      const descMatch = s.description.toLowerCase().includes(kw);
      if (!nameMatch && !catMatch && !descMatch) return false;
    }
    // category
    if (filters.category && filters.category !== 'Semua') {
      if (s.category !== filters.category) return false;
    }
    // location
    if (filters.location && filters.location !== 'Semua') {
      if (s.location !== filters.location && s.location !== 'Seluruh Indonesia') return false;
    }
    // support type
    if (filters.support && filters.support !== 'Semua') {
      if (!s.supportTypes.includes(filters.support)) return false;
    }
    // business scale
    if (filters.scale && filters.scale !== 'Semua') {
      if (s.businessScale !== filters.scale) return false;
    }
    // event type
    if (filters.eventType && filters.eventType !== 'Semua') {
      if (!s.suitableEvents.includes(filters.eventType) && !s.suitableEvents.includes('Semua Jenis Acara')) return false;
    }
    return true;
  });
}

export function sortSponsors(sponsors, order) {
  const arr = [...sponsors];
  if (order === 'name-asc') arr.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  else if (order === 'name-desc') arr.sort((a, b) => b.name.localeCompare(a.name, 'id'));
  return arr;
}

// ─── Sponsor Card ────────────────────────────────────────────────────────────

export function renderSponsorCard(sponsor, options = {}) {
  const { showScore = false, showBookmark = true, scoreData = null } = options;
  const bookmarked = StorageManager.isBookmarked(sponsor.id);
  const score = scoreData ? scoreData.score : null;
  const label = scoreData ? scoreData.label : null;

  return `
    <div class="sponsor-card" data-id="${sponsor.id}">
      <div class="sponsor-card-header">
        ${getSponsorLogo(sponsor, 52)}
        <div class="sponsor-card-info">
          <h3 class="sponsor-card-name">${sponsor.name}</h3>
          <div class="sponsor-card-meta">
            <span class="badge" style="background:${getCategoryColor(sponsor.category)}20;color:${getCategoryColor(sponsor.category)};border:1px solid ${getCategoryColor(sponsor.category)}40;">${sponsor.category}</span>
            <span class="sponsor-location"><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${sponsor.location}</span>
          </div>
        </div>
        ${showBookmark ? `
        <button class="btn-icon bookmark-btn ${bookmarked ? 'bookmarked' : ''}" data-id="${sponsor.id}" title="${bookmarked ? 'Hapus dari tersimpan' : 'Simpan sponsor'}">
          <i data-lucide="bookmark" style="width:18px;height:18px;fill:${bookmarked ? '#F4A340' : 'none'};stroke:${bookmarked ? '#F4A340' : 'currentColor'};"></i>
        </button>` : ''}
      </div>
      ${showScore && score !== null ? `
      <div class="match-score-bar">
        <div class="match-score-label">
          <span class="badge" style="background:${getLabelBg(label)};color:${getLabelColor(label)};">${label}</span>
          <span class="match-pct" style="color:${getLabelColor(label)};font-weight:700;">${score}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${score}%;background:${getLabelColor(label)};"></div>
        </div>
      </div>` : ''}
      <p class="sponsor-card-desc">${sponsor.description}</p>
      <div class="sponsor-support-row">
        <span class="support-label">Dukungan:</span>
        <div class="badges-row">${renderSupportBadges(sponsor.supportTypes)}</div>
      </div>
      <div class="sponsor-card-footer">
        <span class="scale-badge scale-${sponsor.businessScale.replace(/\s+/g, '-').toLowerCase()}">${sponsor.businessScale}</span>
        <button class="btn btn-primary btn-sm detail-btn" data-id="${sponsor.id}">Lihat Detail</button>
      </div>
    </div>
  `;
}

// ─── Render: Cari Sponsor ────────────────────────────────────────────────────

let currentFilters = { keyword: '', category: '', location: '', support: '', scale: '', eventType: '', sortOrder: 'default' };

export function renderCariSponsor(params = {}) {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Pre-fill filter from navigation params
  if (params.category) currentFilters.category = params.category;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Temukan Calon Sponsor</h1>
        <p class="page-subtitle">Cari perusahaan dan brand yang sesuai dengan kebutuhan acaramu.</p>
      </div>
    </div>

    <div class="search-filter-layout">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar" id="filterSidebar">
        <div class="filter-sidebar-header">
          <h3>Filter</h3>
          <button class="btn-link reset-filters-btn" id="resetFiltersBtn">Reset Semua</button>
        </div>

        <div class="filter-group">
          <label class="filter-label">Kategori Bisnis</label>
          <div class="filter-options" id="filterCategory">
            <label class="filter-opt ${!currentFilters.category ? 'active' : ''}"><input type="radio" name="cat" value=""> Semua</label>
            ${['Food & Beverage','Technology','Education','Fashion','Beauty','Healthcare','Printing','Transportation','Media','Retail','Other'].map(c =>
              `<label class="filter-opt ${currentFilters.category === c ? 'active' : ''}"><input type="radio" name="cat" value="${c}" ${currentFilters.category === c ? 'checked' : ''}> ${c}</label>`
            ).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Lokasi</label>
          <div class="filter-options" id="filterLocation">
            <label class="filter-opt ${!currentFilters.location ? 'active' : ''}"><input type="radio" name="loc" value=""> Semua</label>
            ${['Malang','Surabaya','Jakarta','Bandung','Yogyakarta','Seluruh Indonesia'].map(l =>
              `<label class="filter-opt ${currentFilters.location === l ? 'active' : ''}"><input type="radio" name="loc" value="${l}" ${currentFilters.location === l ? 'checked' : ''}> ${l}</label>`
            ).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Bentuk Dukungan</label>
          <div class="filter-options" id="filterSupport">
            <label class="filter-opt ${!currentFilters.support ? 'active' : ''}"><input type="radio" name="sup" value=""> Semua</label>
            ${['Dana','Produk','Voucher','Merchandise','Fasilitas','Media Partner','Workshop','Diskon Cetak'].map(t =>
              `<label class="filter-opt ${currentFilters.support === t ? 'active' : ''}"><input type="radio" name="sup" value="${t}" ${currentFilters.support === t ? 'checked' : ''}> ${t}</label>`
            ).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Skala Perusahaan</label>
          <div class="filter-options" id="filterScale">
            <label class="filter-opt ${!currentFilters.scale ? 'active' : ''}"><input type="radio" name="scale" value=""> Semua</label>
            ${['UMKM','Startup','Perusahaan Menengah','Perusahaan Besar'].map(sc =>
              `<label class="filter-opt ${currentFilters.scale === sc ? 'active' : ''}"><input type="radio" name="scale" value="${sc}" ${currentFilters.scale === sc ? 'checked' : ''}> ${sc}</label>`
            ).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Kesesuaian Acara</label>
          <div class="filter-options" id="filterEventType">
            <label class="filter-opt ${!currentFilters.eventType ? 'active' : ''}"><input type="radio" name="et" value=""> Semua</label>
            ${['Seminar','Workshop','Kompetisi','Festival','Pameran','Pentas Seni','Kegiatan Sosial','Olahraga'].map(e =>
              `<label class="filter-opt ${currentFilters.eventType === e ? 'active' : ''}"><input type="radio" name="et" value="${e}" ${currentFilters.eventType === e ? 'checked' : ''}> ${e}</label>`
            ).join('')}
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="sponsor-main">
        <div class="search-sort-bar">
          <div class="search-wrap">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" id="sponsorSearch" class="search-input" placeholder="Cari nama brand, perusahaan, atau bidang bisnis..." value="${currentFilters.keyword}">
            ${currentFilters.keyword ? `<button class="search-clear" id="searchClear"><i data-lucide="x" style="width:16px;height:16px;"></i></button>` : ''}
          </div>
          <select id="sortSelect" class="select-input">
            <option value="default" ${currentFilters.sortOrder === 'default' ? 'selected' : ''}>Paling Relevan</option>
            <option value="name-asc" ${currentFilters.sortOrder === 'name-asc' ? 'selected' : ''}>Nama A-Z</option>
            <option value="name-desc" ${currentFilters.sortOrder === 'name-desc' ? 'selected' : ''}>Nama Z-A</option>
          </select>
          <button class="btn btn-outline btn-sm filter-toggle-btn" id="filterToggleBtn">
            <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i> Filter
          </button>
        </div>

        <div id="sponsorResultMeta" class="result-meta"></div>
        <div id="sponsorGrid" class="sponsor-grid"></div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  updateSponsorGrid();
  attachCariSponsorListeners();
}

function updateSponsorGrid() {
  const filtered = applyFilters(allSponsors, currentFilters);
  const sorted = sortSponsors(filtered, currentFilters.sortOrder);
  const grid = document.getElementById('sponsorGrid');
  const meta = document.getElementById('sponsorResultMeta');
  if (!grid) return;

  if (meta) meta.textContent = `Menampilkan ${sorted.length} dari ${allSponsors.length} sponsor`;

  if (sorted.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <i data-lucide="search-x" style="width:48px;height:48px;color:#E5EAF1;"></i>
        <h3>Tidak ada sponsor ditemukan</h3>
        <p>Coba ubah kata kunci atau kurangi filter yang diterapkan.</p>
        <button class="btn btn-primary" id="resetFromEmpty">Reset Filter</button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    document.getElementById('resetFromEmpty')?.addEventListener('click', resetFilters);
    return;
  }

  grid.innerHTML = sorted.map(s => renderSponsorCard(s)).join('');
  if (window.lucide) lucide.createIcons();
  attachCardListeners();
}

function attachCariSponsorListeners() {
  // Search
  const searchInput = document.getElementById('sponsorSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentFilters.keyword = e.target.value;
      // Update clear button
      const bar = document.querySelector('.search-wrap');
      const existing = document.getElementById('searchClear');
      if (e.target.value && !existing) {
        const btn = document.createElement('button');
        btn.id = 'searchClear'; btn.className = 'search-clear';
        btn.innerHTML = '<i data-lucide="x" style="width:16px;height:16px;"></i>';
        bar.appendChild(btn);
        lucide.createIcons();
        btn.addEventListener('click', () => { searchInput.value = ''; currentFilters.keyword = ''; btn.remove(); updateSponsorGrid(); });
      } else if (!e.target.value && existing) existing.remove();
      updateSponsorGrid();
    });
  }

  document.getElementById('searchClear')?.addEventListener('click', () => {
    const si = document.getElementById('sponsorSearch');
    if (si) si.value = '';
    currentFilters.keyword = '';
    document.getElementById('searchClear')?.remove();
    updateSponsorGrid();
  });

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    currentFilters.sortOrder = e.target.value;
    updateSponsorGrid();
  });

  // Radio filters
  document.querySelectorAll('input[name="cat"]').forEach(r => r.addEventListener('change', e => { currentFilters.category = e.target.value; updateFilterActiveStates(); updateSponsorGrid(); }));
  document.querySelectorAll('input[name="loc"]').forEach(r => r.addEventListener('change', e => { currentFilters.location = e.target.value; updateFilterActiveStates(); updateSponsorGrid(); }));
  document.querySelectorAll('input[name="sup"]').forEach(r => r.addEventListener('change', e => { currentFilters.support = e.target.value; updateFilterActiveStates(); updateSponsorGrid(); }));
  document.querySelectorAll('input[name="scale"]').forEach(r => r.addEventListener('change', e => { currentFilters.scale = e.target.value; updateFilterActiveStates(); updateSponsorGrid(); }));
  document.querySelectorAll('input[name="et"]').forEach(r => r.addEventListener('change', e => { currentFilters.eventType = e.target.value; updateFilterActiveStates(); updateSponsorGrid(); }));

  // Reset
  document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);

  // Mobile filter toggle
  document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('filterSidebar');
    if (sidebar) sidebar.classList.toggle('open');
  });
}

function updateFilterActiveStates() {
  document.querySelectorAll('.filter-opt').forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('active', input && input.checked);
  });
}

function resetFilters() {
  currentFilters = { keyword: '', category: '', location: '', support: '', scale: '', eventType: '', sortOrder: 'default' };
  renderCariSponsor();
}

function attachCardListeners() {
  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      window.navigate('detail-sponsor', { sponsorId: id });
    });
  });

  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleBookmark(btn.dataset.id);
      // Update button state
      const bookmarked = StorageManager.isBookmarked(btn.dataset.id);
      btn.classList.toggle('bookmarked', bookmarked);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.style.fill = bookmarked ? '#F4A340' : 'none';
        icon.style.stroke = bookmarked ? '#F4A340' : 'currentColor';
      }
    });
  });
}

// ─── Render: Detail Sponsor ──────────────────────────────────────────────────

export function renderDetailSponsor(params = {}) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const sponsor = allSponsors.find(s => s.id === params.sponsorId);
  if (!sponsor) {
    main.innerHTML = `<div class="empty-state"><h3>Sponsor tidak ditemukan</h3><button class="btn btn-primary" onclick="navigate('cari-sponsor')">Kembali ke Pencarian</button></div>`;
    return;
  }

  const bookmarked = StorageManager.isBookmarked(sponsor.id);
  const related = allSponsors.filter(s => s.id !== sponsor.id && s.category === sponsor.category).slice(0, 3);

  main.innerHTML = `
    <div class="detail-back">
      <button class="btn-link" id="backBtn"><i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Kembali ke Pencarian</button>
    </div>

    <div class="detail-layout">
      <div class="detail-main">
        <!-- Header -->
        <div class="detail-header card">
          <div class="detail-header-inner">
            ${getSponsorLogo(sponsor, 72)}
            <div class="detail-header-info">
              <h1 class="detail-name">${sponsor.name}</h1>
              <div class="detail-meta">
                <span class="badge" style="background:${getCategoryColor(sponsor.category)}20;color:${getCategoryColor(sponsor.category)};">${sponsor.category}</span>
                <span class="detail-location"><i data-lucide="map-pin" style="width:14px;height:14px;"></i> ${sponsor.location}</span>
                <span class="detail-scale"><i data-lucide="building-2" style="width:14px;height:14px;"></i> ${sponsor.businessScale}</span>
              </div>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn ${bookmarked ? 'btn-accent' : 'btn-outline'}" id="detailBookmarkBtn" data-id="${sponsor.id}">
              <i data-lucide="bookmark" style="width:16px;height:16px;fill:${bookmarked ? '#fff' : 'none'};"></i>
              ${bookmarked ? 'Tersimpan' : 'Simpan Sponsor'}
            </button>
            <button class="btn btn-primary" id="detailApplyBtn" data-id="${sponsor.id}">
              <i data-lucide="send" style="width:16px;height:16px;"></i> Buat Pengajuan
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="card">
          <h2 class="card-section-title">Tentang ${sponsor.name}</h2>
          <p class="detail-full-desc">${sponsor.fullDescription}</p>
        </div>

        <!-- Support & Events -->
        <div class="detail-two-col">
          <div class="card">
            <h2 class="card-section-title">Bentuk Dukungan</h2>
            <div class="badges-row badges-row-lg">${sponsor.supportTypes.map(t => `<span class="badge badge-success">${t}</span>`).join('')}</div>
          </div>
          <div class="card">
            <h2 class="card-section-title">Jenis Acara</h2>
            <div class="badges-row badges-row-lg">${sponsor.suitableEvents.map(e => `<span class="badge badge-primary">${e}</span>`).join('')}</div>
          </div>
        </div>

        <!-- Target Audience -->
        <div class="card">
          <h2 class="card-section-title">Target Audiens</h2>
          <div class="badges-row">${sponsor.targetAudience.map(a => `<span class="badge badge-outline">${a}</span>`).join('')}</div>
        </div>

        <!-- Requirements -->
        <div class="card">
          <h2 class="card-section-title">Persyaratan Kerja Sama</h2>
          <p>${sponsor.requirements}</p>
        </div>

        <!-- Sponsored Events -->
        <div class="card">
          <h2 class="card-section-title">Acara yang Pernah Didukung</h2>
          <ul class="sponsored-list">${sponsor.sponsoredEvents.map(e => `<li><i data-lucide="check-circle-2" style="width:16px;height:16px;color:#16A36A;flex-shrink:0;"></i><span>${e}</span></li>`).join('')}</ul>
        </div>

        ${related.length > 0 ? `
        <div class="card">
          <h2 class="card-section-title">Sponsor Serupa</h2>
          <div class="related-grid">${related.map(s => renderSponsorCard(s, { showBookmark: false })).join('')}</div>
        </div>` : ''}
      </div>

      <!-- Sidebar Info -->
      <aside class="detail-sidebar">
        <div class="card">
          <h3 class="card-section-title">Informasi Kontak</h3>
          <div class="contact-list">
            <div class="contact-item">
              <i data-lucide="globe" style="width:16px;height:16px;"></i>
              <a href="${sponsor.website}" target="_blank" rel="noopener">${sponsor.website.replace('https://','')}</a>
            </div>
            <div class="contact-item">
              <i data-lucide="mail" style="width:16px;height:16px;"></i>
              <a href="mailto:${sponsor.email}">${sponsor.email}</a>
            </div>
            <div class="contact-item">
              <i data-lucide="phone" style="width:16px;height:16px;"></i>
              <span>${sponsor.phone}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-section-title">Detail Perusahaan</h3>
          <div class="detail-info-list">
            <div class="detail-info-row"><span>Kategori</span><strong>${sponsor.category}</strong></div>
            <div class="detail-info-row"><span>Lokasi</span><strong>${sponsor.location}</strong></div>
            <div class="detail-info-row"><span>Skala</span><strong>${sponsor.businessScale}</strong></div>
            <div class="detail-info-row"><span>Status</span><strong class="status-badge status-active">Aktif</strong></div>
          </div>
        </div>

        <div class="card disclaimer-card">
          <i data-lucide="info" style="width:16px;height:16px;color:#718096;"></i>
          <p>Data ini merupakan informasi demonstrasi. Semua nama perusahaan adalah fiktif untuk keperluan prototype.</p>
        </div>
      </aside>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  document.getElementById('backBtn')?.addEventListener('click', () => window.navigate('cari-sponsor'));

  const bookmarkBtn = document.getElementById('detailBookmarkBtn');
  bookmarkBtn?.addEventListener('click', () => {
    toggleBookmark(sponsor.id);
    const isNow = StorageManager.isBookmarked(sponsor.id);
    bookmarkBtn.className = `btn ${isNow ? 'btn-accent' : 'btn-outline'}`;
    bookmarkBtn.innerHTML = `<i data-lucide="bookmark" style="width:16px;height:16px;fill:${isNow ? '#fff' : 'none'};"></i> ${isNow ? 'Tersimpan' : 'Simpan Sponsor'}`;
    lucide.createIcons();
  });

  document.getElementById('detailApplyBtn')?.addEventListener('click', () => {
    window.navigate('pengajuan', { sponsorId: sponsor.id, sponsorName: sponsor.name });
  });

  // Related card listeners
  document.querySelectorAll('.related-grid .detail-btn').forEach(btn => {
    btn.addEventListener('click', () => window.navigate('detail-sponsor', { sponsorId: btn.dataset.id }));
  });
  document.querySelectorAll('.related-grid .bookmark-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(btn.dataset.id); });
  });
}

// ─── Render: Tersimpan ───────────────────────────────────────────────────────

export function renderTersimpan() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const bookmarks = StorageManager.getBookmarks();

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Sponsor Tersimpan</h1>
        <p class="page-subtitle">Daftar sponsor yang telah kamu simpan sebagai referensi.</p>
      </div>
    </div>

    ${bookmarks.length === 0 ? `
    <div class="empty-state">
      <i data-lucide="bookmark-x" style="width:48px;height:48px;color:#E5EAF1;"></i>
      <h3>Belum ada sponsor yang disimpan</h3>
      <p>Temukan sponsor yang sesuai dan simpan untuk referensi pengajuanmu.</p>
      <button class="btn btn-primary" id="goSearchBtn"><i data-lucide="search" style="width:16px;height:16px;"></i> Cari Sponsor</button>
    </div>` : `
    <div class="card table-card">
      <div class="table-meta"><span>${bookmarks.length} sponsor tersimpan</span></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Sponsor</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Dukungan</th>
              <th>Disimpan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${bookmarks.map(s => `
            <tr>
              <td>
                <div class="table-sponsor-name">
                  ${getSponsorLogo(s, 36)}
                  <span>${s.name}</span>
                </div>
              </td>
              <td><span class="badge badge-outline">${s.category}</span></td>
              <td>${s.location}</td>
              <td><div class="badges-row">${renderSupportBadges(s.supportTypes, 2)}</div></td>
              <td class="text-muted">${formatDate(s.savedAt)}</td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-outline btn-xs view-btn" data-id="${s.id}">Detail</button>
                  <button class="btn btn-primary btn-xs apply-btn" data-id="${s.id}">Ajukan</button>
                  <button class="btn btn-danger btn-xs remove-btn" data-id="${s.id}">Hapus</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`}
  `;

  if (window.lucide) lucide.createIcons();

  document.getElementById('goSearchBtn')?.addEventListener('click', () => window.navigate('cari-sponsor'));

  document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => window.navigate('detail-sponsor', { sponsorId: btn.dataset.id })));
  document.querySelectorAll('.apply-btn').forEach(btn => btn.addEventListener('click', () => {
    const s = bookmarks.find(b => b.id === btn.dataset.id);
    window.navigate('pengajuan', { sponsorId: btn.dataset.id, sponsorName: s?.name });
  }));
  document.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', () => {
    const s = bookmarks.find(b => b.id === btn.dataset.id);
    window.showModal({
      title: 'Hapus Sponsor Tersimpan',
      content: `<p>Apakah kamu yakin ingin menghapus <strong>${s?.name}</strong> dari daftar tersimpan?</p>`,
      confirmText: 'Hapus',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        StorageManager.removeBookmark(btn.dataset.id);
        window.showToast(`${s?.name} dihapus dari tersimpan`, 'success');
        renderTersimpan();
      }
    });
  }));
}

// ─── Render: Smart Matching ──────────────────────────────────────────────────

export function renderSmartMatching() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Smart Sponsor Matching</h1>
        <p class="page-subtitle">Isi informasi acaramu untuk mendapatkan rekomendasi sponsor yang paling cocok.</p>
      </div>
    </div>

    <div class="matching-layout">
      <div class="card matching-form-card">
        <h2 class="card-section-title">Informasi Acara</h2>
        <form id="matchingForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nama Acara <span class="required">*</span></label>
              <input type="text" id="mEventName" class="form-input" placeholder="Contoh: Seminar Kewirausahaan 2024">
            </div>
            <div class="form-group">
              <label class="form-label">Kategori Acara <span class="required">*</span></label>
              <select id="mCategory" class="form-input">
                <option value="">Pilih Kategori</option>
                ${['Food & Beverage','Technology','Education','Fashion','Beauty','Healthcare','Printing','Transportation','Media','Retail'].map(c => `<option>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Lokasi Acara <span class="required">*</span></label>
              <select id="mLocation" class="form-input">
                <option value="">Pilih Lokasi</option>
                ${['Malang','Surabaya','Jakarta','Bandung','Yogyakarta'].map(l => `<option>${l}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Jenis Acara <span class="required">*</span></label>
              <select id="mEventType" class="form-input">
                <option value="">Pilih Jenis</option>
                ${['Seminar','Workshop','Kompetisi','Festival','Pameran','Pentas Seni','Kegiatan Sosial','Olahraga'].map(e => `<option>${e}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Target Audiens <span class="required">*</span></label>
            <div class="checkbox-grid">
              ${['Pelajar','Mahasiswa','Profesional','Umum','UMKM'].map(a => `
              <label class="checkbox-label">
                <input type="checkbox" name="mAudience" value="${a}"> ${a}
              </label>`).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Bentuk Dukungan yang Dibutuhkan <span class="required">*</span></label>
            <div class="checkbox-grid">
              ${['Dana','Produk','Voucher','Merchandise','Fasilitas','Media Partner','Workshop'].map(t => `
              <label class="checkbox-label">
                <input type="checkbox" name="mSupport" value="${t}"> ${t}
              </label>`).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Singkat Acara</label>
            <textarea id="mDesc" class="form-input" rows="3" placeholder="Deskripsikan acaramu..."></textarea>
          </div>

          <div id="matchingError" class="form-error hidden"></div>
          <button type="submit" class="btn btn-primary btn-lg">
            <i data-lucide="zap" style="width:18px;height:18px;"></i> Cari Rekomendasi Sponsor
          </button>
        </form>
      </div>

      <div id="matchingResults" class="matching-results"></div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  document.getElementById('matchingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const errEl = document.getElementById('matchingError');
    const category = document.getElementById('mCategory').value;
    const location = document.getElementById('mLocation').value;
    const eventType = document.getElementById('mEventType').value;
    const audience = [...document.querySelectorAll('input[name="mAudience"]:checked')].map(i => i.value);
    const support = [...document.querySelectorAll('input[name="mSupport"]:checked')].map(i => i.value);

    if (!category || !location || !eventType || audience.length === 0 || support.length === 0) {
      errEl.textContent = 'Harap isi semua field yang wajib diisi (tandai dengan *) dan pilih minimal satu audiens dan satu bentuk dukungan.';
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');

    const profile = { category, location, eventType, targetAudience: audience, neededSupport: support };
    const results = runMatching(profile, allSponsors);
    renderMatchingResults(results);
  });
}

function renderMatchingResults(results) {
  const container = document.getElementById('matchingResults');
  if (!container) return;

  container.innerHTML = `
    <div class="matching-results-header">
      <h2>Hasil Rekomendasi <span class="badge badge-primary">${results.length} sponsor</span></h2>
      <p class="text-muted">Persentase merupakan skor simulasi berdasarkan aturan pencocokan, bukan jaminan sponsor menerima pengajuan.</p>
    </div>
    <div class="matching-results-grid">
      ${results.map(s => renderSponsorCard(s, { showScore: true, showBookmark: true, scoreData: { score: s.score, label: s.label } })).join('')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  attachCardListeners();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function toggleBookmark(sponsorId) {
  const sponsor = allSponsors.find(s => s.id === sponsorId);
  if (!sponsor) return;
  if (StorageManager.isBookmarked(sponsorId)) {
    StorageManager.removeBookmark(sponsorId);
    window.showToast(`${sponsor.name} dihapus dari tersimpan`, 'warning');
  } else {
    StorageManager.addBookmark(sponsor);
    window.showToast(`${sponsor.name} berhasil disimpan!`, 'success');
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return '-'; }
}