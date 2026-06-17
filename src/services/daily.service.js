import * as dailyRepository from '../repositories/daily.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'
import { moveItemToPosition } from '../utils/ordering.js'

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

async function reorderDaily(dailyId, userId, newPosition) {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const daily = await dailyRepository.findById(dailyId, client)

        if (!daily)
            throw new HttpError(404, 'Daily not found')

        if (daily.userId != userId)
            throw new HttpError(401)

        const dailies = await dailyRepository.getDailyOrdersByUserId(userId, client)

        if (newPosition > dailies.length)
            throw new HttpError(400, "'newPosition' should be within the list bounds")

        const reorderedDailies = moveItemToPosition(dailies, dailyId, newPosition)
        await dailyRepository.updateDailyOrders(reorderedDailies, client)
        const updatedDailies = await dailyRepository.getDailyOrdersByUserId(userId, client)

        await client.query('COMMIT');

        return updatedDailies

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function order(dailyId, userId, newPosition) {
    if (!Number.isInteger(newPosition) || newPosition < 1)
        throw new HttpError(400, "'newPosition' required and should be a positive integer")

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await reorderDaily(dailyId, userId, newPosition)
        } catch (error) {
            if (error.code === '23505' && attempt === 0)
                continue

            if (error.code === '23505')
                throw new HttpError(409, 'Habit order changed. Please try again.')

            throw error
        }
    }
}
