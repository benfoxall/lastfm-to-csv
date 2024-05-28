import type { LastFMUserGetRecentTracksParams, LastFMUserGetRecentTracksResponse } from "lastfm-ts-api";

// this has been public for like 10 years
const API_KEY = '974a5ebc077564f72bd639d122479d4b'

// type only because api doesn't support browser
// https://github.com/scriptex/lastfm-ts-api/issues/30
// import { LastFMUser } from 'lastfm-ts-api';
// const api = new LastFMUser('974a5ebc077564f72bd639d122479d4b')


export function getRecentTracks(
    params: LastFMUserGetRecentTracksParams,
): Promise<LastFMUserGetRecentTracksResponse> {

    const qp = new URLSearchParams(Object.entries(params).map(([key, val]) => ([key, String(val)])))

    qp.set('method', 'user.getrecenttracks')
    qp.set('format', 'json')
    qp.set('api_key', API_KEY)

    qp.set('limit', '20')
    
    // random for debugging
    qp.set('page', Math.ceil(Math.random() * 1000).toString())
    

    return fetch(`https://ws.audioscrobbler.com/2.0/?${qp}`)
        .then(r => r.json())

}



// https://ws.audioscrobbler.com/2.0/?
// method=user.getrecenttracks&
// user=benjaminf&
// api_key=974a5ebc077564f72bd639d122479d4b&
// limit=10&
// page=300&
// format=json&
// from=1706933168
