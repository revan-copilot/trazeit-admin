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

export interface IProductStep {
    name: string;
    quantity: string;
}

export interface IProduct {
    id: string;
    name: string;
    image: string;
    steps: IProductStep[];
    totalSteps: number;
    type: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface IProductListResponse {
    products: IProduct[];
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class ProductService {
    private static instance: ProductService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
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
        return apiService.get<IProductListResponse>('/products');
    }

    async getProductById(id: string): Promise<IProduct> {
        if (this.useMock) {
            const product = (productsData.products as IProduct[]).find(p => p.id === id);
            if (!product) throw new Error(`Product with id ${id} not found`);
            return product;
        }
        return apiService.get<IProduct>(`/products/${id}`);
    }

    async createProduct(data: Partial<IProduct>): Promise<IProduct> {
        if (this.useMock) {
            return { id: `mock-${Date.now()}`, ...data } as IProduct;
        }
        return apiService.post<IProduct>('/products', data);
    }

    async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
        if (this.useMock) {
            return { id, ...data } as IProduct;
        }
        return apiService.put<IProduct>(`/products/${id}`, data);
    }

    async deleteProduct(id: string): Promise<void> {
        if (this.useMock) {
            return;
        }
        return apiService.delete<void>(`/products/${id}`);
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
