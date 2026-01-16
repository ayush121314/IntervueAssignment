import { useState, useEffect } from 'react';

interface UsePollTimerProps {
    startedAt: string | null;
    duration: number;
    serverTime?: string;
}

export const usePollTimer = ({ startedAt, duration, serverTime }: UsePollTimerProps) => {
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!startedAt) {
            setRemainingTime(0);
            setIsExpired(false);
            return;
        }

        const startTime = new Date(startedAt).getTime();
        const durationMs = duration * 1000;

        // Calculate initial offset once when startedAt or serverTime changes significantly
        const serverNow = serverTime ? new Date(serverTime).getTime() : Date.now();
        const clientNow = Date.now();
        const clockOffset = clientNow - serverNow;

        const updateTimer = () => {
            const now = Date.now() - clockOffset;
            const elapsed = now - startTime;
            const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));

            setRemainingTime(remaining);
            if (remaining <= 0) {
                setIsExpired(true);
            } else {
                setIsExpired(false);
            }
        };

        // Initial update
        updateTimer();

        // Stable interval
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startedAt, duration, serverTime]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        remainingTime,
        formattedTime: formatTime(remainingTime),
        isExpired
    };
};
