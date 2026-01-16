import { Request, Response } from 'express';
import pollService from '../services/poll.service';
import timerService from '../services/timer.service';

class PollController {
    async getCurrentPoll(req: Request, res: Response): Promise<void> {
        try {
            const pollState = await pollService.getCurrentPoll();
            res.json(pollState);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createPoll(req: Request, res: Response): Promise<void> {
        try {
            const { question, options, duration } = req.body;

            // Validation
            if (!question || !options || !duration) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            if (!Array.isArray(options) || options.length < 2) {
                res.status(400).json({ error: 'At least 2 options are required' });
                return;
            }

            const poll = await pollService.createPoll({ question, options, duration });

            // Start server-side timer
            timerService.startPollTimer(poll._id.toString(), duration);

            res.status(201).json({
                pollId: poll._id,
                question: poll.question,
                options: poll.options.map(opt => ({
                    id: opt._id,
                    text: opt.text,
                    voteCount: opt.voteCount,
                    isCorrect: opt.isCorrect
                })),
                duration: poll.duration,
                startedAt: poll.startedAt,
                status: poll.status
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPollHistory(req: Request, res: Response): Promise<void> {
        try {
            const polls = await pollService.getPollHistory();

            const formattedPolls = polls.map(poll => ({
                id: poll._id,
                question: poll.question,
                options: poll.options.map(opt => ({
                    id: opt._id,
                    text: opt.text,
                    voteCount: opt.voteCount,
                    isCorrect: opt.isCorrect
                })),
                duration: poll.duration,
                startedAt: poll.startedAt,
                endedAt: poll.endedAt,
                status: poll.status
            }));

            res.json(formattedPolls);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PollController();
