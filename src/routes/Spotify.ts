import express from "express";
const router = express.Router();
import { authenticateToken } from "../middlewares/Auth";
import axios from "axios";
import { db } from "../utils/db";



router.post("/savetoken", authenticateToken, async (req: any, res: any, next) => {
    console.log(req.body)
    if (req.body.code) {

        try {

            const datares = await axios.post("https://accounts.spotify.com/api/token", {
                code: req.body.code,
                redirect_uri: "demo:///",
                grant_type: 'authorization_code'
            }, {
                headers: { 'Authorization': 'Basic ' + (Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')), "Content-Type": "application/x-www-form-urlencoded" },

            })
            // console.log(datares.data)
            console.log("im herrrrr", datares.data)

            if (datares.data.access_token) {
                const { access_token, refresh_token } = datares.data
                const record = await db.spotifyToken.create({
                    data: {
                        access_token,
                        refresh_token,
                    }
                })
                console.log(record)
                const userdata = await db.user.update({
                    where: {
                        id: req.user.id
                    },
                    data: {
                        spotifyTokensId: record.id
                    }
                })
                console.log(userdata)
                res.json({ msg: "OK" })

            } else {
                res.json({ msg: "error" })
            }
        } catch (e: any) {
            console.log("error", e)
            res.json({ msg: "error" })
        }
    }


})





export default router