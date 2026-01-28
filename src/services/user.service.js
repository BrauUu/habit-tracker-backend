import { randomUUID } from 'crypto'
import { hash, compare } from 'bcrypt'

import { createUser, findByUsername } from '../repositories/user.repository.js'
import HttpError from '../errors/HttpError.js'

export async function create(username, password) {
    
    const exists = await findByUsername(username)
    
    if(exists) throw new HttpError(409, 'User already exists')
   
    const hashedPassword = await hash(password, 10);
    return createUser(randomUUID(), username, hashedPassword)

}

export async function login(username, password) {
    
    const user = await findByUsername(username)
    
    if(!user) throw new HttpError(400, 'Incorrect "password" or "username"')
   
    const { password: hashedPassword, ...userWithoutPassword } = user
    const isPasswordCorrect = await compare(password, hashedPassword)

    if(!isPasswordCorrect) throw new HttpError(400, 'Incorrect "password" or "username"')
    
    return userWithoutPassword

}