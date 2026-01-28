
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import * as userService from "../services/user.service.js";

function generateToken(id) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    })

    return token;
}

async function login(req, res) {
    try {
        const { username, password } = req.body
        const user = await userService.login(username, password)
        const token = generateToken(user.id)
        return res.status(200).json({ user, token })
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

async function create(req, res) {
    try {
        const { username, password } = req.body
        const user = await userService.create(username, password)
        const token = generateToken(user.id)
        return res.status(201).json({ user, token })
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }

}

async function getAllDataFromUser(req, res) {
    try {
        const userId = req.userId
        const data = await userService.getAllDataFromUser(userId)
        return res.status(200).json(data)
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

async function deleteUserByUserId(req, res) {
    try {
        const userId = req.userId
        await userService.deleteUserByUserId(userId)
        return res.sendStatus(200)
    } catch (err) {
        console.log(err)
        if(err.message) return res.status(err.status).json({ 'message': err.message })
        return res.sendStatus(err.status)
    }
}

export {
    login,
    create,
    getAllDataFromUser,
    deleteUserByUserId
}