import { randomUUID } from 'crypto'
import { hash, compare } from 'bcrypt'

import * as userRepository from '../repositories/user.repository.js'
import HttpError from '../errors/HttpError.js'

export async function create(username, password) {
    
    const exists = await userRepository.findByUsername(username)
    
    if(exists) throw new HttpError(409, 'User already exists')
   
    const hashedPassword = await hash(password, 10);
    return await userRepository.createUser(randomUUID(), username, hashedPassword)

}

export async function login(username, password) {
    
    const user = await userRepository.findByUsername(username)
    
    if(!user) throw new HttpError(400, 'Incorrect "password" or "username"')
   
    const { password: hashedPassword, ...userWithoutPassword } = user
    const isPasswordCorrect = await compare(password, hashedPassword)

    if(!isPasswordCorrect) throw new HttpError(400, 'Incorrect "password" or "username"')
    
    return userWithoutPassword

}

export async function deleteUserByUserId(userId) {
    const isDeleted = await userRepository.deleteUser(userId)
    if(!isDeleted) throw new HttpError(404)
    return
}

export async function getAllDataFromUser(userId) {
    const [dailies, todos, incrementals] = await Promise.all([
        userRepository.getDailiesByUserId(userId),
        userRepository.getTodosByUserId(userId),
        userRepository.getIncrementalsByUserId(userId)
    ])
    return {data : {dailies, todos, incrementals}}
}