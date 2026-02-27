import { Router } from 'express';
import { create, getIncrementalById, updateIncrementalById, deleteIncrementalById, increaseOrDecreaseIncrementalById, order } from '../controllers/incremental.controller.js';
import authMiddleware from './middlewares/auth.js';

const router = Router();
router.use('/', authMiddleware)

router.post('/', async (req, res) => {
    await create(req, res)
})

router.post('/:incrementalId/increase', async (req, res) => {
    await increaseOrDecreaseIncrementalById(req, res, true)
})

router.post('/:incrementalId/decrease', async (req, res) => {
    await increaseOrDecreaseIncrementalById(req, res, false)
})

router.get('/:incrementalId', async (req, res) => {
    await getIncrementalById(req, res)
})

router.put('/:incrementalId', async (req, res) => {
    await updateIncrementalById(req, res)
})

router.delete('/:incrementalId', async (req, res) => {
    await deleteIncrementalById(req, res)
})

router.post('/:incrementalId/order', async (req, res) => {
    await order(req, res)
})

export default router;
