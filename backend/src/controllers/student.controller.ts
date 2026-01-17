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
}

export default new StudentController();
