import * as todoRepository from '../repositories/todo.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'
import { moveItemToPosition } from '../utils/ordering.js'

export async function createTodo(userId, title, description, dueDate, order) {
    const todo = await todoRepository.createTodo(userId, title, description, dueDate, order)
    return todo
}

export async function getTodo(todoId, userId) {

    const todo = await todoRepository.findById(todoId)

    if (!todo)
        throw new HttpError(404, 'Todo not found')
    if (todo.userId != userId)
        throw new HttpError(401)

    return todo
}

export async function updateTodo(todoId, userId, title, description, dueDate) {

    const todo = await todoRepository.findById(todoId)

    if (!todo)
        throw new HttpError(404, 'Todo not found')

    if (todo.userId != userId)
        throw new HttpError(401)

    const updatedTodo = await todoRepository.updateTodo(todoId, title, description, dueDate)
    return updatedTodo
}

export async function deleteTodo(todoId, userId) {

    const todo = await todoRepository.findById(todoId)

    if (!todo)
        throw new HttpError(404, 'Todo not found')

    if (todo.userId != userId)
        throw new HttpError(401)

    await todoRepository.deleteTodo(todoId)
    return
}

export async function checkOrUncheckTodoById(todoId, userId, check) {

    const todo = await todoRepository.findById(todoId)

    if (!todo)
        throw new HttpError(404, 'Todo not found')

    if (todo.userId != userId)
        throw new HttpError(401)

    if ((todo.doneDate !== null && check) || (todo.doneDate === null && !check))
        throw new HttpError(400)

    if (check) {
        const today = new Date()
        today.setHours(3, 0, 0, 0)
        await todoRepository.updateDoneDate(todoId, today)
        return
    }

    await todoRepository.updateDoneDate(todoId, null)
    return
}

async function reorderTodo(todoId, userId, newPosition) {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const todo = await todoRepository.findById(todoId, client)

        if (!todo)
            throw new HttpError(404, 'Todo not found')

        if (todo.userId != userId)
            throw new HttpError(401)

        const todos = await todoRepository.getTodoOrdersByUserId(userId, client)

        if (newPosition > todos.length)
            throw new HttpError(400, "'newPosition' should be within the list bounds")

        const reorderedTodos = moveItemToPosition(todos, todoId, newPosition)
        await todoRepository.updateTodoOrders(reorderedTodos, client)
        const updatedTodos = await todoRepository.getTodoOrdersByUserId(userId, client)

        await client.query('COMMIT');

        return updatedTodos

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function order(todoId, userId, newPosition) {
    if (!Number.isInteger(newPosition) || newPosition < 1)
        throw new HttpError(400, "'newPosition' required and should be a positive integer")

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await reorderTodo(todoId, userId, newPosition)
        } catch (error) {
            if (error.code === '23505' && attempt === 0)
                continue

            if (error.code === '23505')
                throw new HttpError(409, 'Habit order changed. Please try again.')

            throw error
        }
    }
}
