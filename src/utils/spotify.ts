import axios from "axios";
import { type } from "os";
import { db } from "./db";
import moment from "moment"

const getSpotifyToken = async (uid: string) => {
    const user = await db.user.findFirst({
        where: {
            id: uid
        }, select: {
            spotifyId: true
        }
    })
    return user
}

const RefreshToken = async (refresh_token: string, token_id: string) => {


    const datares = await axios.post("https://accounts.spotify.com/api/token", {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    }, {
        headers: { 'Authorization': 'Basic ' + (Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')), "Content-Type": "application/x-www-form-urlencoded" },

    })
    console.log("refreshed token:", datares.data)

    const newToken = await db.spotifyToken.update({
        where: {
            id: token_id
        },
        data: {
            access_token: datares.data.access_token
        }
    })
    return datares.data.access_token


}

const isMoreThanAnHourAgo = (datec: Date) => {
    // Subtract one hour from the current date and time
    const oneHourAgo = moment().subtract(1, 'hour');

    // Check if a given date is more than an hour ago
    console.log("updateAtdate is ", datec)
    const dateToCheck = moment(datec);
    console.log(dateToCheck.hours(), dateToCheck.minutes())
    console.log(oneHourAgo.hours(), oneHourAgo.minutes())
    const isMoreThanAnHourAgo = dateToCheck.isBefore(oneHourAgo);
    return isMoreThanAnHourAgo
}

const checkTokenandRefresh = async (uid: string) => {
    const data = await getSpotifyToken(uid)
    // console.log("spotify saved data:", data)
    if (data && data.spotifyId) {

        const { access_token, refresh_token, updatedAt, id } = data.spotifyId
        if (isMoreThanAnHourAgo(updatedAt)) {
            // console.log("more than an hour has passed update token")
            const newToken = await RefreshToken(refresh_token, id)
            return newToken
        } else {
            // console.log("u good sending token back")
            return access_token
        }
    } else {
        return Error("no data found")

    }
}



const getCurrentSong = async (token: string) => {
    try {

        const res = await axios("https://api.spotify.com/v1/me/player/currently-playing?market=ES", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            }

        })

        if (res.status == 200) {

            const data = {
                songName: res.data.item.name,
                songImage: res.data.item.album.images[0],
                artist: res.data.item.artists[0].name,
            }
            // console.log("songData", data)
            return data
        } else {
            return {}
        }
    } catch (e) {
        console.log("error in getCurrentsong")
    }
}

const getArtistImage = async (id: string, token: string) => {
    const res = await axios(`https://api.spotify.com/v1/artists/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        }

    })
    return res.data.images[0]
}



const getTopSongs = async (token: string) => {
    try {

        const responese = await axios("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            }

        })
        const TopTracks = responese.data.items
        let finaldata: object[] = []
        TopTracks.forEach(track => {
            finaldata.push({
                trak_name: track.name,
                track_image: track.album.images[0]

            })
        });
        return finaldata
    } catch (e) {
        console.log("top songs error")
        return []
    }

}

//curl -d client_id=$CLIENT_ID -d client_secret=$CLIENT_SECRET -d grant_type=authorization_code -d code=$CODE -d redirect_uri=$REDIRECT_URI https://accounts.spotify.com/api/token



export {
    getCurrentSong, getTopSongs, getSpotifyToken, checkTokenandRefresh
}