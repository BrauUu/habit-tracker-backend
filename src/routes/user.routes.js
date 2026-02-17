import { Router } from 'express';
import {create, login, startNewDay, getAllDataFromUser, deleteUserByUserId} from '../controllers/user.controller.js';
import authMiddleware from './middlewares/auth.js';

const router = Router();
router.use('/user', authMiddleware)

router.post('/register', async (req, res) => {
    await create(req, res)
})

router.post('/login', async (req, res) => {
    await login(req, res)
})

router.post('/user/newDay', async (req, res) => {
    await startNewDay(req, res)
})

router.get('/user', async (req, res) => {
    await getAllDataFromUser(req, res)
})

router.delete('/user', async (req, res) => {
    await deleteUserByUserId(req, res)
})

export default router;
