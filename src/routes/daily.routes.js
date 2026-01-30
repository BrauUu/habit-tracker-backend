import { Router } from 'express';
import { create, getDailyByDailyId, updateDailyByDailyId, deleteDailyByDailyId, checkDailyById, uncheckDailyById } from '../controllers/daily.controller.js';
import authMiddleware from './middlewares/auth.js';

const router = Router();
router.use('/', authMiddleware)

router.post('/', async (req, res) => {
    await create(req, res)
})

router.post('/check', async (req, res) => {
    await checkDailyById(req, res)
})

router.post('/uncheck', async (req, res) => {
    await uncheckDailyById(req, res)
})

router.get('/:dailyId', async (req, res) => {
    await getDailyByDailyId(req, res)
})

router.put('/:dailyId', async (req, res) => {
    await updateDailyByDailyId(req, res)
})

router.delete('/:dailyId', async (req, res) => {
    await deleteDailyByDailyId(req, res)
})

export default router;
