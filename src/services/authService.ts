/**
 * Authentication service for Project Monitoring dan Controling
 * Credentials:
 *   Email: Alamat email pengguna
 *   Password: gov123
 */

export interface AuthUser {
  email: string;
  name: string;
  loginAt: string;
}

const AUTH_STORAGE_KEY = 'PMO_AUTH_SESSION_V1';
const VALID_PASSWORD = 'gov123';

export const authService = {
  // Check if current user is logged in
  isAuthenticated(): boolean {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored) as AuthUser;
      return Boolean(parsed && parsed.email);
    } catch {
      return false;
    }
  },

  // Get current logged-in user details
  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  },

  // Perform login validation
  login(emailInput: string, passwordInput: string): { success: boolean; message?: string; user?: AuthUser } {
    const email = (emailInput || '').trim();
    const password = (passwordInput || '').trim();

    if (!email) {
      return { success: false, message: 'Silakan masukkan email.' };
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Format email tidak valid.' };
    }

    if (!password) {
      return { success: false, message: 'Silakan masukkan password.' };
    }

    // Verify password is gov123
    if (password !== VALID_PASSWORD) {
      return { success: false, message: 'Password salah. Masukkan password yang sesuai.' };
    }

    // Determine display name from email
    const prefix = email.split('@')[0];
    const formattedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

    const user: AuthUser = {
      email,
      name: formattedName,
      loginAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Gagal menyimpan sesi login:', e);
    }

    return { success: true, user };
  },

  // Perform logout
  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Gagal menghapus sesi login:', e);
    }
  },
};
