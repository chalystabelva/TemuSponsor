import { StorageManager } from './storage.js';

function generateId(prefix) {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.random().toString(16).slice(2,6).toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try { return new Date(dateString).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }); }
  catch { return '-'; }
}

function getCategoryColor(cat) {
  const map = { 'Seminar':'#315D8A','Workshop':'#16A36A','Kompetisi':'#DC5353','Festival':'#F4A340','Pameran':'#8b5cf6','Pentas Seni':'#c084fc','Kegiatan Sosial':'#06b6d4','Olahraga':'#f97316' };
  return map[cat] || '#718096';
}

let editingEventId = null;

export function renderAcaraSaya() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const events = StorageManager.getEvents();

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Acara Saya</h1>
        <p class="page-subtitle">Kelola semua acara yang sedang atau akan kamu selenggarakan.</p>
      </div>
      <button class="btn btn-primary" id="toggleFormBtn">
        <i data-lucide="plus" style="width:16px;height:16px;"></i> Tambah Acara
      </button>
    </div>

    <!-- Form Card -->
    <div class="card collapsible-card hidden" id="eventFormCard">
      <h2 class="card-section-title" id="formTitle">Tambah Acara Baru</h2>
      <form id="eventForm">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Nama Acara <span class="required">*</span></label>
            <input type="text" id="evName" class="form-input" placeholder="Contoh: Seminar Kewirausahaan 2024">
            <span class="field-error" id="err-evName"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Penyelenggara <span class="required">*</span></label>
            <input type="text" id="evOrganizer" class="form-input" placeholder="Nama organisasi penyelenggara">
            <span class="field-error" id="err-evOrganizer"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Kategori Acara <span class="required">*</span></label>
            <select id="evCategory" class="form-input">
              <option value="">Pilih Kategori</option>
              ${['Seminar','Workshop','Kompetisi','Festival','Pameran','Pentas Seni','Kegiatan Sosial','Olahraga'].map(c => `<option>${c}</option>`).join('')}
            </select>
            <span class="field-error" id="err-evCategory"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Acara <span class="required">*</span></label>
            <input type="date" id="evDate" class="form-input">
            <span class="field-error" id="err-evDate"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Lokasi <span class="required">*</span></label>
            <input type="text" id="evLocation" class="form-input" placeholder="Kota atau lokasi spesifik">
            <span class="field-error" id="err-evLocation"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Target Peserta <span class="required">*</span></label>
            <input type="number" id="evParticipants" class="form-input" placeholder="Jumlah estimasi peserta" min="1">
            <span class="field-error" id="err-evParticipants"></span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi Acara</label>
          <textarea id="evDesc" class="form-input" rows="3" placeholder="Deskripsikan acaramu..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Target Audiens</label>
          <div class="checkbox-grid">
            ${['Pelajar','Mahasiswa','Profesional','Umum','UMKM'].map(a => `<label class="checkbox-label"><input type="checkbox" name="evAudience" value="${a}"> ${a}</label>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Bentuk Dukungan yang Diperlukan</label>
          <div class="checkbox-grid">
            ${['Dana','Produk','Voucher','Merchandise','Fasilitas','Media Partner','Workshop'].map(t => `<label class="checkbox-label"><input type="checkbox" name="evSupport" value="${t}"> ${t}</label>`).join('')}
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" id="cancelFormBtn">Batal</button>
          <button type="submit" class="btn btn-primary" id="saveEventBtn">
            <i data-lucide="save" style="width:16px;height:16px;"></i> Simpan Acara
          </button>
        </div>
      </form>
    </div>

    <!-- Events Grid -->
    <div id="eventsGrid">
      ${renderEventCards(events)}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  attachEventListeners();
}

function renderEventCards(events) {
  if (events.length === 0) {
    return `
      <div class="empty-state">
        <i data-lucide="calendar-x" style="width:48px;height:48px;color:#E5EAF1;"></i>
        <h3>Belum ada acara yang dibuat</h3>
        <p>Buat acara pertamamu dan mulai cari sponsor yang sesuai.</p>
        <button class="btn btn-primary" id="emptyAddBtn"><i data-lucide="plus" style="width:16px;height:16px;"></i> Tambah Acara</button>
      </div>`;
  }
  return `<div class="events-grid">${events.map(ev => renderEventCard(ev)).join('')}</div>`;
}

function renderEventCard(ev) {
  const catColor = getCategoryColor(ev.category);
  return `
    <div class="event-card card" data-id="${ev.id}">
      <div class="event-card-header">
        <span class="badge" style="background:${catColor}20;color:${catColor};border:1px solid ${catColor}40;">${ev.category}</span>
        <div class="event-card-menu">
          <button class="btn-icon edit-event-btn" data-id="${ev.id}" title="Edit"><i data-lucide="pencil" style="width:16px;height:16px;"></i></button>
          <button class="btn-icon delete-event-btn danger-icon" data-id="${ev.id}" title="Hapus"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
        </div>
      </div>
      <h3 class="event-card-name">${ev.name}</h3>
      <div class="event-card-meta">
        <span><i data-lucide="building-2" style="width:13px;height:13px;"></i> ${ev.organizer}</span>
        <span><i data-lucide="calendar" style="width:13px;height:13px;"></i> ${formatDate(ev.date)}</span>
        <span><i data-lucide="map-pin" style="width:13px;height:13px;"></i> ${ev.location}</span>
        <span><i data-lucide="users" style="width:13px;height:13px;"></i> ${Number(ev.targetParticipants).toLocaleString('id-ID')} peserta</span>
      </div>
      ${ev.description ? `<p class="event-card-desc">${ev.description.substring(0,100)}${ev.description.length > 100 ? '...' : ''}</p>` : ''}
      ${ev.neededSupport && ev.neededSupport.length > 0 ? `
      <div class="event-support-row">
        ${ev.neededSupport.slice(0,3).map(t => `<span class="badge badge-outline">${t}</span>`).join('')}
        ${ev.neededSupport.length > 3 ? `<span class="badge badge-outline">+${ev.neededSupport.length-3}</span>` : ''}
      </div>` : ''}
      <div class="event-card-actions">
        <button class="btn btn-outline btn-sm find-sponsor-btn" data-id="${ev.id}" data-category="${ev.category}">
          <i data-lucide="search" style="width:14px;height:14px;"></i> Cari Sponsor
        </button>
        <button class="btn btn-primary btn-sm apply-event-btn" data-id="${ev.id}">
          <i data-lucide="send" style="width:14px;height:14px;"></i> Buat Pengajuan
        </button>
      </div>
    </div>`;
}

function attachEventListeners() {
  const toggleBtn = document.getElementById('toggleFormBtn');
  const formCard = document.getElementById('eventFormCard');
  const cancelBtn = document.getElementById('cancelFormBtn');

  toggleBtn?.addEventListener('click', () => {
    editingEventId = null;
    resetForm();
    document.getElementById('formTitle').textContent = 'Tambah Acara Baru';
    formCard?.classList.toggle('hidden');
    if (!formCard?.classList.contains('hidden')) formCard.scrollIntoView({ behavior:'smooth' });
  });

  cancelBtn?.addEventListener('click', () => {
    formCard?.classList.add('hidden');
    editingEventId = null;
    resetForm();
  });

  document.getElementById('emptyAddBtn')?.addEventListener('click', () => {
    formCard?.classList.remove('hidden');
    formCard?.scrollIntoView({ behavior:'smooth' });
  });

  document.getElementById('eventForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitEventForm();
  });

  document.querySelectorAll('.edit-event-btn').forEach(btn => btn.addEventListener('click', () => editEvent(btn.dataset.id)));
  document.querySelectorAll('.delete-event-btn').forEach(btn => btn.addEventListener('click', () => deleteEventConfirm(btn.dataset.id)));
  document.querySelectorAll('.find-sponsor-btn').forEach(btn => btn.addEventListener('click', () => window.navigate('cari-sponsor', { category: btn.dataset.category })));
  document.querySelectorAll('.apply-event-btn').forEach(btn => btn.addEventListener('click', () => window.navigate('pengajuan', {})));
}

function validateEventForm() {
  let valid = true;
  const fields = [
    { id: 'evName', errId: 'err-evName', msg: 'Nama acara wajib diisi' },
    { id: 'evOrganizer', errId: 'err-evOrganizer', msg: 'Penyelenggara wajib diisi' },
    { id: 'evCategory', errId: 'err-evCategory', msg: 'Kategori wajib dipilih' },
    { id: 'evDate', errId: 'err-evDate', msg: 'Tanggal acara wajib diisi' },
    { id: 'evLocation', errId: 'err-evLocation', msg: 'Lokasi wajib diisi' },
    { id: 'evParticipants', errId: 'err-evParticipants', msg: 'Jumlah peserta wajib diisi' },
  ];
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    if (!el?.value.trim()) { if(err) err.textContent = f.msg; valid = false; }
    else { if(err) err.textContent = ''; }
  });
  return valid;
}

function submitEventForm() {
  if (!validateEventForm()) return;
  const audience = [...document.querySelectorAll('input[name="evAudience"]:checked')].map(i => i.value);
  const support = [...document.querySelectorAll('input[name="evSupport"]:checked')].map(i => i.value);
  const event = {
    id: editingEventId || generateId('EVT'),
    name: document.getElementById('evName').value.trim(),
    organizer: document.getElementById('evOrganizer').value.trim(),
    category: document.getElementById('evCategory').value,
    date: document.getElementById('evDate').value,
    location: document.getElementById('evLocation').value.trim(),
    targetParticipants: parseInt(document.getElementById('evParticipants').value) || 0,
    description: document.getElementById('evDesc').value.trim(),
    targetAudience: audience,
    neededSupport: support,
    createdAt: new Date().toISOString()
  };
  if (editingEventId) {
    StorageManager.updateEvent(event);
    window.showToast('Acara berhasil diperbarui!', 'success');
  } else {
    StorageManager.saveEvent(event);
    window.showToast('Acara berhasil ditambahkan!', 'success');
  }
  editingEventId = null;
  renderAcaraSaya();
}

function editEvent(eventId) {
  const ev = StorageManager.getEvents().find(e => e.id === eventId);
  if (!ev) return;
  editingEventId = eventId;
  const formCard = document.getElementById('eventFormCard');
  formCard?.classList.remove('hidden');
  document.getElementById('formTitle').textContent = 'Edit Acara';
  document.getElementById('evName').value = ev.name || '';
  document.getElementById('evOrganizer').value = ev.organizer || '';
  document.getElementById('evCategory').value = ev.category || '';
  document.getElementById('evDate').value = ev.date || '';
  document.getElementById('evLocation').value = ev.location || '';
  document.getElementById('evParticipants').value = ev.targetParticipants || '';
  document.getElementById('evDesc').value = ev.description || '';
  document.querySelectorAll('input[name="evAudience"]').forEach(cb => cb.checked = (ev.targetAudience||[]).includes(cb.value));
  document.querySelectorAll('input[name="evSupport"]').forEach(cb => cb.checked = (ev.neededSupport||[]).includes(cb.value));
  formCard?.scrollIntoView({ behavior:'smooth' });
}

function deleteEventConfirm(eventId) {
  const ev = StorageManager.getEvents().find(e => e.id === eventId);
  if (!ev) return;
  window.showModal({
    title: 'Hapus Acara',
    content: `<p>Apakah kamu yakin ingin menghapus acara <strong>${ev.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>`,
    confirmText: 'Hapus',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      StorageManager.deleteEvent(eventId);
      window.showToast(`Acara "${ev.name}" berhasil dihapus`, 'success');
      renderAcaraSaya();
    }
  });
}

function resetForm() {
  const form = document.getElementById('eventForm');
  if (form) form.reset();
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}