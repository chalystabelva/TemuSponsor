import { StorageManager } from './storage.js';
import { sponsors } from './data.js';

function generateId(prefix) {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.random().toString(16).slice(2,6).toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

function formatDate(ds) {
  if (!ds) return '-';
  try { return new Date(ds).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'}); }
  catch { return '-'; }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getStatusBadge(status) {
  const map = {
    'Menunggu': 'badge-warning',
    'Diproses': 'badge-info',
    'Diterima': 'badge-success',
    'Ditolak': 'badge-danger'
  };
  return `<span class="badge ${map[status]||'badge-outline'}">${status}</span>`;
}

export function renderPengajuan(params = {}) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const prefilledSponsorId = params.sponsorId || '';
  const prefilledSponsorName = params.sponsorName || '';
  const profile = StorageManager.getProfile();
  const applications = StorageManager.getApplications();

  // Build sponsor options
  const sponsorOptions = sponsors.map(s =>
    `<option value="${s.id}" ${s.id === prefilledSponsorId ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengajuan Kerja Sama</h1>
        <p class="page-subtitle">Isi formulir berikut untuk mengajukan kerja sama dengan sponsor.</p>
      </div>
    </div>

    <div class="app-layout">
      <!-- Form -->
      <div class="card app-form-card">
        <h2 class="card-section-title">Formulir Pengajuan</h2>
        <form id="appForm" novalidate>

          <h3 class="form-section-heading">Informasi Sponsor</h3>
          <div class="form-group">
            <label class="form-label">Sponsor yang Dituju <span class="required">*</span></label>
            <select id="appSponsorId" class="form-input">
              <option value="">Pilih Sponsor</option>
              ${sponsorOptions}
            </select>
            <span class="field-error" id="err-appSponsorId"></span>
          </div>

          <h3 class="form-section-heading">Informasi Organisasi</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nama Organisasi <span class="required">*</span></label>
              <input type="text" id="appOrgName" class="form-input" value="${profile.organizationName||''}" placeholder="Nama organisasi pengaju">
              <span class="field-error" id="err-appOrgName"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Nama Penanggung Jawab <span class="required">*</span></label>
              <input type="text" id="appPicName" class="form-input" value="${profile.fullName||''}" placeholder="Nama ketua/koordinator">
              <span class="field-error" id="err-appPicName"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Email <span class="required">*</span></label>
              <input type="email" id="appEmail" class="form-input" value="${profile.email||''}" placeholder="email@contoh.com">
              <span class="field-error" id="err-appEmail"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Telepon <span class="required">*</span></label>
              <input type="tel" id="appPhone" class="form-input" value="${profile.phone||''}" placeholder="08xx-xxxx-xxxx">
              <span class="field-error" id="err-appPhone"></span>
            </div>
          </div>

          <h3 class="form-section-heading">Informasi Acara</h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nama Acara <span class="required">*</span></label>
              <input type="text" id="appEventName" class="form-input" placeholder="Nama acara yang akan diselenggarakan">
              <span class="field-error" id="err-appEventName"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Kategori Acara <span class="required">*</span></label>
              <select id="appEventCategory" class="form-input">
                <option value="">Pilih Kategori</option>
                ${['Seminar','Workshop','Kompetisi','Festival','Pameran','Pentas Seni','Kegiatan Sosial','Olahraga'].map(c=>`<option>${c}</option>`).join('')}
              </select>
              <span class="field-error" id="err-appEventCategory"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Pelaksanaan <span class="required">*</span></label>
              <input type="date" id="appEventDate" class="form-input">
              <span class="field-error" id="err-appEventDate"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Lokasi Acara <span class="required">*</span></label>
              <input type="text" id="appEventLocation" class="form-input" placeholder="Kota atau lokasi spesifik">
              <span class="field-error" id="err-appEventLocation"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Perkiraan Jumlah Peserta <span class="required">*</span></label>
              <input type="number" id="appParticipants" class="form-input" placeholder="Estimasi jumlah peserta" min="1">
              <span class="field-error" id="err-appParticipants"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Nominal Dukungan yang Diharapkan (Rp)</label>
              <input type="number" id="appExpected" class="form-input" placeholder="Contoh: 5000000" min="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi Acara <span class="required">*</span></label>
            <textarea id="appEventDesc" class="form-input" rows="3" placeholder="Jelaskan acara secara singkat dan jelas..."></textarea>
            <span class="field-error" id="err-appEventDesc"></span>
          </div>

          <h3 class="form-section-heading">Detail Kerja Sama</h3>
          <div class="form-group">
            <label class="form-label">Bentuk Kerja Sama yang Diinginkan <span class="required">*</span></label>
            <textarea id="appCoopForm" class="form-input" rows="2" placeholder="Contoh: Dana tunai, penyediaan produk, media partner..."></textarea>
            <span class="field-error" id="err-appCoopForm"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Benefit yang Ditawarkan kepada Sponsor <span class="required">*</span></label>
            <textarea id="appBenefit" class="form-input" rows="2" placeholder="Contoh: Logo di banner, sebutan MC, booth exhibition..."></textarea>
            <span class="field-error" id="err-appBenefit"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Upload Proposal (PDF, maks 10MB)</label>
            <div class="file-upload-wrap">
              <input type="file" id="appProposal" class="file-input" accept=".pdf">
              <label for="appProposal" class="file-upload-label">
                <i data-lucide="upload-cloud" style="width:20px;height:20px;"></i>
                <span id="fileNameDisplay">Klik untuk memilih file PDF</span>
              </label>
            </div>
            <span class="field-error" id="err-appProposal"></span>
          </div>

          <div id="appFormError" class="form-error hidden"></div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" id="previewBtn">
              <i data-lucide="eye" style="width:16px;height:16px;"></i> Pratinjau
            </button>
            <button type="submit" class="btn btn-primary btn-lg">
              <i data-lucide="send" style="width:16px;height:16px;"></i> Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>

      <!-- Sidebar hint -->
      <aside class="app-sidebar">
        <div class="card">
          <h3 class="card-section-title">Tips Pengajuan</h3>
          <ul class="tips-list">
            <li><i data-lucide="check-circle-2" style="width:14px;height:14px;color:#16A36A;"></i> Isi semua data dengan lengkap dan jelas</li>
            <li><i data-lucide="check-circle-2" style="width:14px;height:14px;color:#16A36A;"></i> Jelaskan benefit yang nyata bagi sponsor</li>
            <li><i data-lucide="check-circle-2" style="width:14px;height:14px;color:#16A36A;"></i> Sertakan proposal dalam format PDF</li>
            <li><i data-lucide="check-circle-2" style="width:14px;height:14px;color:#16A36A;"></i> Ajukan minimal 1 bulan sebelum acara</li>
          </ul>
        </div>
        <div class="card disclaimer-card">
          <i data-lucide="info" style="width:16px;height:16px;color:#718096;"></i>
          <p>Ini adalah simulasi pengajuan di frontend. Tidak ada data yang dikirim ke perusahaan secara nyata.</p>
        </div>
      </aside>
    </div>

    <!-- Riwayat Pengajuan -->
    <div class="page-header" style="margin-top:2rem;">
      <h2 class="page-title" style="font-size:1.3rem;">Riwayat Pengajuan</h2>
      <div class="filter-row">
        <select id="statusFilter" class="select-input select-sm">
          <option value="">Semua Status</option>
          <option>Menunggu</option><option>Diproses</option><option>Diterima</option><option>Ditolak</option>
        </select>
        <input type="text" id="appSearch" class="search-input search-sm" placeholder="Cari nama sponsor...">
      </div>
    </div>
    <div id="appHistoryContainer">
      ${renderApplicationHistory(applications, '', '')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // File upload display
  document.getElementById('appProposal')?.addEventListener('change', e => {
    const file = e.target.files[0];
    const display = document.getElementById('fileNameDisplay');
    const err = document.getElementById('err-appProposal');
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        err.textContent = 'Hanya file PDF yang diperbolehkan';
        e.target.value = '';
        display.textContent = 'Klik untuk memilih file PDF';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        err.textContent = 'Ukuran file maksimal 10MB';
        e.target.value = '';
        display.textContent = 'Klik untuk memilih file PDF';
        return;
      }
      err.textContent = '';
      display.textContent = file.name;
    }
  });

  // Preview
  document.getElementById('previewBtn')?.addEventListener('click', () => {
    const data = getFormData();
    if (!data) return;
    const sponsorName = document.getElementById('appSponsorId').options[document.getElementById('appSponsorId').selectedIndex]?.text || '-';
    window.showModal({
      title: 'Pratinjau Pengajuan',
      content: `
        <div class="preview-grid">
          <div class="preview-row"><span>Sponsor</span><strong>${sponsorName}</strong></div>
          <div class="preview-row"><span>Organisasi</span><strong>${data.organizationName}</strong></div>
          <div class="preview-row"><span>PIC</span><strong>${data.picName}</strong></div>
          <div class="preview-row"><span>Email</span><strong>${data.email}</strong></div>
          <div class="preview-row"><span>Telepon</span><strong>${data.phone}</strong></div>
          <div class="preview-row"><span>Nama Acara</span><strong>${data.eventName}</strong></div>
          <div class="preview-row"><span>Kategori</span><strong>${data.eventCategory}</strong></div>
          <div class="preview-row"><span>Tanggal</span><strong>${formatDate(data.eventDate)}</strong></div>
          <div class="preview-row"><span>Lokasi</span><strong>${data.eventLocation}</strong></div>
          <div class="preview-row"><span>Peserta</span><strong>${Number(data.estimatedParticipants).toLocaleString('id-ID')} orang</strong></div>
          <div class="preview-row"><span>Nominal</span><strong>${data.expectedSupport ? 'Rp '+Number(data.expectedSupport).toLocaleString('id-ID') : '-'}</strong></div>
          <div class="preview-row full"><span>Deskripsi</span><p>${data.eventDescription}</p></div>
          <div class="preview-row full"><span>Bentuk KS</span><p>${data.cooperationForm}</p></div>
          <div class="preview-row full"><span>Benefit Sponsor</span><p>${data.sponsorBenefit}</p></div>
          ${data.proposalFileName ? `<div class="preview-row"><span>Proposal</span><strong>${data.proposalFileName}</strong></div>` : ''}
        </div>`,
      confirmText: 'Tutup',
      onConfirm: () => {}
    });
  });

  // Submit
  document.getElementById('appForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitApplication();
  });

  // History filters
  document.getElementById('statusFilter')?.addEventListener('change', e => {
    const search = document.getElementById('appSearch')?.value || '';
    document.getElementById('appHistoryContainer').innerHTML = renderApplicationHistory(StorageManager.getApplications(), e.target.value, search);
    if (window.lucide) lucide.createIcons();
  });
  document.getElementById('appSearch')?.addEventListener('input', e => {
    const status = document.getElementById('statusFilter')?.value || '';
    document.getElementById('appHistoryContainer').innerHTML = renderApplicationHistory(StorageManager.getApplications(), status, e.target.value);
    if (window.lucide) lucide.createIcons();
  });
}

function getFormData() {
  const sponsorEl = document.getElementById('appSponsorId');
  const sponsorId = sponsorEl?.value;
  const orgName = document.getElementById('appOrgName')?.value.trim();
  const picName = document.getElementById('appPicName')?.value.trim();
  const email = document.getElementById('appEmail')?.value.trim();
  const phone = document.getElementById('appPhone')?.value.trim();
  const eventName = document.getElementById('appEventName')?.value.trim();
  const eventCat = document.getElementById('appEventCategory')?.value;
  const eventDate = document.getElementById('appEventDate')?.value;
  const eventLoc = document.getElementById('appEventLocation')?.value.trim();
  const participants = document.getElementById('appParticipants')?.value;
  const desc = document.getElementById('appEventDesc')?.value.trim();
  const coopForm = document.getElementById('appCoopForm')?.value.trim();
  const benefit = document.getElementById('appBenefit')?.value.trim();
  const expected = document.getElementById('appExpected')?.value;
  const fileInput = document.getElementById('appProposal');
  const fileName = fileInput?.files[0]?.name || '';

  // Validate
  let valid = true;
  const required = [
    ['appSponsorId', 'err-appSponsorId', sponsorId, 'Pilih sponsor yang dituju'],
    ['appOrgName', 'err-appOrgName', orgName, 'Nama organisasi wajib diisi'],
    ['appPicName', 'err-appPicName', picName, 'Nama PIC wajib diisi'],
    ['appEmail', 'err-appEmail', email, 'Email wajib diisi'],
    ['appPhone', 'err-appPhone', phone, 'Nomor telepon wajib diisi'],
    ['appEventName', 'err-appEventName', eventName, 'Nama acara wajib diisi'],
    ['appEventCategory', 'err-appEventCategory', eventCat, 'Kategori acara wajib dipilih'],
    ['appEventDate', 'err-appEventDate', eventDate, 'Tanggal acara wajib diisi'],
    ['appEventLocation', 'err-appEventLocation', eventLoc, 'Lokasi acara wajib diisi'],
    ['appParticipants', 'err-appParticipants', participants, 'Jumlah peserta wajib diisi'],
    ['appEventDesc', 'err-appEventDesc', desc, 'Deskripsi acara wajib diisi'],
    ['appCoopForm', 'err-appCoopForm', coopForm, 'Bentuk kerja sama wajib diisi'],
    ['appBenefit', 'err-appBenefit', benefit, 'Benefit sponsor wajib diisi'],
  ];
  required.forEach(([fid, eid, val, msg]) => {
    const errEl = document.getElementById(eid);
    if (!val) { if(errEl) errEl.textContent = msg; valid = false; }
    else { if(errEl) errEl.textContent = ''; }
  });
  if (email && !validateEmail(email)) {
    const el = document.getElementById('err-appEmail');
    if(el) el.textContent = 'Masukkan format email yang valid';
    valid = false;
  }
  if (!valid) return null;

  const sponsorName = sponsorEl.options[sponsorEl.selectedIndex]?.text || '';
  return {
    sponsorId, sponsorName, organizationName: orgName, picName, email, phone,
    eventName, eventCategory: eventCat, eventDate, eventLocation: eventLoc,
    estimatedParticipants: parseInt(participants)||0, eventDescription: desc,
    cooperationForm: coopForm, sponsorBenefit: benefit,
    expectedSupport: expected ? parseInt(expected) : 0,
    proposalFileName: fileName
  };
}

function submitApplication() {
  const data = getFormData();
  if (!data) {
    const err = document.getElementById('appFormError');
    if(err) { err.textContent = 'Harap lengkapi semua field yang wajib diisi.'; err.classList.remove('hidden'); }
    return;
  }
  const app = {
    id: generateId('APP'),
    ...data,
    status: 'Menunggu',
    submittedAt: new Date().toISOString()
  };
  StorageManager.saveApplication(app);
  window.showToast('Pengajuan berhasil disimpan!', 'success');
  document.getElementById('appForm')?.reset();
  document.getElementById('fileNameDisplay').textContent = 'Klik untuk memilih file PDF';
  document.getElementById('appFormError')?.classList.add('hidden');
  document.getElementById('appHistoryContainer').innerHTML = renderApplicationHistory(StorageManager.getApplications(),'','');
  if (window.lucide) lucide.createIcons();
}

function renderApplicationHistory(applications, statusFilter, searchFilter) {
  let filtered = applications;
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
  if (searchFilter) {
    const kw = searchFilter.toLowerCase();
    filtered = filtered.filter(a => a.sponsorName.toLowerCase().includes(kw) || a.eventName.toLowerCase().includes(kw));
  }

  if (filtered.length === 0) {
    return `<div class="empty-state empty-state-sm">
      <i data-lucide="inbox" style="width:36px;height:36px;color:#E5EAF1;"></i>
      <p>${applications.length === 0 ? 'Belum ada pengajuan yang dikirim.' : 'Tidak ada pengajuan yang cocok dengan filter.'}</p>
    </div>`;
  }

  return `
    <div class="card table-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Sponsor</th><th>Acara</th><th>Tanggal</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.slice().reverse().map(a => `
            <tr>
              <td class="text-mono text-muted">${a.id}</td>
              <td><strong>${a.sponsorName}</strong></td>
              <td>${a.eventName}</td>
              <td class="text-muted">${formatDate(a.submittedAt)}</td>
              <td>${getStatusBadge(a.status)}</td>
              <td><button class="btn btn-outline btn-xs view-app-btn" data-id="${a.id}">Detail</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

export function renderApplicationDetail(appId) {
  const app = StorageManager.getApplications().find(a => a.id === appId);
  if (!app) return;
  window.showModal({
    title: `Detail Pengajuan ${app.id}`,
    content: `
      <div class="preview-grid">
        <div class="preview-row"><span>ID</span><strong class="text-mono">${app.id}</strong></div>
        <div class="preview-row"><span>Status</span>${getStatusBadge(app.status)}</div>
        <div class="preview-row"><span>Sponsor</span><strong>${app.sponsorName}</strong></div>
        <div class="preview-row"><span>Organisasi</span><strong>${app.organizationName}</strong></div>
        <div class="preview-row"><span>PIC</span><strong>${app.picName}</strong></div>
        <div class="preview-row"><span>Email</span><strong>${app.email}</strong></div>
        <div class="preview-row"><span>Telepon</span><strong>${app.phone}</strong></div>
        <div class="preview-row"><span>Acara</span><strong>${app.eventName}</strong></div>
        <div class="preview-row"><span>Kategori</span><strong>${app.eventCategory}</strong></div>
        <div class="preview-row"><span>Tanggal Acara</span><strong>${formatDate(app.eventDate)}</strong></div>
        <div class="preview-row"><span>Lokasi</span><strong>${app.eventLocation}</strong></div>
        <div class="preview-row"><span>Peserta</span><strong>${Number(app.estimatedParticipants).toLocaleString('id-ID')} orang</strong></div>
        <div class="preview-row"><span>Tanggal Kirim</span><strong>${formatDate(app.submittedAt)}</strong></div>
        ${app.expectedSupport ? `<div class="preview-row"><span>Nominal</span><strong>Rp ${Number(app.expectedSupport).toLocaleString('id-ID')}</strong></div>` : ''}
        <div class="preview-row full"><span>Deskripsi Acara</span><p>${app.eventDescription}</p></div>
        <div class="preview-row full"><span>Bentuk KS</span><p>${app.cooperationForm}</p></div>
        <div class="preview-row full"><span>Benefit Sponsor</span><p>${app.sponsorBenefit}</p></div>
        ${app.proposalFileName ? `<div class="preview-row"><span>Proposal</span><strong>${app.proposalFileName}</strong></div>` : ''}
      </div>`,
    confirmText: 'Tutup',
    onConfirm: () => {}
  });
}