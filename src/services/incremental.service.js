import * as incrementalRepository from '../repositories/incremental.repository.js'
import HttpError from '../errors/HttpError.js'
import pool from '../database/config.js'

export async function createIncremental(userId, title, description, resetFrequency, order) {
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

export async function order(incrementalId, userId, oldPosition, newPosition) {

    const client = await pool.connect();

    const incremental = await incrementalRepository.findById(incrementalId)

    if (!incremental)
        throw new HttpError(404, 'Incremental not found')

    if (incremental.userId != userId)
        throw new HttpError(401)

    try {
        await client.query('BEGIN');

        const incrementalsToBeReordered = await incrementalRepository.getIncrementalsToBereordered(userId, oldPosition, newPosition, client)
        
        const [otherIncrementals, actualIncremental] = await Promise.all([
            incrementalRepository.reorderOtherIncrementals(incrementalsToBeReordered, oldPosition, newPosition, client),
            incrementalRepository.reorderActualIncremental(incrementalId, newPosition, client)
        ])

        await client.query('COMMIT');

        return [...otherIncrementals, ...actualIncremental]

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
