/**
 * Base Service Class
 * Abstract class for all API services with mock data toggle
 */

export interface IBaseService {
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: unknown): Promise<T>;
    put<T>(endpoint: string, data: unknown): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}

export abstract class BaseService implements IBaseService {
    protected baseUrl: string;
    protected useMock: boolean;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
        // Toggle between mock and real API - can be controlled via environment variable
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
    }

    /**
     * Simulates network latency for mock data
     */
    protected async simulateDelay(ms: number = 300): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generic GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        if (this.useMock) {
            return this.getMockData<T>(endpoint);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Generic POST request
     */
    async post<T>(endpoint: string, data: unknown): Promise<T> {
        if (this.useMock) {
            return this.postMockData<T>(endpoint, data);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Generic PUT request
     */
    async put<T>(endpoint: string, data: unknown): Promise<T> {
        if (this.useMock) {
            return this.putMockData<T>(endpoint, data);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Generic DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        if (this.useMock) {
            return this.deleteMockData<T>(endpoint);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Get default headers
     */
    protected getHeaders(): HeadersInit {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    /**
     * Handle API response
     */
    protected async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Abstract methods for mock data - to be implemented by subclasses
     */
    protected abstract getMockData<T>(endpoint: string): Promise<T>;
    protected abstract postMockData<T>(endpoint: string, data: unknown): Promise<T>;
    protected abstract putMockData<T>(endpoint: string, data: unknown): Promise<T>;
    protected abstract deleteMockData<T>(endpoint: string): Promise<T>;
}

export default BaseService;
