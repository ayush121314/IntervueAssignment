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
            return;
        }

        const calculateRemainingTime = () => {
            const now = new Date().getTime();
            const start = new Date(startedAt).getTime();

            // If server time is provided, use it to calculate offset
            let offset = 0;
            if (serverTime) {
                const serverNow = new Date(serverTime).getTime();
                offset = now - serverNow;
            }

            const elapsed = (now - offset - start) / 1000; // in seconds
            const remaining = Math.max(0, duration - elapsed);

            return remaining;
        };

        // Initial calculation
        const initial = calculateRemainingTime();
        setRemainingTime(initial);
        setIsExpired(initial <= 0);

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateRemainingTime();
            setRemainingTime(remaining);

            if (remaining <= 0) {
                setIsExpired(true);
                clearInterval(interval);
            }
        }, 1000);

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
