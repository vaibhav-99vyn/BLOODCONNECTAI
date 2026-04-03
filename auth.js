// ============================================================
// auth.js — Authentication Logic
// ============================================================

const Auth = {

  login(email, password) {
    const user = DB.getUserByEmail(email);
    if (!user) return { success: false, message: 'Email not found.' };
    if (user.password !== password) return { success: false, message: 'Incorrect password.' };
    sessionStorage.setItem('bms_current_user', JSON.stringify(user));
    return { success: true, user };
  },

  logout() {
    sessionStorage.removeItem('bms_current_user');
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    try {
      return JSON.parse(sessionStorage.getItem('bms_current_user')) || null;
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  requireAuth(role) {
    const user = this.getCurrentUser();
    if (!user) {
      alert('Please log in first.');
      window.location.href = 'index.html';
      return null;
    }
    if (role && user.role !== role) {
      alert('Access denied.');
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  register(data) {
    // Check duplicate email
    if (DB.getUserByEmail(data.email)) {
      return { success: false, message: 'Email already registered.' };
    }
    const user = DB.addUser(data);
    // If hospital or bloodbank, init their stock
    if (user.role === 'hospital' || user.role === 'bloodbank') {
      DB.initStockForNewOwner(user.id, user.role, user.name);
    }
    return { success: true, user };
  }
};
