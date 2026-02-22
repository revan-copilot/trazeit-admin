/**
 * Auth Context — Global Authentication State Management
 *
 * Provides:
 *  - Current user state (IAuthUser)
 *  - Login / Logout actions
 *  - Authentication status checks
 *  - Automatic hydration from localStorage on mount
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import apiService from '../services/ApiService';

// ──────────────────────────────────────────────
// Types (aligned to API response)
// ──────────────────────────────────────────────

export interface IAuthUser {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    countryCode: number;
    profilePic: string;
    userType: string[];  // e.g. ['super_admin']
    accessToken: string;
}

export interface ILoginPayload {
    countryCode: number;
    phone: number;
    password: string;
}

interface AuthContextState {
    user: IAuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: ILoginPayload) => Promise<void>;
    logout: () => void;
    updateUser: (partial: Partial<IAuthUser>) => void;
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

const AuthContext = createContext<AuthContextState | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IAuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const storedUser = apiService.getStoredUser<IAuthUser>();
        const token = apiService.getToken();

        if (storedUser && token) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    // ── Login ──────────────────────────────────

    const login = useCallback(async (payload: ILoginPayload): Promise<void> => {
        // Call real API
        const data = await apiService.post<IAuthUser>('/user/login', payload);

        // Persist token + user
        apiService.setToken(data.accessToken);
        apiService.setStoredUser(data);
        setUser(data);
    }, []);

    // ── Logout ─────────────────────────────────

    const logout = useCallback((): void => {
        apiService.clearSession();
        setUser(null);
    }, []);

    // ── Partial Update (e.g. profile edits) ────

    const updateUser = useCallback((partial: Partial<IAuthUser>): void => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...partial };
            apiService.setStoredUser(updated);
            return updated;
        });
    }, []);

    // ── Memoised value ─────────────────────────

    const value = useMemo<AuthContextState>(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
    }), [user, isLoading, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export const useAuth = (): AuthContextState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
