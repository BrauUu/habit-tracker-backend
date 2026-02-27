import { Router } from 'express';
import { create, getTodoById, updateTodoById, deleteTodoById, checkOrUncheckTodoById, order } from '../controllers/todo.controller.js';
import authMiddleware from './middlewares/auth.js';

const router = Router();
router.use('/', authMiddleware)

router.post('/', async (req, res) => {
    await create(req, res)
})

router.post('/:todoId/check', async (req, res) => {
    await checkOrUncheckTodoById(req, res, true)
})

router.post('/:todoId/uncheck', async (req, res) => {
    await checkOrUncheckTodoById(req, res, false)
})

router.get('/:todoId', async (req, res) => {
    await getTodoById(req, res)
})

router.put('/:todoId', async (req, res) => {
    await updateTodoById(req, res)
})

router.delete('/:todoId', async (req, res) => {
    await deleteTodoById(req, res)
})

router.post('/:todoId/order', async (req, res) => {
    await order(req, res)
})

export default router;