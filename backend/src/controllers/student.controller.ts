import { Request, Response } from 'express';
import studentService from '../services/student.service';

class StudentController {
    async validateSession(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const student = await studentService.getStudentById(studentId);

            if (!student) {
                return res.status(404).json({ valid: false, message: 'Student not found' });
            }

            if (student.isKicked) {
                return res.status(403).json({ valid: false, message: 'Student is kicked' });
            }

            res.json({
                valid: true,
                student: {
                    id: student.studentId,
                    name: student.name
                }
            });
        } catch (error) {
            console.error('Error validating session:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async registerStudent(req: Request, res: Response) {
        try {
            const { studentId, name, socketId } = req.body;
            if (!studentId || !name || !socketId) {
                return res.status(400).json({ error: 'Missing fields' });
            }

            await studentService.registerStudent(studentId, name, socketId);

            res.json({ success: true });
        } catch (error: any) {
            if (error.message.includes('kicked')) {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: 'Registration failed' });
        }
    }
}

export default new StudentController();
