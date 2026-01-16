import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    sender: string;
    text: string;
    role: 'STUDENT' | 'TEACHER';
    timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'TEACHER'], required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
