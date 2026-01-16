import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentSession extends Document {
    studentId: string;
    name: string;
    socketId: string;
    joinedAt: Date;
    isActive: boolean;
    isKicked: boolean;
}

const StudentSessionSchema = new Schema<IStudentSession>({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    socketId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isKicked: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IStudentSession>('StudentSession', StudentSessionSchema);
