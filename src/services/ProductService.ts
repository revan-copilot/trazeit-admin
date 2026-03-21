/**
 * Product Service
 * Handles product CRUD operations via ApiService
 *
 * Supports both mock data and real API calls via USE_MOCK flag.
 */

import apiService from './ApiService';
import productsData from '../mocks/data/products.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IProductStepInput {
    id?: string;
    label: string;

    type: 'textbox' | 'radio' | 'checkbox' | 'select' | 'date' | 'textarea' | 'files';
    options?: string[];
}

export interface IProductStep {
    id: string;
    product: any; // Can be ID or object
    title: string;
    description: string;
    order: number;
    inputs: IProductStepInput[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IProduct {
    id: string;
    name: string;
    description?: string;
    image: string;
    images?: string[];
    isPublic?: boolean;
    totalSteps: number;
    type: string;
    userType?: string;
    status: 'ACTIVE' | 'INACTIVE';
    order?: number;
}

export interface IProductListResponse {
    products: IProduct[];
}

export interface IProductStepListResponse {
    steps: IProductStep[];
    pagination: {
        total: number;
        totalPages: number;
    };
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class ProductService {
    private static instance: ProductService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true';
    }

    public static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }

    async getProducts(): Promise<IProductListResponse> {
        if (this.useMock) {
            return this.getMockProducts();
        }
        const response = await apiService.get<any>('/product');
        let products: IProduct[] = [];

        if (Array.isArray(response)) {
            products = response;
        } else if (response && Array.isArray(response.products)) {
            products = response.products;
        }

        const normalizedProducts = products.map(p => ({
            ...p,
            id: p.id || (p as any)._id,
            image: p.image || (p.images && p.images.length > 0 ? p.images[0] : '')
        }));

        return { products: normalizedProducts };
    }

    async getProductById(id: string): Promise<IProduct> {
        if (this.useMock) {
            const product = (productsData.products as IProduct[]).find(p => p.id === id);
            if (!product) throw new Error(`Product with id ${id} not found`);
            return product;
        }
        const response = await apiService.get<any>(`/product/${id}`);
        // Handle { statusCode: 200, status: 'success', data: ... }
        const product = response?.data || response;
        return {
            ...product,
            id: product.id || product._id,
            image: product.image || (product.images && product.images.length > 0 ? product.images[0] : '')
        };
    }

    async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        if (this.useMock) {
            return { id: `mock-${Date.now()}`, ...data } as IProduct;
        }
        return apiService.post<IProduct>('/product', data);
    }

    async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
        if (this.useMock) {
            return { id, ...data } as IProduct;
        }
        return apiService.patch<IProduct>(`/product/${id}`, data);
    }

    async deleteProduct(id: string): Promise<void> {
        if (this.useMock) {
            return;
        }
        return apiService.delete<void>(`/product/${id}`);
    }

    // ── Step Management ───────────────────────

    async getStepsByProductId(productId: string, page: number = 1, limit: number = 100): Promise<IProductStepListResponse> {
        if (this.useMock) {
            return { steps: [], pagination: { total: 0, totalPages: 1 } };
        }
        // Requirement: /product-admin-steps?filters=product|{productId}
        const response = await apiService.get<any>(`/product-admin-steps?filters=product|${productId}&page=${page}&limit=${limit}`);
        
        // ApiService already returns response.data
        // If the API returns the array directly in data:
        const stepsArray = Array.isArray(response) ? response : (response?.data || []);
        const totalCount = (response as any).__totalCount || stepsArray.length;

        const normalizedSteps = stepsArray.map((step: any) => ({
            ...step,
            id: step.id || step._id,
            product: typeof step.product === 'object' ? (step.product.id || step.product._id) : step.product,
            inputs: step.inputs || []
        }));

        return {
            steps: normalizedSteps,
            pagination: {
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }


    async getStepById(id: string): Promise<IProductStep> {
        if (this.useMock) {
            throw new Error('Not implemented for mock');
        }
        const response = await apiService.get<any>(`/product-admin-steps/${id}`);
        const step = response?.data || response;
        return {
            ...step,
            id: step.id || step._id,
            product: typeof step.product === 'object' ? (step.product.id || step.product._id) : step.product,
            inputs: step.inputs || []
        };
    }

    async addStep(data: Partial<IProductStep>): Promise<IProductStep> {

        if (this.useMock) {
            return { id: `step-${Date.now()}`, ...data } as IProductStep;
        }
        return apiService.post<IProductStep>('/product-admin-steps', data);
    }

    async updateStep(id: string, data: Partial<IProductStep>): Promise<IProductStep> {
        if (this.useMock) {
            return { id, ...data } as IProductStep;
        }
        return apiService.patch<IProductStep>(`/product-admin-steps/${id}`, data);
    }



    async saveAdminStep(data: any): Promise<any> {
        if (this.useMock) {
            return { ...data, id: `mock-${Date.now()}` };
        }
        // If data has ID, it's an update, else it's a create
        if (data.id || data._id) {
            return apiService.patch<any>(`/product-admin-steps/${data.id || data._id}`, data);
        }
        return apiService.post<any>('/product-admin-steps', data);
    }

    // ── Mock Helpers ───────────────────────────

    private async getMockProducts(): Promise<IProductListResponse> {
        return {
            products: productsData.products as IProduct[],
        };
    }
}

export const productService = ProductService.getInstance();
export default productService;
