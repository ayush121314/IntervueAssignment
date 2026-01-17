import pollService from './poll.service';
import { Server } from 'socket.io';

class TimerService {
    private activeTimers: Map<string, NodeJS.Timeout> = new Map();
    private io: Server | null = null;

    setSocketIO(io: Server): void {
        this.io = io;
    }

    startPollTimer(pollId: string, duration: number): void {
        // Clear any existing timer for this poll
        this.clearTimer(pollId);

        // Set new timer to auto-end the poll when duration is up
        const timer = setTimeout(async () => {
            await this.endPoll(pollId);
        }, duration * 1000); // Convert seconds to milliseconds

        this.activeTimers.set(pollId, timer);
    }

    async endPoll(pollId: string): Promise<void> {
        try {
            // End the poll
            const poll = await pollService.endPoll(pollId);

            if (poll && this.io) {
                // Emit poll:end event to all clients
                this.io.emit('poll:end', {
                    pollId: poll._id.toString(),
                    question: poll.question,
                    options: poll.options.map(opt => ({
                        id: opt._id.toString(),
                        text: opt.text,
                        voteCount: opt.voteCount,
                        isCorrect: opt.isCorrect
                    })),
                    finalResults: true,
                    resultsRemaining: 5
                });

                // Broadcast countdown every second for 5 seconds
                let remaining = 5;
                const countdownInterval = setInterval(() => {
                    remaining -= 1;
                    if (remaining <= 0) {
                        clearInterval(countdownInterval);
                        if (this.io) {
                            this.io.emit('poll:idle');
                        }
                    } else {
                        if (this.io) {
                            this.io.emit('poll:update', {
                                status: 'ENDED',
                                pollId: poll._id.toString(),
                                question: poll.question,
                                options: poll.options.map(opt => ({
                                    id: opt._id.toString(),
                                    text: opt.text,
                                    voteCount: opt.voteCount,
                                    isCorrect: opt.isCorrect
                                })),
                                resultsRemaining: remaining
                            });
                        }
                    }
                }, 1000);
            }

            // Clean up timer
            this.clearTimer(pollId);
        } catch (error) {
            console.error('Error ending poll:', error);
        }
    }

    clearTimer(pollId: string): void {
        const timer = this.activeTimers.get(pollId);
        if (timer) {
            clearTimeout(timer);
            this.activeTimers.delete(pollId);
        }
    }

    clearAllTimers(): void {
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers.clear();
    }
}

export default new TimerService();
