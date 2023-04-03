import express from "express";
import { authenticateToken } from "../middlewares/Auth";
import validator from "validator"
import UploadPhoto from "../utils/image";
import { db } from "../utils/db";
const router = express.Router();

router.get("/", authenticateToken, (req: any, res, next) => {
    if (req.user) {
        console.log(req.user)
        res.json({ msg: "OK", user: req.user });
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

export default router