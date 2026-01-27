import { Router } from 'express';

import {create, login} from '../controllers/user.js';

const router = Router();

router.post('/', (req, res) => {
    create(req, res)
})

export default router;