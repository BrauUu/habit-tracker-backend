import * as incrementalService from "../services/incremental.service.js";
import { isValidUUID, incrementalResetFrequencyTypes, formatResetFrequencyText } from "../utils/constants.js";


export async function create(req, res) {
    try {
        const { title, description, resetFrequency } = req.body
        const userId = req.userId
        const resetFrequencyNumeric = incrementalResetFrequencyTypes[resetFrequency];

        if (!title || !resetFrequency)
            return res.status(400).json({ message: "'title' and 'resetFrequency' required" })
        if (title.length > 250)
            return res.status(400).json({ message: "'title' must be no longer than 250 characters" })
        if (description && description.length > 500)
            return res.status(400).json({ message: "'description' must be no longer than 500 characters" })
        if (resetFrequencyNumeric === undefined)
            return res.status(400).json({ message: `'resetFrequency' should be: ${Object.keys(incrementalResetFrequencyTypes).map(key => `'${key}'`).join(' or ')}` })

        const incremental = await incrementalService.createIncremental(userId, title, description, resetFrequencyNumeric)
        return res.status(201).json(formatResetFrequencyText(incremental))

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function getIncrementalById(req, res) {
    try {
        const { incrementalId } = req.params
        const userId = req.userId
        if (!isValidUUID(incrementalId))
            return res.status(400).json({ message: "'incrementalId' invalid" })

        const incremental = await incrementalService.getIncremental(incrementalId, userId)
        return res.status(200).json(formatResetFrequencyText(incremental))

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function deleteIncrementalById(req, res) {
    try {
        const { incrementalId } = req.params
        const userId = req.userId
        if (!isValidUUID(incrementalId))
            return res.status(400).json({ message: "'incrementalId' invalid" })

        await incrementalService.deleteIncremental(incrementalId, userId)
        return res.sendStatus(200)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function updateIncrementalById(req, res) {
    try {
        const { title, description, resetFrequency } = req.body
        const { incrementalId } = req.params
        const userId = req.userId
        const resetFrequencyNumeric = incrementalResetFrequencyTypes[resetFrequency];

        if (!title || !resetFrequency)
            return res.status(400).json({ message: "'title' and 'resetFrequency' required" })
        if (title.length > 250)
            return res.status(400).json({ message: "'title' must be no longer than 250 characters" })
        if (description && description.length > 250)
            return res.status(400).json({ message: "'description' must be no longer than 500 characters" })
        if (resetFrequencyNumeric === undefined)
            return res.status(400).json({ message: `'resetFrequency' should be: ${Object.keys(incrementalResetFrequencyTypes).map(key => `'${key}'`).join(' or ')}` })
        if (!isValidUUID(incrementalId))
            return res.status(400).json({ message: "'incrementalId' invalid" })

        const incremental = await incrementalService.updateIncremental(incrementalId, userId, title, description, resetFrequencyNumeric)
        return res.status(200).json(formatResetFrequencyText(incremental))

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function increaseOrDecreaseIncrementalById(req, res, increase) {
    try {
        const { incrementalId } = req.params
        const userId = req.userId
        if (!isValidUUID(incrementalId))
            return res.status(400).json({ message: "'incrementalId' invalid" })

        await incrementalService.increaseOrDecreaseIncremental(incrementalId, userId, increase)
        return res.sendStatus(200)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}

export async function order(req, res) {
    try {
        const { newPosition } = req.body
        const { incrementalId } = req.params
        const userId = req.userId
        if (!isValidUUID(incrementalId))
            return res.status(400).json({ message: "'incrementalId' invalid" })

        const response = await incrementalService.order(incrementalId, userId, newPosition)
        return res.status(200).json(response)

    } catch (err) {
        console.log(err)
        if (err.message) return res.status(err.status).json({ message: err.message })
        return res.sendStatus(err.status)
    }
}
