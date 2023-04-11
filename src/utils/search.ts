// index.js

import { type } from "os"
import { db } from "./db"
import { Activity } from "@prisma/client"
import { CloseUser } from "../types/user"


async function findClosestUsers(latitude, longitude, id) {
    const earthRadiusMiles = 3958.8
    const maxDistanceMiles = 10

    const users: CloseUser[] = await db.activity.findMany({
        where: {
            latitude: {
                gte: latitude - (maxDistanceMiles / earthRadiusMiles) * (180 / Math.PI),
                lte: latitude + (maxDistanceMiles / earthRadiusMiles) * (180 / Math.PI),
            },
            longitude: {
                gte: longitude - (maxDistanceMiles / earthRadiusMiles) * (180 / Math.PI / Math.cos(latitude * Math.PI / 180)),
                lte: longitude + (maxDistanceMiles / earthRadiusMiles) * (180 / Math.PI / Math.cos(latitude * Math.PI / 180)),
            },
        },
        select: {
            userId: true,
            latitude: true,
            longitude: true,
            song_img: true,
            song_link: true,
            song_name: true,
            song_artist: true,
            user: {
                select: {
                    name: true,
                    profileImage: true,
                    birthdate: true,
                    bio: true,
                }
            },
            updatedAt: true
        }
    })
    type FinalUser = { user: CloseUser; distance: number; }
    let finalUsers: FinalUser[] = []
    users.forEach(user => {

        const distance = haversine(latitude, longitude, user.latitude, user.longitude)
        if (distance <= maxDistanceMiles && user.userId != id) {
            finalUsers.push({ user: user, distance: distance })
        }
    })


    return finalUsers
}


function haversine(lat1, lon1, lat2, lon2) {
    const earthRadiusMiles = 3958.8
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = earthRadiusMiles * c
    return distance
}

function toRadians(degrees) {
    return degrees * Math.PI / 180
}


export { findClosestUsers }