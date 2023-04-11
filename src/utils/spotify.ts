import axios from "axios";
import { type } from "os";
import { db } from "./db";
import moment from "moment"
import { CloseUser, FinalUser } from "../types/user";

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


    const dateToCheck = moment(datec);

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

const isMoreThanTimeAgo = (datec: Date, time: number) => {
    // Subtract one hour from the current date and time
    const timeAgo = moment().subtract(time, 'minutes');


    const dateToCheck = moment(datec);

    const isMoreThanAgo = dateToCheck.isBefore(timeAgo);
    return isMoreThanAgo
}

//this function finds if the user already have a newly updated song then update it if more than 2 minutes have passed
const CheckandGetSong = async (data: FinalUser) => {
    const TimeSinceLastUpdate = 2
    if (!isMoreThanTimeAgo(data.user.updatedAt, TimeSinceLastUpdate)) {
        console.log("OLD DATA")
        if (data.user.song_name) {

            return {
                song: {
                    songName: data.user.song_name,
                    songImage: data.user.song_img,
                    artist: data.user.song_artist,
                    link: data.user.song_link
                },
                user: data.user.user,
                distance: data.distance
            }
        }
        return null

    } else {
        console.log("NEW DATA")
        const song = await getCurrentSong(data.user.userId)

        if (song) {
            const setuser = await db.activity.update({
                where: {
                    userId: data.user.userId
                }, data: {
                    song_artist: song.artist,
                    song_img: song.songImage,
                    song_name: song.songName,
                    song_link: song.link
                }
            })
            return {
                song,
                user: data.user.user,
                distance: data.distance
            }
        } else {
            const setuser = await db.activity.update({
                where: {
                    userId: data.user.userId
                }, data: {
                    song_artist: "",
                    song_img: "",
                    song_name: "",
                    song_link: ""
                }
            })
            return null
        }
    }
}




const getCurrentSong = async (uid: string) => {
    try {
        const token = await checkTokenandRefresh(uid)
        if (token) {

            const res = await axios("https://api.spotify.com/v1/me/player/currently-playing?market=ES", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                }

            })

            if (res.status == 200) {
                type Song = {
                    songName: string,
                    songImage: string,
                    artist: string,
                    link: string
                }
                const data: Song = {
                    songName: res.data.item.name,
                    songImage: res.data.item.album.images[0].url,
                    artist: res.data.item.artists[0].name,
                    link: res.data.item.preview_url
                }
                // console.log("songData", data)
                return data
            } else {
                return null
            }
        } else {
            return null
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





export {
    getCurrentSong, getTopSongs, getSpotifyToken, checkTokenandRefresh, CheckandGetSong
}