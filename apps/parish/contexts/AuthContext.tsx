import axios from 'axios';
import { useRouter } from 'next/router';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { apiErrorMessage } from '../lib/api';
import { ParishUser, readStoredAuth, writeStoredAuth } from '../lib/authStorage';

interface AuthContextValue {
    parish: ParishUser | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
    logout: () => Promise<void>;
    setParish: (parish: ParishUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [parish, setParishState] = useState<ParishUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = readStoredAuth();
        if (stored) {
            setParishState(stored.parish);
            setAccessToken(stored.accessToken);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login-parish`,
                { email, password }
            );
            const parishUser: ParishUser = {
                parishId: data.parishId,
                userId: data.userId,
                name: data.name,
                managerName: data.managerName,
                phone: data.phone,
                email: data.email,
                adminId: data.adminId,
                createdAt: data.createdAt,
            };
            writeStoredAuth({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                parish: parishUser,
            });
            setParishState(parishUser);
            setAccessToken(data.accessToken);
            return { ok: true as const };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                return {
                    ok: false as const,
                    message: 'This account is already logged in elsewhere. Please log out from that session first.',
                };
            }
            return { ok: false as const, message: apiErrorMessage(error, 'Login failed.') };
        }
    }, []);

    const logout = useCallback(async () => {
        const stored = readStoredAuth();
        if (stored?.refreshToken) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                    refreshToken: stored.refreshToken,
                });
            } catch {
                // best-effort — clear local state regardless of whether the
                // server-side refresh token row was successfully revoked
            }
        }
        writeStoredAuth(null);
        setParishState(null);
        setAccessToken(null);
        router.push('/login');
    }, [router]);

    const setParish = useCallback((updated: ParishUser) => {
        setParishState(updated);
        const stored = readStoredAuth();
        if (stored) writeStoredAuth({ ...stored, parish: updated });
    }, []);

    return (
        <AuthContext.Provider value={{ parish, accessToken, isLoading, login, logout, setParish }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
