import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export type PollStateResponse = {
    status: 'IDLE' | 'ACTIVE' | 'ENDED';
    pollId?: string;
    question?: string;
    options?: Array<{ id: string; text: string; voteCount: number; isCorrect: boolean }>;
    startedAt?: string;
    duration?: number;
    serverTime?: string;
    finalResults?: boolean;
}

export type CreatePollData = {
    question: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    duration: number;
}

export type PollHistoryItem = {
    id: string;
    question: string;
    options: Array<{ id: string; text: string; voteCount: number; isCorrect: boolean }>;
    duration: number;
    startedAt: string;
    endedAt?: string;
    status: string;
}

class ApiService {
    async getCurrentPoll(): Promise<PollStateResponse> {
        const response = await api.get<PollStateResponse>('/poll/current');
        return response.data;
    }

    async createPoll(data: CreatePollData): Promise<any> {
        const response = await api.post('/poll', data);
        return response.data;
    }

    async submitVote(pollId: string, studentId: string, optionId: string): Promise<any> {
        const response = await api.post(`/poll/${pollId}/vote`, {
            studentId,
            optionId
        });
        return response.data;
    }

    async checkVoteStatus(pollId: string, studentId: string): Promise<any> {
        const response = await api.get(`/poll/${pollId}/vote/status`, {
            params: { studentId }
        });
        return response.data;
    }

    async getPollHistory(): Promise<PollHistoryItem[]> {
        const response = await api.get<PollHistoryItem[]>('/poll/history');
        return response.data;
    }
}

export default new ApiService();
