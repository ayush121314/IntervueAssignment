import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentId: string;
    optionId: mongoose.Types.ObjectId;
    votedAt: Date;
}

const VoteSchema = new Schema<IVote>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentId: { type: String, required: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
    votedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Unique compound index to prevent double voting
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
