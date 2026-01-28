
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
        return res.status(200).json({ 'message': "login with success", user, token })
    } catch (err) {
        console.log(err)
        return res.status(err.status).json({ 'message': err.message })
    }
}

async function create(req, res) {
    try {
        const { username, password } = req.body
        const user = await userService.create(username, password)
        const token = generateToken(user.id)
        return res.status(201).json({ 'message': "user created with success", user, token })
    } catch (err) {
        console.log(err)
        return res.status(err.status).json({ 'message': err.message })
    }

}

export {
    login,
    create
}