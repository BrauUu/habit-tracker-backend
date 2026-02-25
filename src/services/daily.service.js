import * as dailyRepository from '../repositories/daily.repository.js'
import HttpError from '../errors/HttpError.js'

export async function createDaily(userId, title, description, daysOfTheWeek) {
    const daily = await dailyRepository.createDaily(userId, title, description, daysOfTheWeek)
    return daily
}

export async function getPendingHabits(userId) {
    const dailies = await dailyRepository.getPendingDailiesByUserId(userId)
    const ids = dailies.map(daily => daily.id)
    return ids
}

export async function getDaily(dailyId, userId) {

    const daily = await dailyRepository.findById(dailyId)

    if(!daily) 
        throw new HttpError(404, 'Daily not found')
    if (daily.userId != userId)
        throw new HttpError(401)

    return daily
}

export async function updateDaily(dailyId, userId, title, description, daysOfTheWeek) {

    const daily = await dailyRepository.findById(dailyId)
    
    if(!daily) 
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    const updatedDaily = await dailyRepository.updateDaily(dailyId, title, description, daysOfTheWeek)
    return updatedDaily
}

export async function deleteDaily(dailyId, userId) {

    const daily = await dailyRepository.findById(dailyId)
    
    if(!daily) 
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    await dailyRepository.deleteDaily(dailyId)
    return 
}

export async function checkOrUncheckDailyById(dailyId, userId, check) {

    const daily = await dailyRepository.findById(dailyId)
    
    if(!daily) 
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    if(daily.done == check)
        throw new HttpError(400)

    const updatedDaily = await dailyRepository.checkOrUncheckDaily(dailyId, check)
    if(!updatedDaily)
        throw new HttpError(500)

    const newStreak = parseInt(updatedDaily.streak) + (check ? 1 : -1)
    await dailyRepository.updateStreak(dailyId, newStreak)
    return
}