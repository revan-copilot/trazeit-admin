/**
 * Profile Service
 * Handles user profile operations via ApiService
 *
 * Note: For basic user data display, prefer using AuthContext directly.
 * This service is for profile-specific API operations (e.g. update profile on server).
 */

import apiService from './ApiService';
import userProfileData from '../mocks/data/user-profile.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IUserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    avatar: string;
    coverImage: string | null;
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class ProfileService {
    private static instance: ProfileService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
    }

    public static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    async getProfile(): Promise<IUserProfile> {
        if (this.useMock) {
            return userProfileData as unknown as IUserProfile;
        }
        return apiService.get<IUserProfile>('/profile/me');
    }

    async updateProfile(data: Partial<IUserProfile>): Promise<IUserProfile> {
        if (this.useMock) {
            return { ...userProfileData, ...data } as unknown as IUserProfile;
        }
        return apiService.put<IUserProfile>('/profile/me', data);
    }
}

export const profileService = ProfileService.getInstance();
export default profileService;
