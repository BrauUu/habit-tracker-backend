import * as dailyRepository from '../repositories/daily.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'

export async function createDaily(userId, title, description, daysOfTheWeek, order) {
    const daily = await dailyRepository.createDaily(userId, title, description, daysOfTheWeek, order)
    return daily
}

export async function getPendingHabits(userId) {
    const dailies = await dailyRepository.getPendingDailiesByUserId(userId)
    const ids = dailies.map(daily => daily.id)
    return ids
}

export async function getDaily(dailyId, userId) {

    const daily = await dailyRepository.findById(dailyId)

    if (!daily)
        throw new HttpError(404, 'Daily not found')
    if (daily.userId != userId)
        throw new HttpError(401)

    return daily
}

export async function updateDaily(dailyId, userId, title, description, daysOfTheWeek) {

    const daily = await dailyRepository.findById(dailyId)

    if (!daily)
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    const updatedDaily = await dailyRepository.updateDaily(dailyId, title, description, daysOfTheWeek)
    return updatedDaily
}

export async function deleteDaily(dailyId, userId) {

    const daily = await dailyRepository.findById(dailyId)

    if (!daily)
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    await dailyRepository.deleteDaily(dailyId)
    return
}

export async function checkOrUncheckDailyById(dailyId, userId, check) {

    const daily = await dailyRepository.findById(dailyId)

    if (!daily)
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    if (daily.done == check)
        throw new HttpError(400)

    const updatedDaily = await dailyRepository.checkOrUncheckDaily(dailyId, check)
    if (!updatedDaily)
        throw new HttpError(500)

    const newStreak = parseInt(updatedDaily.streak) + (check ? 1 : -1)
    await dailyRepository.updateStreak(dailyId, newStreak)
    return
}

export async function order(dailyId, userId, oldPosition, newPosition) {

    const client = await pool.connect();

    const daily = await dailyRepository.findById(dailyId)

    if (!daily)
        throw new HttpError(404, 'Daily not found')

    if (daily.userId != userId)
        throw new HttpError(401)

    try {
        await client.query('BEGIN');

        const dailiesToBeReordered = await dailyRepository.getDailiesToBeReordered(userId, oldPosition, newPosition, client)
        
        const [otherDailies, actualDaily] = await Promise.all([
            dailyRepository.reorderOtherDailies(dailiesToBeReordered, oldPosition, newPosition, client),
            dailyRepository.reorderActualDaily(dailyId, newPosition, client)
        ])

        await client.query('COMMIT');

        return [...otherDailies, ...actualDaily]

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
