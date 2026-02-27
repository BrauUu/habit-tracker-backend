import * as todoRepository from '../repositories/todo.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'

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

export async function order(todoId, userId, oldPosition, newPosition) {

    const client = await pool.connect();

    const todo = await todoRepository.findById(todoId)

    if (!todo)
        throw new HttpError(404, 'Todo not found')

    if (todo.userId != userId)
        throw new HttpError(401)

    try {
        await client.query('BEGIN');

        const todosToBeReordered = await todoRepository.getTodosToBereordered(oldPosition, newPosition, client)
        
        const [otherTodos, actualTodo] = await Promise.all([
            todoRepository.reorderOtherTodos(todosToBeReordered, oldPosition, newPosition, client),
            todoRepository.reorderActualTodo(todoId, newPosition, client)
        ])

        await client.query('COMMIT');

        return [...otherTodos, ...actualTodo]

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}