import * as incrementalRepository from '../repositories/incremental.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'
import { moveItemToPosition } from '../utils/ordering.js'

export async function createIncremental(userId, title, description, resetFrequency) {
     const order = await incrementalRepository.getNextOrderByUserId(userId)
    const incremental = await incrementalRepository.createIncremental(userId, title, description, resetFrequency, order)
    return incremental
}

export async function getIncremental(incrementalId, userId) {

    const incremental = await incrementalRepository.findById(incrementalId)

    if (!incremental)
        throw new HttpError(404, 'Incremental not found')
    if (incremental.userId != userId)
        throw new HttpError(401)

    return incremental
}

export async function updateIncremental(incrementalId, userId, title, description, resetFrequency) {

    const incremental = await incrementalRepository.findById(incrementalId)

    if (!incremental)
        throw new HttpError(404, 'Incremental not found')

    if (incremental.userId != userId)
        throw new HttpError(401)

    const updatedIncremental = await incrementalRepository.updateIncremental(incrementalId, title, description, resetFrequency)

    return updatedIncremental
}

export async function deleteIncremental(incrementalId, userId) {

    const incremental = await incrementalRepository.findById(incrementalId)

    if (!incremental)
        throw new HttpError(404, 'Incremental not found')

    if (incremental.userId != userId)
        throw new HttpError(401)

    await incrementalRepository.deleteIncremental(incrementalId)
    return
}

export async function increaseOrDecreaseIncremental(incrementalId, userId, increase) {

    const incremental = await incrementalRepository.findById(incrementalId)

    if (!incremental)
        throw new HttpError(404, 'Incremental not found')

    if (incremental.userId != userId)
        throw new HttpError(401)

    if (increase) {
        await incrementalRepository.updatePositiveCount(incrementalId, parseInt(incremental.positiveCount) + 1)
        return
    }

    await incrementalRepository.updateNegativeCount(incrementalId, parseInt(incremental.negativeCount) + 1)
    return
}

async function reorderIncremental(incrementalId, userId, newPosition) {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const incremental = await incrementalRepository.findById(incrementalId, client)

        if (!incremental)
            throw new HttpError(404, 'Incremental not found')

        if (incremental.userId != userId)
            throw new HttpError(401)

        const incrementals = await incrementalRepository.getIncrementalOrdersByUserId(userId, client)

        if (newPosition > incrementals.length)
            throw new HttpError(400, "'newPosition' should be within the list bounds")

        const reorderedIncrementals = moveItemToPosition(incrementals, incrementalId, newPosition)
        await incrementalRepository.updateIncrementalOrders(reorderedIncrementals, client)
        const updatedIncrementals = await incrementalRepository.getIncrementalOrdersByUserId(userId, client)

        await client.query('COMMIT');

        return updatedIncrementals

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function order(incrementalId, userId, newPosition) {
    if (!Number.isInteger(newPosition) || newPosition < 1)
        throw new HttpError(400, "'newPosition' required and should be a positive integer")

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await reorderIncremental(incrementalId, userId, newPosition)
        } catch (error) {
            if (error.code === '23505' && attempt === 0)
                continue

            if (error.code === '23505')
                throw new HttpError(409, 'Habit order changed. Please try again.')

            throw error
        }
    }
}
