import * as dailyService from "../services/daily.service.js";

export async function create(req, res) {
    try {
        const {title, description, daysOfTheWeek} = req.body
        const userId = req.userId

        const daily = await dailyService.createDaily(userId, title, description, daysOfTheWeek)
        return res.status(201).json(daily)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

export async function getDailyByDailyId(req, res) {
    try {
        const { dailyId } = req.params
        const userId = req.userId

        const daily = await dailyService.getDaily(dailyId, userId)
        return res.status(200).json(daily)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

export async function deleteDailyByDailyId(req, res) {
    try {
        const { dailyId } = req.params
        const userId = req.userId

        const daily = await dailyService.deleteDaily(dailyId, userId)
        return res.status(200).json(daily)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

export async function updateDailyByDailyId(req, res) {
    try {
        const { title, description, daysOfTheWeek } = req.body
        const { dailyId } = req.params
        const userId = req.userId

        const daily = await dailyService.updateDaily(dailyId, userId, title, description, daysOfTheWeek)
        return res.status(200).json(daily)
        
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

//TODO: CHECK METHODS
export async function checkDailyById(req, res) {
   
}

export async function uncheckDailyById(req, res) {
   
}