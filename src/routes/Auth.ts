import express from "express";
import { LogUserIn, verifyApple } from "../utils/auth";
import { CreateAppleUser, CreateEmailUser, CreateFacebookUser, CreateGoogleUser, userExist } from "../utils/user";
import axios from "axios";
import { SendEmail } from "../utils/Email";
import { CheckCode, CreateCode } from "../utils/code";
const router = express.Router();


router.get("/", (req, res, next) => {
    res.json({ msg: "OK" });
});

router.post("/checkauth", (req, res, next) => {

})

router.post('/apple', async (req, res, next) => {
    // console.log(req.body)
    const data = await verifyApple(req.body.identityToken)
    console.log(data)
    const user = await userExist(data.email, 'apple')
    if (user) {
        //login logic
        console.log(user)
        res.json({ msg: "login", jwt: await LogUserIn(user.id) });
    } else {
        //create user logic
        const newuser = await CreateAppleUser(data.email, req.body.fullName.givenName)
        if (newuser) {

            res.json({ msg: "newUser", jwt: await LogUserIn(newuser.id) });
        } else {
            res.json({ msg: "error" })
        }

    }

})


router.post('/facebook', async (req, res, next) => {
    //get user data from facebook graph api
    const userInfoResponse = await axios.get(
        `https://graph.facebook.com/me?access_token=${req.body.token}&fields=id,name,picture.type(large),email`
    );
    const userInfo = userInfoResponse.data;

    const user = await userExist(userInfo.email, 'facebook')
    if (user) {
        //login logic
        res.json({ msg: "login", jwt: await LogUserIn(user.id) });
    } else {
        //create user logic
        const newuser = await CreateFacebookUser(userInfo.email, userInfo.name, userInfo.picture.data.url)
        if (newuser) {
            res.json({ msg: "newUser", jwt: await LogUserIn(newuser.id) });
        } else {
            res.json({ msg: "error" })
        }

    }
    console.log(userInfo)
})

router.post('/google', async (req, res, next) => {
    //get user data from facebook graph api
    console.log(req.body)
    const instance = await axios.create({
        baseURL: 'https://www.googleapis.com/userinfo/v2/me',
        timeout: 1000,
        headers: { 'Authorization': 'Bearer ' + req.body.token }
    });
    const userInfoResponse = await instance.get("/");
    const userInfo = userInfoResponse.data;

    const user = await userExist(userInfo.email, 'google')
    if (user) {
        //login logic
        res.json({ msg: "login", jwt: await LogUserIn(user.id) });
    } else {
        //create user logic
        const newuser = await CreateGoogleUser(userInfo.email, userInfo.given_name, userInfo.picture)
        if (newuser) {
            res.json({ msg: "newUser", jwt: await LogUserIn(newuser.id) });
        } else {
            res.json({ msg: "error" })
        }

    }
})


router.post("/email", async (req, res, next) => {
    try {
        const code = await CreateCode(req.body.email)
        if (code) {

            await SendEmail(req.body.email, code)
            res.json({ msg: "OK" })
        } else {
            res.status(401)
        }
    } catch (e) {
        res.status(401)
    }
})

router.post("/code", async (req, res, next) => {
    const code = await CheckCode(req.body.email, req.body.code)
    if (code) {
        const user = await userExist(req.body.email, 'email')
        if (user) {
            //login logic
            res.json({ msg: "login", jwt: await LogUserIn(user.id) });
        } else {
            //create user logic
            const newuser = await CreateEmailUser(req.body.email)
            if (newuser) {
                res.json({ msg: "newUser", jwt: await LogUserIn(newuser.id) });
            } else {
                res.json({ msg: "error" })
            }

        }

    } else {
        res.json({ msg: "wrong_code" })
    }
})


export default router