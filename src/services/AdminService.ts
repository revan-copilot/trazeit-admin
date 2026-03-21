/**
 * Admin Service
 * Handles admin CRUD operations via ApiService
 */

import apiService from './ApiService';
import adminsData from '../mocks/data/admins.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IAdmin {
    _id: string;
    id?: string;
    name: string; // actual company name field
    companyName?: string; // legacy fallback
    user?: string; // related user record ID
    firstName?: string;
    lastName?: string;
    gender?: string;
    countryCode?: string;
    dob?: string;
    password?: string;
    companyLogo?: string;
    phone?: string;
    email?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    images?: string[];
    location: string | { type: string; coordinates: number[] };
    data?: {
        ownerName?: string;
        phone?: string;
        email?: string;
    };
    contactPerson?: {
        name: string;
        phone: string;
        avatar: string;
    };
    status: 'active' | 'inactive';
}

export interface IAdminListResponse {
    admins: IAdmin[];
    pagination: {
        total: number;
        perPage: number;
        currentPage: number;
        totalPages: number;
    };
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class AdminService {
    private static instance: AdminService;
    private useMock: boolean;
    private mockAdmins: IAdmin[] = [];

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true';
        if (this.useMock) {
            this.mockAdmins = JSON.parse(JSON.stringify(adminsData.admins));
        }
    }

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    async getAdmins(page: number = 1, perPage: number = 12): Promise<IAdminListResponse> {
        if (this.useMock) {
            return {
                admins: this.mockAdmins,
                pagination: adminsData.pagination as any,
            };
        }

        // ApiService.get returns body.data and attaches body.totalCount as __totalCount
        const response = await apiService.get<any>(`/company?page=${page}&perPage=${perPage}`);

        // At this point, response is already the data array or the full response if no data field
        const admins = (Array.isArray(response) ? response : (response?.data || [])) as IAdmin[];
        const total = (response as any)?.__totalCount || admins.length;

        return {
            admins,
            pagination: {
                total,
                perPage,
                currentPage: page,
                totalPages: Math.ceil(total / perPage) || 1
            }
        };
    }

    async getAdminById(id: string): Promise<IAdmin> {
        if (this.useMock) {
            const admin = (adminsData.admins as IAdmin[]).find(a => a.id === id);
            if (!admin) throw new Error(`Admin with id ${id} not found`);
            return admin;
        }
        return apiService.get<IAdmin>(`/company/${id}`);
    }

    async createAdmin(admin: Partial<IAdmin>): Promise<IAdmin> {
        if (this.useMock) {
            return { id: String(Date.now()), ...admin } as IAdmin;
        }
        return apiService.post<IAdmin>('/company', admin);
    }

    async updateAdmin(id: string, admin: Partial<IAdmin>): Promise<IAdmin> {
        if (this.useMock) {
            const index = this.mockAdmins.findIndex(a => a._id === id || (a as any).id === id);
            if (index !== -1) {
                this.mockAdmins[index] = { ...this.mockAdmins[index], ...admin };
                return this.mockAdmins[index];
            }
            return { id, ...admin } as IAdmin;
        }
        return apiService.patch<IAdmin>(`/company/${id}`, admin);
    }

    async deleteAdmin(id: string): Promise<void> {
        if (this.useMock) {
            return;
        }
        return apiService.delete<void>(`/company/${id}`);
    }

    async getUserById(id: string): Promise<any> {
        if (this.useMock) {
            return { _id: id, firstName: 'Mock', lastName: 'User', email: 'mock@user.com' };
        }
        return apiService.get<any>(`/user/${id}`);
    }

    async updateUser(id: string, data: any): Promise<any> {
        if (this.useMock) {
            return { id, ...data };
        }
        return apiService.patch<any>(`/user/${id}`, data);
    }
}

export const adminService = AdminService.getInstance();
export default adminService;
