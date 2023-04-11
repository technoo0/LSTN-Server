import jwt from "jsonwebtoken"
import { db } from "../utils/db"

// function generateAccessToken(username) {
//     return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
// }


const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization']
    const token = authHeader

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET as string, async (err: any, user: any) => {


        if (err) return res.sendStatus(403)

        const userData = await db.user.findFirst({
            where: {
                id: user.id
            }, select: {
                id: true,
                email: true,
                profileImage: true,
                name: true,
                bio: true,
                birthdate: true,
                spotifyTokensId: true

            }
        })
        if (userData) {

            req.user = userData
            next()
        } else {
            res.sendStatus(401)
        }


    })
}

export {
    authenticateToken
}