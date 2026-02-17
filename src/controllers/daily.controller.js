import * as dailyService from "../services/daily.service.js";
import { isValidUUID } from "../utils/constants.js";

export async function create(req, res) {
    try {
        const { title, description, days_of_the_week } = req.body
        const userId = req.userId
        if (!title)
            return res.status(400).json({ message: "'title' required" })

        const daily = await dailyService.createDaily(userId, title, description, days_of_the_week)
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

        const daily = await dailyService.deleteDaily(dailyId, userId)
        return res.status(200).json(daily)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function updateDailyByDailyId(req, res) {
    try {
        const { title, description, days_of_the_week } = req.body
        const { dailyId } = req.params
        const userId = req.userId

        if (!title)
            return res.status(400).json({ message: "'title' required" })
        if (!isValidUUID(dailyId))
            return res.status(400).json({ message: "'dailyId' invalid" })

        const daily = await dailyService.updateDaily(dailyId, userId, title, description, days_of_the_week)
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