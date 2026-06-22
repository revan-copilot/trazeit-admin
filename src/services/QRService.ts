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
    product?: IProduct;
    company?: ICompany;
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
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                _id: id,
                batchNo: "2025/OCT/24/9",
                user: {
                    _id: "68cd3c33a34a5a9f32b05258",
                    firstName: "Elangovan",
                    lastName: "Manoharan",
                    profilePic: "https://trazeit-images.s3.ap-southeast-2.amazonaws.com/profilepic.jpeg",
                    phone: "9159041421"
                },
                property: {
                    _id: "68d54123f6a0a0ec3ac7b258",
                    name: "Valparai Organic Farm",
                    address1: "789 Plantation Avenue",
                    city: "Valparai",
                    state: "Tamil Nadu",
                    country: "India",
                    postalCode: "642127",
                    images: ["https://images.unsplash.com/photo-1597113366853-91f9170023f2?w=800"],
                    data: {
                        Size: "25 Acres"
                    }
                },
                product: {
                    _id: "68d52b53a9826d8f12333ba9",
                    name: "Tea Processing",
                    description: "Tea Power processing",
                    images: ["https://trazeit-images.s3.ap-southeast-2.amazonaws.com/pr2.jpg"]
                },
                company: {
                    _id: "68d53123f6a0a0ec3ac7b277",
                    name: "Trazeit Tea Estates",
                    address1: "456 Corporate Bypass Rd",
                    city: "Coimbatore",
                    state: "Tamil Nadu",
                    country: "India",
                    postalCode: "641001",
                    data: {
                        ownerName: "Rajesh Kumar"
                    }
                },
                status: "active",
                start: "2025-10-24T08:00:00.000Z",
                end: "2025-10-31T17:00:00.000Z",
                createdBy: {
                    _id: "68cd3c33a34a5a9f32b05258",
                    firstName: "Elangovan",
                    lastName: "Manoharan",
                    profilePic: "https://trazeit-images.s3.ap-southeast-2.amazonaws.com/profilepic.jpeg",
                    phone: "9159041421"
                },
                createdAt: "2025-10-24T08:00:00.000Z",
                updatedAt: "2025-10-31T13:24:33.658Z",
                steps: [
                    {
                        _id: "step1",
                        company: {
                            _id: "68d53123f6a0a0ec3ac7b277",
                            name: "Trazeit Tea Estates",
                            address1: "456 Corporate Bypass Rd",
                            city: "Coimbatore",
                            state: "Tamil Nadu",
                            country: "India",
                            postalCode: "641001"
                        },
                        step: {
                            _id: "s1",
                            title: "Tea Harvesting",
                            description: "Fresh green tea leaves are harvested early in the morning."
                        },
                        product: {
                            _id: "68d52b53a9826d8f12333ba9",
                            name: "Tea Processing",
                            description: "Tea Power processing",
                            images: []
                        },
                        createdAt: "2025-10-24T10:00:00.000Z",
                        updatedAt: "2025-10-24T10:00:00.000Z",
                        activity: {
                            _id: "act1",
                            title: "Harvest Session",
                            description: "Harvested batch 6 tea leaves.",
                            status: "completed",
                            images: ["https://images.unsplash.com/photo-1597113366853-91f9170023f2?w=800"],
                            datetime: "2025-10-24T10:00:00.000Z",
                            createdBy: {
                                _id: "68cd3c33a34a5a9f32b05258",
                                firstName: "Elangovan",
                                lastName: "Manoharan",
                                profilePic: "https://trazeit-images.s3.ap-southeast-2.amazonaws.com/profilepic.jpeg",
                                phone: "9159041421"
                            },
                            inputs: [
                                { label: "Plucking Quality", type: "textbox", value: "Excellent" },
                                { label: "Leaf Temperature (°C)", type: "textbox", value: "22" },
                                { label: "Harvest Date", type: "date", value: "2025-10-24" }
                            ]
                        }
                    },
                    {
                        _id: "step2",
                        company: {
                            _id: "68d53123f6a0a0ec3ac7b277",
                            name: "Trazeit Tea Estates",
                            address1: "456 Corporate Bypass Rd",
                            city: "Coimbatore",
                            state: "Tamil Nadu",
                            country: "India",
                            postalCode: "641001"
                        },
                        step: {
                            _id: "s2",
                            title: "Leaf Cleaning & Sorting",
                            description: "Leaves are sorted and cleaned to remove impurities."
                        },
                        product: {
                            _id: "68d52b53a9826d8f12333ba9",
                            name: "Tea Processing",
                            description: "Tea Power processing",
                            images: []
                        },
                        createdAt: "2025-10-25T11:00:00.000Z",
                        updatedAt: "2025-10-25T11:00:00.000Z",
                        activity: {
                            _id: "act2",
                            title: "Sorting Session",
                            description: "Sorted leaves to filter out damaged pieces.",
                            status: "completed",
                            images: [],
                            datetime: "2025-10-25T11:00:00.000Z",
                            createdBy: {
                                _id: "68cd3c33a34a5a9f32b05258",
                                firstName: "Elangovan",
                                lastName: "Manoharan",
                                profilePic: "https://trazeit-images.s3.ap-southeast-2.amazonaws.com/profilepic.jpeg",
                                phone: "9159041421"
                            },
                            inputs: [
                                { label: "Rejected Percentage", type: "textbox", value: "2.5%" },
                                { label: "Sorting Method", type: "textbox", value: "Manual and Optical Sorting" }
                            ]
                        }
                    }
                ]
            };
        }
        return apiService.get<IBatchDetail>(`/batch/${id}`);
    }

    async getBatches(): Promise<IBatch[]> {
        const response = await apiService.get<any>('/batch');
        return Array.isArray(response) ? response : (response?.data || []);
    }

    async createQR(data: {
        batch: string;
        product: string;
        company: string;
        label: string;
        title: string;
        description: string;
        quantity: number;
        data: { secret: string };
    }): Promise<IQRCode> {
        return apiService.post<IQRCode>('/product-qr', data);
    }
}

export const qrService = QRService.getInstance();
export default qrService;
