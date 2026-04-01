/**
 * ApiService — Centralized HTTP Client (Singleton)
 *
 * Features:
 *  - Configurable base URL via env or default
 *  - Automatic Bearer token injection
 *  - Structured error handling with typed ApiError
 *  - 401 auto-logout with redirect
 *  - Request/response logging in development
 *  - Timeout support
 */

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    statusCode: number;
    status: string;
    message: string;
    data: T;
    totalCount?: number;
}

export class ApiError extends Error {
    public statusCode: number;
    public status: string;
    public data: unknown;

    constructor(statusCode: number, message: string, status: string = 'error', data: unknown = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.status = status;
        this.data = data;
    }
}

interface RequestConfig extends RequestInit {
    timeout?: number;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://d9e2-13-200-246-65.ngrok-free.app';
const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// ──────────────────────────────────────────────
// ApiService Class
// ──────────────────────────────────────────────

class ApiService {
    private static instance: ApiService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE_URL;
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // ── Token Management ───────────────────────

    public getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    public setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    public removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    }

    public getStoredUser<T = unknown>(): T | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    public setStoredUser<T>(user: T): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public clearSession(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // ── Private Helpers ────────────────────────

    private buildUrl(endpoint: string): string {
        // Avoid double slashes
        const base = this.baseUrl.replace(/\/+$/, '');
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${path}`;
    }

    private getHeaders(customHeaders?: HeadersInit): Headers {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(customHeaders as Record<string, string> || {}),
        });

        const token = this.getToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const { timeout = DEFAULT_TIMEOUT, headers: customHeaders, ...restConfig } = config;
        const url = this.buildUrl(endpoint);

        // AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            if (import.meta.env.DEV) {
                console.log(`[API] ${config.method || 'GET'} ${url}`);
            }

            const response = await fetch(url, {
                ...restConfig,
                headers: this.getHeaders(customHeaders),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle 401 — auto-logout
            if (response.status === 401) {
                this.clearSession();
                window.location.href = '/trazeit-admin/login';
                throw new ApiError(401, 'Session expired. Please login again.', 'unauthorized');
            }

            // Parse response body
            let body: ApiResponse<T> | null = null;
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                body = await response.json();
            }

            // Handle non-OK responses
            if (!response.ok) {
                const message = body?.message || `Request failed with status ${response.status}`;
                throw new ApiError(response.status, message, body?.status || 'error', body?.data);
            }

            // Return the `data` field from the API envelope
            if (body && body.data !== undefined) {
                // Attach totalCount as a non-enumerable property if present
                const result = body.data;
                if (body.totalCount !== undefined && typeof result === 'object' && result !== null) {
                    Object.defineProperty(result, '__totalCount', {
                        value: body.totalCount,
                        writable: false,
                        enumerable: false,
                        configurable: true,
                    });
                }
                return result;
            }

            // Fallback: return entire body
            return body as unknown as T;

        } catch (error: unknown) {
            clearTimeout(timeoutId);

            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new ApiError(408, 'Request timed out', 'timeout');
            }

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new ApiError(0, 'Network error. Please check your connection.', 'network_error');
            }

            throw new ApiError(500, error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    }

    // ── Public HTTP Methods ────────────────────

    public async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    public async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    public async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    public async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

// ── Singleton Export ────────────────────────────

export const apiService = ApiService.getInstance();
export default apiService;
