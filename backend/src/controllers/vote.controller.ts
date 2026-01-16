import { Request, Response } from 'express';
import voteService from '../services/vote.service';

class VoteController {
    async submitVote(req: Request, res: Response): Promise<void> {
        try {
            const { pollId } = req.params;
            const { studentId, optionId } = req.body;

            if (!studentId || !optionId) {
                res.status(400).json({ error: 'Missing studentId or optionId' });
                return;
            }

            const vote = await voteService.submitVote(pollId, studentId, optionId);

            res.status(201).json({
                success: true,
                vote: {
                    pollId: vote.pollId,
                    studentId: vote.studentId,
                    optionId: vote.optionId,
                    votedAt: vote.votedAt
                }
            });
        } catch (error: any) {
            if (error.message.includes('already voted')) {
                res.status(409).json({ error: error.message });
            } else if (error.message.includes('expired') || error.message.includes('not active')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async checkVoteStatus(req: Request, res: Response): Promise<void> {
        try {
            const { pollId } = req.params;
            const { studentId } = req.query;

            if (!studentId) {
                res.status(400).json({ error: 'Missing studentId' });
                return;
            }

            const hasVoted = await voteService.hasVoted(pollId, studentId as string);
            const vote = hasVoted ? await voteService.getStudentVote(pollId, studentId as string) : null;

            res.json({
                hasVoted,
                vote: vote ? {
                    optionId: vote.optionId,
                    votedAt: vote.votedAt
                } : null
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new VoteController();
