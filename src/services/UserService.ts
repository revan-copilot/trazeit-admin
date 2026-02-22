/**
 * User Service
 * 
 * Single API: GET /user
 * Both Admin Management and User Management use this endpoint.
 * Client-side filtering by userType determines which tab shows what.
 *
 * Query params:
 *   filters   – pipe-separated key|value pairs, e.g. "status|active"
 *   page      – 1-indexed page number
 *   limit     – items per page
 *   sort      – field|direction, e.g. "createdAt|ASC"
 *   textSearch – free-text search
 *   from / to – date range (ISO date strings)
 */

import apiService from './ApiService';

// ──────────────────────────────────────────────
// Types — matches real API response shape
// ──────────────────────────────────────────────

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic: string;
    countryCode: number;
    phone: string;
    phoneVerified: boolean;
    userType: string[];
    status: 'active' | 'inactive';
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    gender: string;
    dob: string;
    isDeleted: boolean;
    company?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUserApiResponse {
    statusCode: number;
    status: string;
    message: string;
    data: IUser[];
    totalCount: number;
}

export interface IUserListResult {
    users: IUser[];
    totalCount: number;
    page: number;
    limit: number;
}

// ──────────────────────────────────────────────
// Query Builder
// ──────────────────────────────────────────────

export interface IUserQueryParams {
    page?: number;
    limit?: number;
    sort?: string;        // e.g. "createdAt|ASC"
    textSearch?: string;
    status?: string;       // e.g. "active"
    from?: string;         // ISO date "2025-09-09"
    to?: string;           // ISO date "2025-09-30"
}

function buildQueryString(params: IUserQueryParams): string {
    const searchParams = new URLSearchParams();

    // Filters (pipe-separated)
    if (params.status) {
        searchParams.set('filters', `status|${params.status}`);
    }

    searchParams.set('page', String(params.page ?? 1));
    searchParams.set('limit', String(params.limit ?? 10));
    searchParams.set('sort', params.sort ?? 'createdAt|ASC');
    searchParams.set('textSearch', params.textSearch ?? '');

    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);

    return searchParams.toString();
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class UserService {
    private static instance: UserService;

    private constructor() { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Fetch users from the real API.
     * 
     * ApiService auto-unwraps `body.data`, so `get<IUser[]>()` returns the user array directly.
     * `totalCount` is attached as a hidden `__totalCount` property by ApiService.
     */
    async fetchUsers(params: IUserQueryParams = {}): Promise<IUserListResult> {
        const qs = buildQueryString(params);
        const rawUsers = await apiService.get<IUser[]>(`/user?${qs}`);

        // totalCount is attached as a non-enumerable property by ApiService
        const totalCount = (rawUsers as unknown as { __totalCount?: number }).__totalCount ?? rawUsers.length;

        // Exclude users without a valid userType
        const users = rawUsers.filter(u => Array.isArray(u.userType) && u.userType.length > 0);

        return {
            users,
            totalCount,
            page: params.page ?? 1,
            limit: params.limit ?? 10,
        };
    }

    /**
     * Get admin users only (userType includes "admin").
     * Fetches from the same /user endpoint, then filters client-side.
     */
    async getAdminUsers(params: IUserQueryParams = {}): Promise<IUserListResult> {
        const result = await this.fetchUsers(params);
        const admins = result.users.filter(u =>
            u.userType.includes('admin')
        );

        return {
            ...result,
            users: admins,
            totalCount: admins.length,
        };
    }

    /**
     * Get non-admin users (userType does NOT include "admin" or "super_admin").
     * Fetches from the same /user endpoint, then filters client-side.
     */
    async getNonAdminUsers(params: IUserQueryParams = {}): Promise<IUserListResult> {
        const result = await this.fetchUsers(params);
        const users = result.users.filter(u =>
            !u.userType.includes('admin') && !u.userType.includes('super_admin')
        );

        return {
            ...result,
            users: users,
            totalCount: users.length,
        };
    }

    /**
     * Create a user via API
     */
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const response = await apiService.post<{ data: IUser }>('/user', data);
        return response.data;
    }

    /**
     * Update a user via API
     */
    async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
        const response = await apiService.put<{ data: IUser }>(`/user/${id}`, data);
        return response.data;
    }

    /**
     * Delete a user via API
     */
    async deleteUser(id: string): Promise<void> {
        await apiService.delete<void>(`/user/${id}`);
    }
}

export const userService = UserService.getInstance();
export default userService;
