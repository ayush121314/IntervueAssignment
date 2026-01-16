import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    _id: mongoose.Types.ObjectId;
    text: string;
    voteCount: number;
    isCorrect: boolean;
}

export interface IPoll extends Document {
    question: string;
    options: IOption[];
    duration: number;
    status: 'ACTIVE' | 'ENDED';
    startedAt: Date;
    endedAt?: Date;
    createdBy: string;
}

const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: false }
});

const PollSchema = new Schema<IPoll>({
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'ENDED'], default: 'ACTIVE' },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    createdBy: { type: String, default: 'TEACHER' }
}, {
    timestamps: true
});

export default mongoose.model<IPoll>('Poll', PollSchema);
