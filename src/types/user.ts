import { Activity, User } from "@prisma/client";
import { type } from "os";

type FinalUser = { user: CloseUser; distance: number; }

type CloseUserData = {
    name: string,
    profileImage: string | null,
    birthdate: Date | null,
    bio: string | null,
}
type CloseUser = {
    userId: string;
    latitude: number | null;
    longitude: number | null;
    song_img: string | null;
    song_link: string | null;
    song_name: string | null;
    song_artist: string | null,
    user: CloseUserData;
    updatedAt: Date;
}

export {
    FinalUser, CloseUser
}

