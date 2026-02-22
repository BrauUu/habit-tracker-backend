
import * as userService from "../services/user.service.js";
import { passwordRegex, formatResetFrequencyText } from "../utils/constants.js";

export async function login(req, res) {
    try {
        const { username, password } = req.body
        if(!username || !password) {
            return res.status(400).json({ message: "'username' and 'password' required" })
        }
        const { user, token } = await userService.login(username, password)
        return res.status(200).json({ user, token })
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function create(req, res) {
    try {
        const { username, password } = req.body
        if(!username || !password)
            return res.status(400).json({ message: "'username' and 'password' required" })
        if(!passwordRegex.test(password)){
            return res.status(400).json({ message: "'password' must contain at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol (!@#$%&*?)" })
        }
        const { user, token } = await userService.create(username, password)
        return res.status(201).json({ user, token })
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }

}

export async function startNewDay(req, res) {
    try {
        const userId = req.userId
        const data = await userService.startNewDay(userId)
        return res.status(200).json(data)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function synchronizeHabits(req, res) {
    try {
        const userId = req.userId
        const habits = req.body
        const data = await userService.synchronizeHabits(userId, habits)
        return res.status(201).json(data)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function getAllDataFromUser(req, res) {
    try {
        const userId = req.userId
        const data = await userService.getAllDataFromUser(userId)

        data.incrementals = data.incrementals.map((incremental) => formatResetFrequencyText(incremental))

        return res.status(200).json(data)
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function deleteUserByUserId(req, res) {
    try {
        const userId = req.userId
        await userService.deleteUserByUserId(userId)
        return res.sendStatus(200)
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}