import express from "express";
import { authenticateToken } from "../middlewares/Auth";
import validator from "validator"
import UploadPhoto from "../utils/image";
import { db } from "../utils/db";
import { getTopArtists, getCurrentSong, getSpotifyToken, checkTokenandRefresh, CheckandGetSong } from "../utils/spotify";
import { userDataComplete } from "../utils/user";
import { findClosestUsers } from "../utils/search";
import { FinalUser } from "../types/user"
const router = express.Router();

router.get("/", authenticateToken, (req: any, res, next) => {
    if (req.user) {
        const { id, email, profileImage, name, bio, birthdate } = req.user
        const NewData = { id, email, profileImage, name, bio, birthdate }
        if (userDataComplete(req.user)) {
            res.json({ msg: "OK", user: NewData });
        } else {
            res.json({ msg: "newUser", user: NewData });
        }


    }
});



router.post('/newUserdata', authenticateToken, async (req: any, res, next) => {
    if (req.user) {
        // console.log(req.user)
        let imageURL = ""
        if (req.body.image == '' || validator.isURL(req.body.image)) {
            imageURL = req.body.image
        } else {
            console.log("base64")
            try {
                const link = await UploadPhoto(req.body.image)
                imageURL = link
            } catch (e) {
                imageURL = ""
            }

        }
        console.log(imageURL)
        try {

            const userdata = await db.user.update({
                where: { id: req.user.id }, data: {
                    profileImage: imageURL,
                    name: req.body.name,
                    bio: req.body.bio,
                    birthdate: req.body.birthday
                }
            })
            console.log(userdata)
            res.json({ msg: "OK" })
        } catch (e) {
            res.status(500)
        }

    }
})



router.post('/spotify', authenticateToken, async (req: any, res, next) => {
    if (req.user) {

        try {

            const userdata = await db.user.update({
                where: { id: req.user.id }, data: {
                    spotifyId: req.body.token,
                }
            })
            console.log(userdata)
            res.json({ msg: "OK" })
        } catch (e) {
            res.status(500)
        }

    }
})



router.get("/closeUsers", authenticateToken, async (req: any, res, next) => {
    try {

        const Userlocation = await db.activity.findFirst({
            where: {
                userId: req.user.id
            }
        })
        if (Userlocation?.latitude && Userlocation.longitude) {
            // find the closest useres to the user location
            const CloseUsers = await findClosestUsers(Userlocation?.latitude, Userlocation.longitude, req.user.id)


            if (CloseUsers) {
                // get the cuttent playing song for each user
                const find = async (userdata: FinalUser) => {
                    // const song = await getCurrentSong(user.userId)
                    const data = await CheckandGetSong(userdata)

                    return data
                }


                var actions = CloseUsers.map(find);
                var results = await Promise.all(actions);
                let filteredresults = results.filter((data) => {
                    return data
                })
                // console.log(filteredresults)
                res.json({ msg: "OK", users: filteredresults })
            } else {
                res.json({ msg: "OK", users: [] })
            }
        } else {
            res.json({ "msg": "ERROR" })
        }

    } catch (e) {
        res.json({ "msg": "ERROR" })
    }
})

router.get("/getCurrentSong", authenticateToken, async (req: any, res, next) => {
    try {


        const CurrentSong = await getCurrentSong(req.user.id)
        res.json({ msg: "OK", data: CurrentSong })

    } catch (e) {
        res.json({ msg: "error" })
    }
})
router.get("/getTopArtists", authenticateToken, async (req: any, res, next) => {
    try {
        const token = await checkTokenandRefresh(req.user.id)
        if (token) {
            const topSongs = await getTopArtists(token)
            res.json({ msg: "OK", data: topSongs })
        } else {
            res.json({ msg: "error" })
        }
    } catch (e) {
        res.json({ msg: "error" })
    }


})


router.post("/location", authenticateToken, async (req: any, res, next) => {
    const { latitude, longitude } = req.body
    try {

        const user = await db.activity.update({
            where: {
                userId: req.user.id
            }, data: {
                latitude: latitude,
                longitude: longitude
            },
        })
        res.json({ "msg": "OK" })
    } catch (e) {
        res.status(500)
    }
})

router.post("/Liked", authenticateToken, async (req: any, res, next) => {
    const { id } = req.body
    try {

        const LikeRec = await db.like.findFirst({
            where: {
                fromId: req.user.id,
                toId: id
            }
        })
        if (LikeRec) {
            return res.json({ like: true })
        } else {
            return res.json({ like: false })
        }
    } catch (e) {
        console.log("ERROR IN CHECK LIKE")
        res.status(500)
    }
})
router.post("/sendLike", authenticateToken, async (req: any, res, next) => {
    const { id } = req.body
    try {
        const LikeRec = await db.like.create({
            data: {
                fromId: req.user.id,
                toId: id,
            }
        })
        res.json({ msg: "OK" })

    } catch (e) {
        console.log("ERROR IN SEND LIKE")
        res.status(500)
    }
})

router.post("/UnLike", authenticateToken, async (req: any, res, next) => {
    const { id } = req.body
    try {
        const LikeRec = await db.like.findFirst({
            where: {
                fromId: req.user.id,
                toId: id,
            },
        })
        if (LikeRec) {
            await db.like.delete({
                where: {
                    id: LikeRec.id
                }
            })
        }
        res.json({ msg: "OK" })

    } catch (e) {
        console.log("ERROR IN SEND LIKE")
        res.status(500)
    }
})

export default router