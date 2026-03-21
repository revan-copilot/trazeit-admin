/**
 * Company Service
 * Handles company/admin CRUD operations via ApiService
 */

import apiService from './ApiService';
import adminsData from '../mocks/data/admins.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ICompany {
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
    profilePic?: string;
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

export interface ICompanyListResponse {
    companies: ICompany[];
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

class CompanyService {
    private static instance: CompanyService;
    private useMock: boolean;
    private mockCompanies: ICompany[] = [];

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true';
        if (this.useMock) {
            this.mockCompanies = JSON.parse(JSON.stringify(adminsData.admins));
        }
    }

    public static getInstance(): CompanyService {
        if (!CompanyService.instance) {
            CompanyService.instance = new CompanyService();
        }
        return CompanyService.instance;
    }

    async getCompanies(page: number = 1, perPage: number = 12): Promise<ICompanyListResponse> {
        if (this.useMock) {
            return {
                companies: this.mockCompanies,
                pagination: adminsData.pagination as any,
            };
        }

        const response = await apiService.get<any>(`/company?page=${page}&perPage=${perPage}`);

        const companies = (Array.isArray(response) ? response : (response?.data || [])) as ICompany[];
        const total = (response as any)?.__totalCount || companies.length;

        return {
            companies,
            pagination: {
                total,
                perPage,
                currentPage: page,
                totalPages: Math.ceil(total / perPage) || 1
            }
        };
    }

    async getCompanyById(id: string): Promise<ICompany> {
        if (this.useMock) {
            const company = (adminsData.admins as ICompany[]).find(a => a.id === id);
            if (!company) throw new Error(`Company with id ${id} not found`);
            return company;
        }
        return apiService.get<ICompany>(`/company/${id}`);
    }

    async createCompany(company: Partial<ICompany>): Promise<ICompany> {
        if (this.useMock) {
            return { id: String(Date.now()), ...company } as ICompany;
        }
        return apiService.post<ICompany>('/company', company);
    }

    async updateCompany(id: string, company: Partial<ICompany>): Promise<ICompany> {
        if (this.useMock) {
            const index = this.mockCompanies.findIndex(a => a._id === id || (a as any).id === id);
            if (index !== -1) {
                this.mockCompanies[index] = { ...this.mockCompanies[index], ...company };
                return this.mockCompanies[index];
            }
            return { id, ...company } as ICompany;
        }
        return apiService.patch<ICompany>(`/company/${id}`, company);
    }

    async deleteCompany(id: string): Promise<void> {
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
    async getAssignedProducts(companyId: string, page: number = 1, perPage: number = 10): Promise<{ data: any[], pagination: { total: number, totalPages: number, currentPage: number, perPage: number } }> {
        if (this.useMock) {
            return { data: [], pagination: { total: 0, totalPages: 0, currentPage: page, perPage } };
        }
        const response = await apiService.get<any>(`/product-assigned-steps?filters=company|${companyId}&page=${page}&perPage=${perPage}`);

        const data = response?.data || response || [];
        const total = (response as any)?.__totalCount || (Array.isArray(data) ? data.length : 0);

        return {
            data: Array.isArray(data) ? data : [],
            pagination: {
                total,
                perPage,
                currentPage: page,
                totalPages: Math.ceil(total / perPage) || 1
            }
        };
    }

    async updateAssignedProduct(id: string, data: any): Promise<any> {
        if (this.useMock) {
            return { id, ...data };
        }
        return apiService.patch<any>(`/product-assigned-steps/${id}`, data);
    }

    async assignProduct(data: any): Promise<any> {
        if (this.useMock) {
            return { id: `mock-assign-${Date.now()}`, ...data };
        }
        return apiService.post<any>('/product-assigned-steps', data);
    }
}



export const companyService = CompanyService.getInstance();
export default companyService;
