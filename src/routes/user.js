import { Router } from 'express';

import {create, login} from '../controllers/user.js';

const router = Router();

router.post('/register', async (req, res) => {
    await create(req, res)
})

router.post('/login', async (req, res) => {
    await login(req, res)
})

export default router;