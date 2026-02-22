/**
 * QR Service
 * Handles QR code management operations via ApiService
 */

import apiService from './ApiService';
import mockData from '../mocks/data/qr-management.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IGrade {
    text: string;
    type: 'green' | 'blue' | 'orange';
}

export interface IQRCode {
    id: string;
    productName: string;
    qrCode: string;
    batch: string;
    scans: number;
    grades: IGrade[];
    location: {
        company: string;
        address: string;
    };
}

export interface IQRListResponse {
    qr_scans: IQRCode[];
}

// ──────────────────────────────────────────────
// Service Class
// ──────────────────────────────────────────────

class QRService {
    private static instance: QRService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
    }

    public static getInstance(): QRService {
        if (!QRService.instance) {
            QRService.instance = new QRService();
        }
        return QRService.instance;
    }

    async getQRScans(): Promise<IQRListResponse> {
        if (this.useMock) {
            return mockData as unknown as IQRListResponse;
        }
        return apiService.get<IQRListResponse>('/qr-management');
    }

    async getQRById(id: string): Promise<IQRCode | undefined> {
        if (this.useMock) {
            const item = mockData.qr_scans.find((q: any) => q.id === id);
            return item as unknown as IQRCode | undefined;
        }
        return apiService.get<IQRCode>(`/qr-management/${id}`);
    }
}

export const qrService = QRService.getInstance();
export default qrService;
