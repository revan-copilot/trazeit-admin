/**
 * Question Service
 * Handles question operations via ApiService
 */

import apiService from './ApiService';
import questionsData from '../mocks/data/questions.json';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface IQuestion {
    id: string;
    text: string;
    status: 'active' | 'inactive';
}

export interface IQuestionListResponse {
    questions: IQuestion[];
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

class QuestionService {
    private static instance: QuestionService;
    private useMock: boolean;

    private constructor() {
        this.useMock = import.meta.env.VITE_USE_MOCK === 'true' || true;
    }

    public static getInstance(): QuestionService {
        if (!QuestionService.instance) {
            QuestionService.instance = new QuestionService();
        }
        return QuestionService.instance;
    }

    async getQuestions(page: number = 1, perPage: number = 10): Promise<IQuestionListResponse> {
        if (this.useMock) {
            return {
                questions: questionsData.questions as IQuestion[],
                pagination: questionsData.pagination,
            };
        }
        return apiService.get<IQuestionListResponse>(`/questions?page=${page}&perPage=${perPage}`);
    }

    async addQuestions(questions: Omit<IQuestion, 'id' | 'status'>[]): Promise<IQuestion[]> {
        if (this.useMock) {
            return questions.map((q, i) => ({
                ...q,
                id: `mock-${Date.now()}-${i}`,
                status: 'active' as const,
            }));
        }
        return apiService.post<IQuestion[]>('/questions', { questions });
    }

    async deleteQuestion(id: string): Promise<void> {
        if (this.useMock) {
            return;
        }
        return apiService.delete<void>(`/questions/${id}`);
    }
}

export const questionService = QuestionService.getInstance();
export default questionService;
