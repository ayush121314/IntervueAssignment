import { Router } from 'express';
import studentController from '../controllers/student.controller';

const router = Router();

router.get('/session/:studentId', studentController.validateSession);

export default router;
