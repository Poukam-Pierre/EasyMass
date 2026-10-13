export interface ParishUser {
    parishId: string;
    userId: string;
    name: string;
    managerName: string;
    phone: string;
    email: string;
    adminId: string;
    createdAt: string;
    language: 'EN' | 'FR';
    // Not part of the login response (no backend route returns a parish's
    // own full record) — only ever populated client-side from the response
    // of a successful PATCH /parishes/:id/payout-method.
    payoutNumber?: string | null;
}

export interface StoredAuth {
    accessToken: string;
    refreshToken: string;
    parish: ParishUser;
}

const STORAGE_KEY = 'easymesse_parish_auth';

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
