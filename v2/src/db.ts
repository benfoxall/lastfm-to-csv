import Dexie from 'dexie';
import type {LastFMUserGetRecentTracksResponse} from 'lastfm-ts-api'

type TrackBase = LastFMUserGetRecentTracksResponse['recenttracks']['track'][number]

interface IUser {
    user: string,
}

interface ITrack extends TrackBase {
    _user: string;
    _date: number;
}

class LastFmDB extends Dexie {
    users: Dexie.Table<IUser, string>;
    tracks: Dexie.Table<ITrack, number>;

    constructor (databaseName: string) {
        super(databaseName);
        this.version(1).stores({
            users: 'user',
            tracks: '[_user+_date], _user, _date, mbid, album.mbid',
            // ranges: 'id++, user, from, to',
        });

        this.users = this.table('users');
        this.tracks = this.table('tracks');
    }
}


export const db = new LastFmDB('lastFmData');

