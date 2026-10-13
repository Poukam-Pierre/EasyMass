import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { readStoredAuth, writeStoredAuth } from './authStorage';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
    const stored = readStoredAuth();
    if (stored?.accessToken) {
        config.headers.Authorization = `Bearer ${stored.accessToken}`;
    }
    return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// A 15-minute access token expiring mid-session is routine, not exceptional —
// this transparently gets a fresh one via the refresh token and replays the
// original request once, so callers never have to think about expiry.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const stored = readStoredAuth();
    if (!stored?.refreshToken) return null;
    try {
        const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`,
            { refreshToken: stored.refreshToken }
        );
        writeStoredAuth({
            ...stored,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });
        return data.accessToken as string;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableConfig | undefined;
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            refreshPromise = refreshPromise ?? refreshAccessToken();
            const newToken = await refreshPromise;
            refreshPromise = null;
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
            writeStoredAuth(null);
            if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export function apiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string | string[] } | undefined;
        if (Array.isArray(data?.message)) return data.message[0];
        if (typeof data?.message === 'string') return data.message;
    }
    return fallback;
}

export default api;
