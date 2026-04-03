// ============================================================
// db.js — Mock Database using localStorage
// ============================================================

const DB = {

  // ---------- INIT ----------
  init() {
    if (!localStorage.getItem('bms_initialized')) {
      this.seed();
      localStorage.setItem('bms_initialized', 'true');
    }
  },

  seed() {
    // Admin
    this.set('users', [
      {
        id: 'admin-001',
        role: 'admin',
        name: 'System Admin',
        email: 'admin@blood.com',
        password: 'admin123',
        createdAt: new Date().toISOString()
      },
      {
        id: 'hospital-001',
        role: 'hospital',
        name: 'City General Hospital',
        email: 'hospital@demo.com',
        password: 'hospital123',
        address: '123 Main Street, Mumbai, Maharashtra',
        phone: '9876543210',
        lat: 19.0760,
        lng: 72.8777,
        createdAt: new Date().toISOString()
      },
      {
        id: 'bloodbank-001',
        role: 'bloodbank',
        name: 'LifeLine Blood Bank',
        email: 'bloodbank@demo.com',
        password: 'bank123',
        address: '456 Park Avenue, Thane, Maharashtra',
        phone: '9123456780',
        lat: 19.2183,
        lng: 72.9781,
        createdAt: new Date().toISOString()
      },
      {
        id: 'donor-001',
        role: 'donor',
        name: 'Rahul Sharma',
        email: 'donor@demo.com',
        password: 'donor123',
        bloodGroup: 'O+',
        phone: '9000000001',
        address: 'Badlapur, Maharashtra',
        lat: 19.1643,
        lng: 73.2616,
        available: true,
        lastDonated: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'patient-001',
        role: 'patient',
        name: 'Priya Patel',
        email: 'patient@demo.com',
        password: 'patient123',
        bloodGroup: 'A+',
        phone: '9000000002',
        address: 'Ulhasnagar, Maharashtra',
        createdAt: new Date().toISOString()
      }
    ]);

    // Blood Stock for hospital-001
    const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.set('blood_stock', [
      { id: 'stock-h-001', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'A+', units: 10, lastUpdated: new Date().toISOString(), expiryDate: futureDate(25) },
      { id: 'stock-h-002', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'A-', units: 4, lastUpdated: new Date().toISOString(), expiryDate: futureDate(14) },
      { id: 'stock-h-003', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'B+', units: 8, lastUpdated: new Date().toISOString() },
      { id: 'stock-h-004', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'B-', units: 2, lastUpdated: new Date().toISOString() },
      { id: 'stock-h-005', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'O+', units: 15, lastUpdated: new Date().toISOString() },
      { id: 'stock-h-006', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'O-', units: 5, lastUpdated: new Date().toISOString() },
      { id: 'stock-h-007', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'AB+', units: 3, lastUpdated: new Date().toISOString() },
      { id: 'stock-h-008', ownerId: 'hospital-001', ownerType: 'hospital', ownerName: 'City General Hospital', bloodGroup: 'AB-', units: 1, lastUpdated: new Date().toISOString() },

      { id: 'stock-b-001', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'A+', units: 20, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-002', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'A-', units: 6, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-003', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'B+', units: 12, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-004', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'B-', units: 3, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-005', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'O+', units: 18, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-006', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'O-', units: 7, lastUpdated: new Date().toISOString() },
      { id: 'stock-b-007', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'AB+', units: 5, lastUpdated: new Date().toISOString(), expiryDate: futureDate(22) },
      { id: 'stock-b-008', ownerId: 'bloodbank-001', ownerType: 'bloodbank', ownerName: 'LifeLine Blood Bank', bloodGroup: 'AB-', units: 2, lastUpdated: new Date().toISOString(), expiryDate: futureDate(10) },
    ]);

    // Donations
    this.set('donations', []);

    // Blood Requests
    this.set('blood_requests', []);

    // Emergency Requests
    this.set('emergency_requests', []);

    // Donor Health Passports shared between hospital/bloodbank/donor/admin
    this.set('passports', []);
  },

  // ---------- HELPERS ----------
  get(key) {
    try {
      return JSON.parse(localStorage.getItem('bms_' + key)) || [];
    } catch { return []; }
  },

  set(key, value) {
    localStorage.setItem('bms_' + key, JSON.stringify(value));
  },

  genId(prefix = 'id') {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  },

  // ---------- USERS ----------
  getUsers() { return this.get('users'); },

  getUserById(id) { return this.getUsers().find(u => u.id === id) || null; },

  getUserByEmail(email) { return this.getUsers().find(u => u.email === email.toLowerCase()) || null; },

  addUser(user) {
    const users = this.getUsers();
    user.id = this.genId(user.role);
    user.email = user.email.toLowerCase();
    user.createdAt = new Date().toISOString();
    users.push(user);
    this.set('users', users);
    return user;
  },

  updateUser(id, updates) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    this.set('users', users);
  },

  getUsersByRole(role) { return this.getUsers().filter(u => u.role === role); },

  // ---------- BLOOD STOCK ----------
  getStock() { return this.get('blood_stock'); },

  getStockByOwner(ownerId) { return this.getStock().filter(s => s.ownerId === ownerId); },

  getStockByBloodGroup(bloodGroup) { return this.getStock().filter(s => s.bloodGroup === bloodGroup && s.units > 0); },

  getExpiryBatches() { return this.get('expiry_batches'); },

  setExpiryBatches(batches) { this.set('expiry_batches', batches); },

  addExpiryBatch(ownerId, bloodGroup, units, expiryDate, source = 'system') {
    if (!ownerId || !bloodGroup || !units || !expiryDate) return;
    const owner = this.getUserById(ownerId);
    const batches = this.getExpiryBatches();
    const existing = batches.find(b => b.ownerId === ownerId && b.bloodGroup === bloodGroup && b.expiryDate === expiryDate);
    if (existing) {
      existing.units += units;
      existing.updatedAt = new Date().toISOString();
    } else {
      batches.push({
        id: this.genId('exp'),
        ownerId,
        ownerType: owner ? owner.role : 'unknown',
        ownerName: owner ? owner.name : 'Unknown',
        bloodGroup,
        units,
        expiryDate,
        source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.setExpiryBatches(batches);
  },

  cleanupExpiredBatches() {
    const batches = this.getExpiryBatches();
    const now = new Date();
    const alive = batches.filter(b => new Date(b.expiryDate) >= now); // keep not expired
    this.setExpiryBatches(alive);
    return alive;
  },

  getStockByExpiryStatus() {
    const now = new Date();
    return this.getStock().map(s => {
      const expiry = s.expiryDate ? new Date(s.expiryDate) : null;
      const daysLeft = expiry ? Math.ceil((expiry - now) / (24*60*60*1000)) : null;
      const status = expiry ? (daysLeft < 0 ? 'expired' : daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'safe') : 'unknown';
      return { ...s, daysLeft, status };
    });
  },

  // ---------- DONOR PASSPORTS ----------
  getPassports() { return this.get('passports'); },

  getPassportById(id) { return this.getPassports().find(p => p.id === id) || null; },

  getPassportsByDonorId(donorId) { return this.getPassports().filter(p => p.donorId === donorId); },

  getPassportByDonorId(donorId) { return this.getPassports().find(p => p.donorId === donorId) || null; },

  getPassportsByCreator(creatorId) { return this.getPassports().filter(p => p.createdBy === creatorId); },

  upsertPassport(passport) {
    if (!passport || !passport.donorId) return null;
    const src = this.getPassports();
    const existingIndex = src.findIndex(p => p.donorId === passport.donorId);
    if (existingIndex !== -1) {
      src[existingIndex] = { ...src[existingIndex], ...passport, updatedAt: new Date().toISOString() };
      this.set('passports', src);
      return src[existingIndex];
    }
    const donor = this.getUserById(passport.donorId);
    const entry = {
      id: this.genId('pp'),
      donorId: passport.donorId,
      donorName: donor ? donor.name : passport.donorName || 'Unknown Donor',
      donorEmail: donor ? donor.email : passport.donorEmail || '',
      bloodGroup: passport.bloodGroup || (donor ? donor.bloodGroup : ''),
      age: passport.age || 0,
      weight: passport.weight || 0,
      hb: passport.hb || 0,
      bp: passport.bp || 'unknown',
      lastDonation: passport.lastDonation || null,
      totalDonations: passport.totalDonations || 0,
      meds: passport.meds || 'none',
      illness: passport.illness || 'none',
      since: passport.since || '',
      city: passport.city || '',
      score: passport.score || 0,
      createdBy: passport.createdBy || null,
      creatorRole: passport.creatorRole || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    src.push(entry);
    this.set('passports', src);
    return entry;
  },

  deletePassport(id) {
    const passports = this.getPassports().filter(p => p.id !== id);
    this.set('passports', passports);
  },

  updateStock(ownerId, bloodGroup, delta, expiryDate = null) {
    const stock = this.getStock();
    const idx = stock.findIndex(s => s.ownerId === ownerId && s.bloodGroup === bloodGroup);
    if (idx !== -1) {
      stock[idx].units = Math.max(0, stock[idx].units + delta);
      stock[idx].lastUpdated = new Date().toISOString();
      if (delta > 0 && expiryDate) stock[idx].expiryDate = expiryDate;
    } else if (delta > 0) {
      const owner = this.getUserById(ownerId);
      stock.push({
        id: this.genId('stock'),
        ownerId,
        ownerType: owner ? owner.role : 'hospital',
        ownerName: owner ? owner.name : 'Unknown',
        bloodGroup,
        units: delta,
        lastUpdated: new Date().toISOString(),
        expiryDate: expiryDate || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    this.set('blood_stock', stock);

    // Log expiry batch data when inventory is added with an expiry.
    if (delta > 0 && expiryDate) {
      this.addExpiryBatch(ownerId, bloodGroup, delta, expiryDate, 'updateStock');
    }
  },

  initStockForNewOwner(ownerId, ownerType, ownerName) {
    const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const stock = this.getStock();
    groups.forEach((bg, i) => {
      stock.push({
        id: this.genId('stock'),
        ownerId, ownerType, ownerName,
        bloodGroup: bg, units: 0,
        lastUpdated: new Date().toISOString()
      });
    });
    this.set('blood_stock', stock);
  },

  // ---------- DONATIONS ----------
  getDonations() { return this.get('donations'); },

  addDonation(donation) {
    const donations = this.getDonations();
    donation.id = this.genId('don');
    donation.createdAt = new Date().toISOString();
    donations.push(donation);
    this.set('donations', donations);
    // Update stock
    this.updateStock(donation.receiverId, donation.bloodGroup, donation.units);
    // Update donor last donated
    this.updateUser(donation.donorId, { lastDonated: new Date().toISOString(), available: false });
    return donation;
  },

  getDonationsByDonor(donorId) { return this.getDonations().filter(d => d.donorId === donorId); },

  // ---------- BLOOD REQUESTS ----------
  getRequests() { return this.get('blood_requests'); },

  addRequest(request) {
    const requests = this.getRequests();
    request.id = this.genId('req');
    request.status = 'pending';
    request.createdAt = new Date().toISOString();
    requests.push(request);
    this.set('blood_requests', requests);
    return request;
  },

  updateRequest(id, updates) {
    const requests = this.getRequests().map(r => r.id === id ? { ...r, ...updates } : r);
    this.set('blood_requests', requests);
  },

  getRequestsByPatient(patientId) { return this.getRequests().filter(r => r.patientId === patientId); },

  // ---------- EMERGENCY REQUESTS ----------
  getEmergencies() { return this.get('emergency_requests'); },

  addEmergency(emergency) {
    const emergencies = this.getEmergencies();
    emergency.id = this.genId('emg');
    emergency.status = 'active';
    emergency.createdAt = new Date().toISOString();
    emergencies.push(emergency);
    this.set('emergency_requests', emergencies);
    return emergency;
  },

  updateEmergency(id, updates) {
    const emergencies = this.getEmergencies().map(e => e.id === id ? { ...e, ...updates } : e);
    this.set('emergency_requests', emergencies);
  },

  getStockExpiryReports() {
    const stock = this.getStock();
    const now = new Date();
    return stock.map(s => {
      const expiry = s.expiryDate ? new Date(s.expiryDate) : null;
      const daysLeft = expiry ? Math.ceil((expiry - now) / (24*60*60*1000)) : null;
      return { ...s, expiryDate: s.expiryDate || null, daysLeft, status: expiry ? (daysLeft < 0 ? 'expired' : daysLeft <=3 ? 'critical' : daysLeft <=7 ? 'warning' : 'safe') : 'unknown' };
    });
  },

  // ---------- STATS ----------
  getStats() {
    const stock = this.getStock();
    const totalUnits = stock.reduce((sum, s) => sum + s.units, 0);
    const requests = this.getRequests();
    const emergencies = this.getEmergencies();
    const donations = this.getDonations();
    const donors = this.getUsersByRole('donor');
    const patients = this.getUsersByRole('patient');
    const hospitals = this.getUsersByRole('hospital');
    const bloodBanks = this.getUsersByRole('bloodbank');

    const stockByGroup = {};
    ['A+','A-','B+','B-','O+','O-','AB+','AB-'].forEach(bg => {
      stockByGroup[bg] = stock.filter(s => s.bloodGroup === bg).reduce((sum, s) => sum + s.units, 0);
    });

    return {
      totalUnits, totalDonors: donors.length, totalPatients: patients.length,
      totalHospitals: hospitals.length, totalBloodBanks: bloodBanks.length,
      totalRequests: requests.length, totalEmergencies: emergencies.length,
      totalDonations: donations.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
      activeEmergencies: emergencies.filter(e => e.status === 'active').length,
      stockByGroup
    };
  }
};
