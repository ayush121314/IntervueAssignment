import StudentSession, { IStudentSession } from '../models/StudentSession';

class StudentService {
    async registerStudent(studentId: string, name: string, socketId: string): Promise<IStudentSession> {
        // Check if student already exists
        let student = await StudentSession.findOne({ studentId });

        if (student) {
            // Update existing student
            student.name = name;
            student.socketId = socketId;
            student.isActive = true;
            student.joinedAt = new Date();
            await student.save();
            return student;
        }

        // Create new student
        student = new StudentSession({
            studentId,
            name,
            socketId,
            joinedAt: new Date(),
            isActive: true
        });

        await student.save();
        return student;
    }

    async getActiveStudents(): Promise<IStudentSession[]> {
        return await StudentSession.find({ isActive: true }).sort({ joinedAt: -1 });
    }

    async kickStudent(studentId: string): Promise<void> {
        await StudentSession.findOneAndUpdate(
            { studentId },
            { isActive: false }
        );
    }

    async updateSocketId(studentId: string, socketId: string): Promise<void> {
        await StudentSession.findOneAndUpdate(
            { studentId },
            { socketId, isActive: true }
        );
    }

    async getStudentBySocketId(socketId: string): Promise<IStudentSession | null> {
        return await StudentSession.findOne({ socketId });
    }

    async deactivateStudent(socketId: string): Promise<void> {
        await StudentSession.findOneAndUpdate(
            { socketId },
            { isActive: false }
        );
    }

    async getStudentById(studentId: string): Promise<IStudentSession | null> {
        return await StudentSession.findOne({ studentId });
    }
}

export default new StudentService();
