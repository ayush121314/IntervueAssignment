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

        // Poll started
        socket.on('poll:start', (data: any) => {
            setPollState({
                status: 'ACTIVE',
                pollId: data.pollId,
                question: data.question,
                options: data.options,
                startedAt: data.startedAt,
                duration: data.duration,
                serverTime: data.serverTime || new Date().toISOString()
            });
        });

        // Poll ended
        socket.on('poll:end', (data: any) => {
            setPollState({
                status: 'ENDED',
                pollId: data.pollId,
                question: data.question,
                options: data.options,
                resultsRemaining: data.resultsRemaining,
                finalResults: true as any
            });
        });

        // Poll idle (results window over)
        socket.on('poll:idle', () => {
            setPollState({ status: 'IDLE' });
        });

        // Poll updated (live vote counts)
        socket.on('poll:update', (data: any) => {
            if (data.status === 'ACTIVE' || data.status === 'ENDED') {
                setPollState(data as PollStateResponse);
            }
        });

        return () => {
            socket.off('poll:start');
            socket.off('poll:end');
            socket.off('poll:idle');
            socket.off('poll:update');
        };
    }, [socket]);

    return {
        pollState,
        loading,
        error,
        refetch: fetchCurrentPoll
    };
};
