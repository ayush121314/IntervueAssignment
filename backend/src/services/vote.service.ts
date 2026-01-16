import Vote, { IVote } from '../models/Vote';
import pollService from './poll.service';
import timerService from './timer.service';
import studentService from './student.service';
import mongoose from 'mongoose';

class VoteService {
    async submitVote(pollId: string, studentId: string, optionId: string): Promise<IVote> {
        // Check if poll exists and is active
        const poll = await pollService.getPollById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (poll.status !== 'ACTIVE') {
            throw new Error('Poll is not active');
        }

        // Check if poll has expired
        const now = new Date();
        const elapsedSeconds = (now.getTime() - poll.startedAt.getTime()) / 1000;
        if (elapsedSeconds > poll.duration) {
            throw new Error('Poll has expired');
        }

        // Check if student already voted (will throw error due to unique index)
        try {
            const vote = new Vote({
                pollId: new mongoose.Types.ObjectId(pollId),
                studentId,
                optionId: new mongoose.Types.ObjectId(optionId),
                votedAt: new Date()
            });

            await vote.save();

            // Update vote count in poll
            await pollService.updateVoteCount(pollId, optionId);

            // Check if all active students have voted
            const [activeStudents, voteCount] = await Promise.all([
                studentService.getActiveStudents(),
                Vote.countDocuments({ pollId })
            ]);

            if (voteCount >= activeStudents.length && activeStudents.length > 0) {
                console.log(`Poll ${pollId} ending early: All students voted (${voteCount}/${activeStudents.length})`);
                // Trigger early termination
                timerService.endPoll(pollId);
            }

            return vote;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error('You have already voted in this poll');
            }
            throw error;
        }
    }

    async hasVoted(pollId: string, studentId: string): Promise<boolean> {
        const vote = await Vote.findOne({ pollId, studentId });
        return !!vote;
    }

    async getVoteResults(pollId: string): Promise<any> {
        const poll = await pollService.getPollById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        return {
            pollId: poll._id,
            question: poll.question,
            options: poll.options.map(opt => ({
                id: opt._id,
                text: opt.text,
                voteCount: opt.voteCount
            })),
            status: poll.status
        };
    }

    async getStudentVote(pollId: string, studentId: string): Promise<IVote | null> {
        return await Vote.findOne({ pollId, studentId });
    }
}

export default new VoteService();
