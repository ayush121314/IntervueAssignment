import { Router } from 'express';
import voteController from '../controllers/vote.controller';

const router = Router();

router.post('/:pollId/vote', voteController.submitVote);
router.get('/:pollId/vote/status', voteController.checkVoteStatus);

export default router;
