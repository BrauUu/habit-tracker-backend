import { json } from "express";
import * as dailyService from "../services/daily.service.js";
import { isValidUUID } from "../utils/constants.js";

export async function create(req, res) {
    try {
        const { title, description, daysOfTheWeek, order } = req.body
        const userId = req.userId
        if (!title)
            return res.status(400).json({ message: "'title' required" })
        if (title.length > 250)
            return res.status(400).json({ message: "'title' must be no longer than 250 characters" })
        if (description && description.length > 250)
            return res.status(400).json({ message: "'description' must be no longer than 250 characters" })
        if (!order || typeof(order) != "number") 
            return res.status(400).json({ message: "'order' required and should be 'number'" })

        const daily = await dailyService.createDaily(userId, title, description, daysOfTheWeek, order)
        return res.status(201).json(daily)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function getPendingHabits(req, res) {
    try {
        const userId = req.userId
        const data = await dailyService.getPendingHabits(userId)
        return res.status(200).json(data)
    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function getDailyByDailyId(req, res) {
    try {
        const { dailyId } = req.params
        const userId = req.userId
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })

        const daily = await dailyService.getDaily(dailyId, userId)
        return res.status(200).json(daily)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function deleteDailyByDailyId(req, res) {
    try {
        const { dailyId } = req.params
        const userId = req.userId
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })

        await dailyService.deleteDaily(dailyId, userId)
        return res.sendStatus(200)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function updateDailyByDailyId(req, res) {
    try {
        const { title, description, daysOfTheWeek } = req.body
        const { dailyId } = req.params
        const userId = req.userId

        if (!title)
            return res.status(400).json({ message: "'title' required" })
        if (title.length > 250)
            return res.status(400).json({ message: "'title' must be no longer than 250 characters" })
        if (description && description.length > 250)
            return res.status(400).json({ message: "'description' must be no longer than 250 characters" })
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })

        const daily = await dailyService.updateDaily(dailyId, userId, title, description, daysOfTheWeek)
        return res.status(200).json(daily)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function checkOrUncheckDailyById(req, res, check) {
    try {
        const { dailyId } = req.params
        const userId = req.userId
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })
        
        await dailyService.checkOrUncheckDailyById(dailyId, userId, check)
        return res.sendStatus(200)
        
    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
            return res.sendStatus(err.status)
    }
}

export async function order(req, res) {
    try {
        const { oldPosition, newPosition} = req.body
        const { dailyId } = req.params
        const userId = req.userId
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })

        const response = await dailyService.order(dailyId, userId, oldPosition, newPosition)
        return res.status(200).json(response)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}