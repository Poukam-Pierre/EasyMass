export interface AdminUser {
    adminId: string;
    userId: string;
    name: string;
    role: 'ENGINEER' | 'ADMIN';
    email: string;
    phone: string;
    createdAt: string;
}

export interface StoredAuth {
    accessToken: string;
    refreshToken: string;
    admin: AdminUser;
}

const STORAGE_KEY = 'easymesse_admin_auth';

export function readStoredAuth(): StoredAuth | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function writeStoredAuth(auth: StoredAuth | null) {
    if (typeof window === 'undefined') return;
    if (auth) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else window.localStorage.removeItem(STORAGE_KEY);
}
