// ─────────────────────────────────────────────────────────────────────────────
//  ZakatAid  –  Frontend API Client
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const tokenStorage = {
    getAccess: () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null),
    getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null),
    setTokens: (access: string, refresh: string) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        sessionStorage.clear();
    },
};

// ── User profile storage ───────────────────────────────────────────────────────
export const userStorage = {
    save: (user: AuthUser) => {
        if (typeof window !== 'undefined')
            localStorage.setItem('authUser', JSON.stringify(user));
    },
    get: (): AuthUser | null => {
        if (typeof window === 'undefined') return null;
        try { return JSON.parse(localStorage.getItem('authUser') || 'null'); }
        catch { return null; }
    },
    clear: () => { if (typeof window !== 'undefined') localStorage.removeItem('authUser'); },
};

// ── Structured error ──────────────────────────────────────────────────────────
export class ApiError extends Error {
    status: number;
    errors?: Record<string, string>;   // field-level validation errors

    constructor(message: string, status: number, errors?: Record<string, string>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

// ── Core request ──────────────────────────────────────────────────────────────
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && retry) {
        const refreshToken = tokenStorage.getRefresh();
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
                if (refreshRes.ok) {
                    const { data } = await refreshRes.json();
                    tokenStorage.setTokens(data.accessToken, data.refreshToken);
                    // Retry original request with the new token
                    return request<T>(endpoint, options, false);
                }
            } catch {
                // refresh failed – fall through to sign out
            }
        }
        tokenStorage.clearTokens();
        window.location.href = '/auth';
        throw new ApiError('Session expired', 401);
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new ApiError(
            json.message || 'Something went wrong',
            res.status,
            json.errors,
        );
    }

    return json as T;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
const api = {
    get: <T>(url: string) => request<T>(url, { method: 'GET' }),
    post: <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(url: string, body: unknown) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────────────────
//  Auth API calls
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    gender: string;
    ageRange: string;
    employmentStatus: string;
    country: string;
    region?: string;
    town?: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    lastLogin?: string;
    createdAt: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        requiresVerification?: boolean;
        verificationTarget?: string;
        verificationPurpose?: string;
    };
}

export interface RegisterPayload {
    // Step 1
    fullName: string;
    gender: string;
    ageRange: string;
    employmentStatus: string;
    // Step 2
    country: string;
    region?: string;
    town?: string;
    // Step 3
    email?: string;
    phone?: string;
    password: string;
}

export interface LoginPayload {
    identifier: string;   // email or phone
    password: string;
}

export const authApi = {
    register: (payload: RegisterPayload) =>
        api.post<AuthResponse>('/auth/register', payload),

    login: (payload: LoginPayload) =>
        api.post<AuthResponse>('/auth/login', payload),

    verifyOTP: (userId: string, otp: string, purpose: string) =>
        api.post<{ success: boolean; message: string; data: { user: AuthUser } }>(
            '/auth/verify-otp', { userId, otp, purpose }
        ),

    resendOTP: (userId: string, purpose: string) =>
        api.post<{ success: boolean; message: string }>(
            '/auth/resend-otp', { userId, purpose }
        ),

    forgotPassword: (email: string) =>
        api.post<{ success: boolean; message: string }>(
            '/auth/forgot-password', { email }
        ),

    me: () =>
        api.get<{ success: boolean; data: { user: AuthUser } }>('/auth/me'),

    resetPassword: (token: string, newPassword: string) =>
        api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, newPassword }),

    logout: () =>
        api.post<{ success: boolean; message: string }>('/auth/logout', {}),
};

// ── Zakat Types ───────────────────────────────────────────────────────────────
export interface ZakatAssets {
    cash?: number;
    momo?: number;
    bank?: number;
    goldGrams?: number;
    silverGrams?: number;
    stocks?: number;
    businessInventory?: number;
    tradeGoods?: number;
}

export interface ZakatCalculation {
    _id: string;
    label: string;
    currency: 'GHS' | 'NGN' | 'USD';
    assets: Required<ZakatAssets>;
    deductions: { debts: number };
    totalAssets: number;
    zakatableAmount: number;
    zakatDue: number;
    nisabUsed: number;
    goldPriceUsed: number;
    silverPriceUsed: number;
    isAboveNisab: boolean;
    isPaid: boolean;
    paidAt?: string;
    paidNote?: string;
    zakatYear: string;
    createdAt: string;
    updatedAt: string;
}

export interface ZakatSummary {
    totalCalculations: number;
    totalZakatDue: number;
    totalZakatPaid: number;
    outstandingZakat: number;
    lastCalculation: ZakatCalculation | null;
}

type CalcResponse = { success: boolean; data: { calculation: ZakatCalculation } };
type ListResponse = { success: boolean; data: { calculations: ZakatCalculation[]; pagination: { total: number; page: number; limit: number; pages: number } } };
type SummaryResponse = { success: boolean; data: ZakatSummary };

// ── Zakat API ─────────────────────────────────────────────────────────────────
export const zakatApi = {
    create: (payload: {
        assets: ZakatAssets;
        deductions?: { debts: number };
        currency: string;
        label?: string;
        zakatYear?: string;
    }) => api.post<CalcResponse>('/zakat', payload),

    list: (page = 1, limit = 10) =>
        api.get<ListResponse>(`/zakat?page=${page}&limit=${limit}`),

    get: (id: string) =>
        api.get<CalcResponse>(`/zakat/${id}`),

    update: (id: string, payload: Partial<{
        assets: ZakatAssets;
        deductions: { debts: number };
        currency: string;
        label: string;
        isPaid: boolean;
        paidNote: string;
    }>) => api.patch<CalcResponse>(`/zakat/${id}`, payload),

    delete: (id: string) =>
        api.del<{ success: boolean; message: string }>(`/zakat/${id}`),

    markPaid: (id: string, paidNote?: string) =>
        api.patch<CalcResponse>(`/zakat/${id}/mark-paid`, { paidNote }),

    summary: () =>
        api.get<SummaryResponse>('/zakat/summary'),
};

