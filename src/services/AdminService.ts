/**
 * Admin Service
 * Handles admin CRUD operations via ApiService
 */

import apiService from './ApiService';
import adminsData from '../mocks/data/admins.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IContactPerson {
    name: string;
    phone: string;
    avatar: string;
}

export interface IAdmin {
    id: string;
    companyName: string;
    companyLogo: string;
    phone: string;
    email: string;
    location: string;
    contactPerson: IContactPerson;
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

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
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
                admins: adminsData.admins as IAdmin[],
                pagination: adminsData.pagination,
            };
        }
        return apiService.get<IAdminListResponse>(`/admins?page=${page}&perPage=${perPage}`);
    }

    async getAdminById(id: string): Promise<IAdmin> {
        if (this.useMock) {
            const admin = (adminsData.admins as IAdmin[]).find(a => a.id === id);
            if (!admin) throw new Error(`Admin with id ${id} not found`);
            return admin;
        }
        return apiService.get<IAdmin>(`/admins/${id}`);
    }

    async createAdmin(admin: Partial<IAdmin>): Promise<IAdmin> {
        if (this.useMock) {
            return { id: String(Date.now()), ...admin } as IAdmin;
        }
        return apiService.post<IAdmin>('/admins', admin);
    }

    async updateAdmin(id: string, admin: Partial<IAdmin>): Promise<IAdmin> {
        if (this.useMock) {
            return { id, ...admin } as IAdmin;
        }
        return apiService.put<IAdmin>(`/admins/${id}`, admin);
    }

    async deleteAdmin(id: string): Promise<void> {
        if (this.useMock) {
            return;
        }
        return apiService.delete<void>(`/admins/${id}`);
    }
}

export const adminService = AdminService.getInstance();
export default adminService;
