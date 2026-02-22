/**
 * Authentication Service
 *
 * Thin wrapper around ApiService for auth-specific endpoints.
 * The main auth state management lives in AuthContext.
 * This service is kept for any future auth-specific API calls
 * (e.g. forgot password, refresh token, verify OTP).
 */

import apiService, { ApiError } from './ApiService';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ILoginRequest {
    countryCode: number;
    phone: number;
    password: string;
}

export interface ILoginResponseData {
    phone: number;
    accessToken: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: number;
    profilePic: string;
    userId: string;
    userType: string[];
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Login user via API
     */
    async login(credentials: ILoginRequest): Promise<ILoginResponseData> {
        return apiService.post<ILoginResponseData>('/user/login', credentials);
    }

    /**
     * Logout — clear local session
     */
    logout(): void {
        apiService.clearSession();
    }

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean {
        return apiService.isAuthenticated();
    }

    /**
     * Get the stored user from localStorage
     */
    getStoredUser(): ILoginResponseData | null {
        return apiService.getStoredUser<ILoginResponseData>();
    }
}

export { ApiError };
export const authService = AuthService.getInstance();
export default authService;
