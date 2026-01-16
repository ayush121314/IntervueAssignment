import Poll, { IPoll } from '../models/Poll';
import mongoose from 'mongoose';

export interface CreateOptionData {
    text: string;
    isCorrect: boolean;
}

export interface CreatePollData {
    question: string;
    options: CreateOptionData[];
    duration: number;
}

export interface PollStateResponse {
    status: 'IDLE' | 'ACTIVE' | 'ENDED';
    pollId?: string;
    question?: string;
    options?: Array<{ id: string; text: string; voteCount: number; isCorrect: boolean }>;
    startedAt?: string;
    duration?: number;
    serverTime?: string;
}

class PollService {
    async getCurrentPoll(): Promise<PollStateResponse> {
        const activePoll = await Poll.findOne({ status: 'ACTIVE' });

        if (!activePoll) {
            // If no active poll, check for the most recently ended poll
            const lastEndedPoll = await Poll.findOne({ status: 'ENDED' }).sort({ endedAt: -1 });

            if (lastEndedPoll) {
                return {
                    status: 'ENDED',
                    pollId: lastEndedPoll._id.toString(),
                    question: lastEndedPoll.question,
                    options: lastEndedPoll.options.map(opt => ({
                        id: opt._id.toString(),
                        text: opt.text,
                        voteCount: opt.voteCount,
                        isCorrect: opt.isCorrect
                    })),
                    serverTime: new Date().toISOString()
                };
            }

            return { status: 'IDLE' };
        }

        return {
            status: 'ACTIVE',
            pollId: activePoll._id.toString(),
            question: activePoll.question,
            options: activePoll.options.map(opt => ({
                id: opt._id.toString(),
                text: opt.text,
                voteCount: opt.voteCount,
                isCorrect: opt.isCorrect
            })),
            startedAt: activePoll.startedAt.toISOString(),
            duration: activePoll.duration,
            serverTime: new Date().toISOString()
        };
    }

    async createPoll(data: CreatePollData): Promise<IPoll> {
        // Check if there's already an active poll
        const existingActivePoll = await Poll.findOne({ status: 'ACTIVE' });
        if (existingActivePoll) {
            throw new Error('An active poll already exists. Please end it before creating a new one.');
        }

        const poll = new Poll({
            question: data.question,
            options: data.options.map(opt => ({
                _id: new mongoose.Types.ObjectId(),
                text: opt.text,
                isCorrect: opt.isCorrect,
                voteCount: 0
            })),
            duration: data.duration,
            status: 'ACTIVE',
            startedAt: new Date(),
            createdBy: 'TEACHER'
        });

        await poll.save();
        return poll;
    }

    async endPoll(pollId: string): Promise<IPoll | null> {
        const poll = await Poll.findByIdAndUpdate(
            pollId,
            {
                status: 'ENDED',
                endedAt: new Date()
            },
            { new: true }
        );

        return poll;
    }

    async getPollHistory(): Promise<IPoll[]> {
        const polls = await Poll.find({ status: 'ENDED' })
            .sort({ endedAt: -1 })
            .limit(50);

        return polls;
    }

    async updateVoteCount(pollId: string, optionId: string): Promise<void> {
        await Poll.findOneAndUpdate(
            { _id: pollId, 'options._id': optionId },
            { $inc: { 'options.$.voteCount': 1 } }
        );
    }

    async getPollById(pollId: string): Promise<IPoll | null> {
        return await Poll.findById(pollId);
    }
}

export default new PollService();
