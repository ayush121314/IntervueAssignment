import { Router } from 'express';
import pollController from '../controllers/poll.controller';

const router = Router();

router.get('/current', pollController.getCurrentPoll);
router.post('/', pollController.createPoll);
router.get('/history', pollController.getPollHistory);

export default router;
