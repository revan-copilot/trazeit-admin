/**
 * QR Service
 * Handles QR code management operations via ApiService
 */

import apiService from './ApiService';
import mockData from '../mocks/data/qr-management.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IBatch {
    _id: string;
    batchNo: string;
}

export interface IProduct {
    _id: string;
    name: string;
    description: string;
    images: string[];
}

export interface ICreator {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
    phone: string;
}

export interface IQRCode {
    _id: string;
    id?: string; // for compatibility with legacy components if needed
    batch?: IBatch;
    product: IProduct[];
    status: string;
    title: string;
    description: string;
    createdBy: ICreator;
    data?: {
        secret?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IProperty {
    _id: string;
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    images?: string[];
    location?: {
        type: string;
        coordinates: number[];
    };
    data?: {
        Size?: string;
        [key: string]: any;
    };
}

export interface ICompany {
    _id: string;
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    images?: string[];
    location?: {
        type: string;
        coordinates: number[];
    };
    data?: {
        ownerName?: string;
        [key: string]: any;
    };
}

export interface IInputDetail {
    label: string;
    type: string;
    value: any;
}

export interface IActivityDetail {
    _id: string;
    step?: {
        _id: string;
        title: string;
        description: string;
    };
    data?: Record<string, any>;
    status: string;
    title: string;
    description: string;
    images: string[];
    datetime?: string;
    createdBy?: ICreator;
    inputs?: IInputDetail[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IStepDetail {
    _id: string;
    company: ICompany;
    step: {
        _id: string;
        title: string;
        description: string;
    };
    product: IProduct;
    createdAt: string;
    updatedAt: string;
    activity?: IActivityDetail;
}

export interface IBatchDetail {
    _id: string;
    batchNo: string;
    user: ICreator;
    property: IProperty;
    product: IProduct;
    company: ICompany;
    linkedBaches?: any[];
    status: string;
    start: string;
    end: string;
    createdBy: ICreator;
    createdAt: string;
    updatedAt: string;
    steps: IStepDetail[];
}

export interface IQRListResponse {
    statusCode: number;
    status: string;
    message: string;
    data: IQRCode[];
    totalCount: number;
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class QRService {
    private static instance: QRService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true';
    }

    public static getInstance(): QRService {
        if (!QRService.instance) {
            QRService.instance = new QRService();
        }
        return QRService.instance;
    }

    /**
     * Fetch the list of QR activities/batches.
     * Endpoint: /product-qr?filters=status|active
     */
    async getQRScans(): Promise<IQRListResponse> {
        if (this.useMock) {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockData as unknown as IQRListResponse;
        }
        
        // ApiService.get returns response.data and attaches totalCount
        const response = await apiService.get<IQRCode[]>('/product-qr?filters=status|active');
        const totalCount = (response as any).__totalCount || (Array.isArray(response) ? response.length : 0);

        return {
            statusCode: 200,
            status: 'success',
            message: 'Batch Activity List',
            data: Array.isArray(response) ? response : [],
            totalCount
        };
    }

    async getQRById(id: string): Promise<IQRCode | undefined> {
        if (this.useMock) {
            const item = (mockData.data as IQRCode[]).find((q) => q._id === id);
            return item;
        }
        return apiService.get<IQRCode>(`/product-qr/${id}`);
    }

    async getBatchById(id: string): Promise<IBatchDetail | undefined> {
        return apiService.get<IBatchDetail>(`/batch/${id}`);
    }
}

export const qrService = QRService.getInstance();
export default qrService;
