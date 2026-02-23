import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import * as userRepository from '../repositories/user.repository.js'
import * as todoRepository from '../repositories/todo.repository.js'
import * as incrementalRepository from '../repositories/incremental.repository.js'
import * as dailyRepository from '../repositories/daily.repository.js'
import pool from '../database/config.js'

import HttpError from '../errors/HttpError.js'

function generateToken(id) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    })
    return token;
}

export async function synchronizeHabits(userId, habits) {
    const { dailyHabits, todos, incrementalHabits} = habits;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const [createdDailies, createdTodos, createdIncrementals] = await Promise.all([
            dailyRepository.bulkCreateDailies(userId, dailyHabits, client),
            todoRepository.bulkCreateTodos(userId, todos, client),
            incrementalRepository.bulkCreateIncrementals(userId, incrementalHabits, client)
        ]);
        
        await client.query('COMMIT');
        
        return {
            dailies: createdDailies,
            todos: createdTodos,
            incrementals: createdIncrementals
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function create(username, password) {
    
    const exists = await userRepository.getByUsername(username)
    
    if(exists) throw new HttpError(409, 'User already exists')
   
    const hashedPassword = await hash(password, 10);
    const { password: _, ...userWithoutPassword } = await userRepository.createUser(username, hashedPassword)
    const token = generateToken(userWithoutPassword.id)
        
    return { user: userWithoutPassword, token }

}

export async function login(username, password) {
    
    const user = await userRepository.getByUsername(username)
    
    if(!user) throw new HttpError(400, "Incorrect 'password' or 'username'")
   
    const { password: hashedPassword, ...userWithoutPassword } = user
    const isPasswordCorrect = await compare(password, hashedPassword)

    if(!isPasswordCorrect) throw new HttpError(400, "Incorrect 'password' or 'username'")
    
    const token = generateToken(userWithoutPassword.id)
    
    return { user: userWithoutPassword, token }

}

export async function startNewDay(userId) {

    const [yesterdayDailies, incrementalsUpdates, deletedTodos] = await Promise.all([
        dailyRepository.getYesterdayDailies(userId),
        incrementalRepository.resetIncrementals(userId),
        todoRepository.deleteTodosOlderThan7Days(userId),
        userRepository.updateLastDailyResetDate(userId)
    ])

    const dailiesUpdates = await Promise.all(yesterdayDailies.map(async (daily) => {
        if(daily.done) {
            return await dailyRepository.updateDailyDoneAndStreak(daily.id, daily.streak)
        } else {
            return await dailyRepository.updateDailyDoneAndStreak(daily.id, 0)
        }
    }))

    return {dailiesUpdates, incrementalsUpdates, deletedTodos}
}

export async function deleteUserByUserId(userId) {
    const isDeleted = await userRepository.deleteUser(userId)
    if(!isDeleted) throw new HttpError(404)
    return
}

export async function getAllDataFromUser(userId) {
    const [dailies, todos, incrementals, user] = await Promise.all([
        dailyRepository.getDailiesByUserId(userId),
        todoRepository.getTodosByUserId(userId),
        incrementalRepository.getIncrementalsByUserId(userId),
        userRepository.getById(userId)
    ])
    return {user, dailies, todos, incrementals}
}