import { User } from "@prisma/client"
import { db } from "./db"



const userExist = async (email: string, provider: string) => {
    const user = await db.user.findFirst({ where: { email, provider } })
    return user
}

const userDataComplete = (user: User) => {
    return user.birthdate && user.spotifyTokensId && user.name
}



const CreateAppleUser = async (email: string, name: string) => {
    try {

        const user = await db.user.create({
            data: {
                name: name,
                email: email,
                provider: "apple"
            },
            select: {
                id: true,
            }
        })
        const activity = await db.activity.create({
            data: {
                userId: user.id
            }
        })
        return user
    } catch (e) {
        console.log(e)
    }
}


const CreateFacebookUser = async (email: string, name: string, profileImage: string) => {
    try {

        const user = await db.user.create({
            data: {
                name,
                email,
                profileImage,
                provider: "facebook"
            },
            select: {
                id: true,
            }
        })
        const activity = await db.activity.create({
            data: {
                userId: user.id
            }
        })
        return user
    } catch (e) {
        console.log(e)
    }
}


const CreateGoogleUser = async (email: string, name: string, profileImage: string) => {
    try {

        const user = await db.user.create({
            data: {
                name,
                email,
                profileImage,
                provider: "google"
            },
            select: {
                id: true,
            }
        })
        const activity = await db.activity.create({
            data: {
                userId: user.id
            }
        })
        return user
    } catch (e) {
        console.log(e)
    }
}


const CreateEmailUser = async (email: string,) => {
    try {

        const user = await db.user.create({
            data: {
                name: "user",
                email,
                provider: "email"
            },
            select: {
                id: true,
            }
        })
        const activity = await db.activity.create({
            data: {
                userId: user.id
            }
        })
        console.log("useererrr", user)
        return user

    } catch (e) {
        console.log(e)
    }
}



export {
    userExist,
    CreateAppleUser,
    CreateFacebookUser,
    CreateGoogleUser,
    CreateEmailUser,
    userDataComplete
}