import { Router } from 'express';
import studentController from '../controllers/student.controller';

const router = Router();

router.get('/session/:studentId', studentController.validateSession);
router.post('/register', studentController.registerStudent);

export default router;
