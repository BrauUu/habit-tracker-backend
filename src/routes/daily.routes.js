import { Router } from 'express';
import { create, getDailyByDailyId, updateDailyByDailyId, deleteDailyByDailyId, checkOrUncheckDailyById, getPendingHabits, undoAllDailies } from '../controllers/daily.controller.js';
import authMiddleware from './middlewares/auth.js';

const router = Router();
router.use('/', authMiddleware)

router.post('/', async (req, res) => {
    await create(req, res)
})

router.get('/pendingHabits', async (req, res) => {
    await getPendingHabits(req, res)
})

router.post('/newDay', async (req, res) => {
    await undoAllDailies(req, res)
})

router.post('/:dailyId/check', async (req, res) => {
    await checkOrUncheckDailyById(req, res, true)
})

router.post('/:dailyId/uncheck', async (req, res) => {
    await checkOrUncheckDailyById(req, res, false)
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
