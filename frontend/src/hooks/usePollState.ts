import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import apiService from '../services/api';
import type { PollStateResponse } from '../services/api';

export const usePollState = (socket: Socket | null) => {
    const [pollState, setPollState] = useState<PollStateResponse>({ status: 'IDLE' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch current poll state (for state recovery)
    const fetchCurrentPoll = useCallback(async () => {
        try {
            setLoading(true);
            const state = await apiService.getCurrentPoll();
            setPollState(state);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching current poll:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchCurrentPoll();
    }, [fetchCurrentPoll]);

    // Listen to socket events for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handlePollStart = (data: any) => {
            setPollState({
                status: 'ACTIVE',
                pollId: data.pollId,
                question: data.question,
                options: data.options,
                startedAt: data.startedAt,
                duration: data.duration,
                serverTime: data.serverTime || new Date().toISOString()
            });
        };

        const handlePollEnd = (data: any) => {
            setPollState({
                status: 'ENDED',
                pollId: data.pollId,
                question: data.question,
                options: data.options,
                resultsRemaining: data.resultsRemaining,
                finalResults: true as any
            });
        };

        const handlePollIdle = () => {
            setPollState({ status: 'IDLE' });
        };

        const handlePollUpdate = (data: any) => {
            if (data.status === 'ACTIVE' || data.status === 'ENDED') {
                setPollState(data as PollStateResponse);
            }
        };

        socket.on('poll:start', handlePollStart);
        socket.on('poll:end', handlePollEnd);
        socket.on('poll:idle', handlePollIdle);
        socket.on('poll:update', handlePollUpdate);

        return () => {
            socket.off('poll:start', handlePollStart);
            socket.off('poll:end', handlePollEnd);
            socket.off('poll:idle', handlePollIdle);
            socket.off('poll:update', handlePollUpdate);
        };
    }, [socket]);

    return {
        pollState,
        loading,
        error,
        refetch: fetchCurrentPoll
    };
};
