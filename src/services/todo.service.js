import * as todoRepository from '../repositories/todo.repository.js'
import HttpError from '../errors/HttpError.js'

export async function createTodo(userId, title, description, dueDate) {
    const todo = await todoRepository.createTodo(userId, title, description, dueDate)
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