import jwt from "jsonwebtoken"

export default function auth(req, res, next) {

    const { authorization } = req.headers

    if (!authorization)
        return res.status(401).json({ "message": "field 'authorization' was not provided" });

    const [_, token] = authorization.split(' ');

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                return res.status(401).json({ "message": "invalid token" })

            req.userId = decoded.id
        })
        return next()

    } catch (err) {
        return res.sendStatus(500)
    }
}