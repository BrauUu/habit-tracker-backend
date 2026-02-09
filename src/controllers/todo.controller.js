import * as todoService from "../services/todo.service.js";
import { isValidUUID, isValidDate } from "../utils/constants.js";

//TODO: dueDate não deve ser obrigatório, deve ser null ou data válida - no create e no update
export async function create(req, res) {
    try {
        const {title, description, dueDate} = req.body
        const userId = req.userId

        if(!title || !dueDate)
            return res.status(400).json({ message: "'title' and 'dueDate' required" })
        
        if(!isValidDate(dueDate))
            return res.status(400).json({ message: "'dueDate' must be a valid date in YYYY-MM-DD format" })

        const todo = await todoService.createTodo(userId, title, description, dueDate)
        return res.status(201).json(todo)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function getTodoById(req, res) {
    try {
        const { todoId } = req.params
        const userId = req.userId
        if(!isValidUUID(todoId))
            return res.status(400).json({ message: "'todoId' invalid" })

        const todo = await todoService.getTodo(todoId, userId)
        return res.status(200).json(todo)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function deleteTodoById(req, res) {
    try {
        const { todoId } = req.params
        const userId = req.userId
        if(!isValidUUID(todoId))
            return res.status(400).json({ message: "'todoId' invalid" })

        const todo = await todoService.deleteTodo(todoId, userId)
        return res.status(200).json(todo)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function updateTodoById(req, res) {
    try {
        const {title, description, dueDate} = req.body
        const { todoId } = req.params
        const userId = req.userId

        if(!title || !dueDate) 
            return res.status(400).json({ message: "'title' and 'dueDate' required" })
        
        if(!isValidDate(dueDate))
            return res.status(400).json({ message: "'dueDate' must be a valid date in YYYY-MM-DD format" })
        
        if(!isValidUUID(todoId))
            return res.status(400).json({ message: "'todoId' invalid" })

        const todo = await todoService.updateTodo(todoId, userId, title, description, dueDate)
        return res.status(200).json(todo)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function checkOrUncheckTodoById(req, res, check) {
   try {
        const { todoId } = req.params
        const userId = req.userId
        if(!isValidUUID(todoId))
            return res.status(400).json({ message: "'todoId' invalid" })

        await todoService.checkOrUncheckTodoById(todoId, userId, check)
        return res.sendStatus(200)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}