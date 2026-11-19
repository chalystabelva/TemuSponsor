export const StorageManager = {
  KEYS: {
    BOOKMARKS: 'ts_bookmarks',
    EVENTS: 'ts_events',
    APPLICATIONS: 'ts_applications',
    PROFILE: 'ts_profile'
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn(`[StorageManager] Gagal membaca key "${key}":`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[StorageManager] Gagal menyimpan key "${key}":`, e);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // Bookmarks
  getBookmarks() {
    return this.get(this.KEYS.BOOKMARKS) || [];
  },

  addBookmark(sponsor) {
    const bookmarks = this.getBookmarks();
    if (!bookmarks.find(s => s.id === sponsor.id)) {
      bookmarks.push({ ...sponsor, savedAt: new Date().toISOString() });
      this.set(this.KEYS.BOOKMARKS, bookmarks);
      return true;
    }
    return false;
  },

  removeBookmark(sponsorId) {
    const bookmarks = this.getBookmarks().filter(s => s.id !== sponsorId);
    this.set(this.KEYS.BOOKMARKS, bookmarks);
  },

  isBookmarked(sponsorId) {
    return this.getBookmarks().some(s => s.id === sponsorId);
  },

  // Events
  getEvents() {
    return this.get(this.KEYS.EVENTS) || [];
  },

  saveEvent(event) {
    const events = this.getEvents();
    events.push(event);
    this.set(this.KEYS.EVENTS, events);
  },

  updateEvent(event) {
    const events = this.getEvents().map(e => e.id === event.id ? event : e);
    this.set(this.KEYS.EVENTS, events);
  },

  deleteEvent(eventId) {
    const events = this.getEvents().filter(e => e.id !== eventId);
    this.set(this.KEYS.EVENTS, events);
  },

  // Applications
  getApplications() {
    return this.get(this.KEYS.APPLICATIONS) || [];
  },

  saveApplication(app) {
    const apps = this.getApplications();
    apps.push(app);
    this.set(this.KEYS.APPLICATIONS, apps);
  },

  // Profile
  getProfile() {
    return this.get(this.KEYS.PROFILE) || {};
  },

  saveProfile(profile) {
    this.set(this.KEYS.PROFILE, profile);
  }
};
