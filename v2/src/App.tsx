import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import React from "react";
import { getRecentTracks } from "./api";


export const App = () => {
    const users = useLiveQuery(() => db.users.toArray());

    return <>
        <h1>Last.fm to csv <small>(v2)</small></h1>
        <hr />
        <p>This fetches data from the lastfm api, and formats it as a csv document</p>


        <ul>
        {users?.map(row => 
        <li key={row.user}>
            <User user={row.user} />
        </li>)}
        </ul>

        <form onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const user = data.get("username")
            if(typeof user === 'string') {
                db.users.add({user})
            }
        }}>
            <input name="username" placeholder="lastfm username" />
            <button>Add user</button>
        </form>
    </>
}


function User({user}: {user: string}) {

    const count = useLiveQuery(() => db.tracks.where({_user: user}).count());

    function load() {

        getRecentTracks({
            user
        }).then(re => {
            
            console.log("Response", re)

            return db.tracks.bulkAdd(
                re.recenttracks.track.map(track => ({
                    _date: parseInt(track.date.uts),
                    _user: user,
                    ...track
                }))
            ).then((i) => {
                console.log("success", i)
            }, e => {
                console.error("error", e)
            })

        })

    }

    async function remove() {
        await db.tracks.where({_user: user}).delete()
        await db.users.delete(user)
    }

    return <section>
        <h4>{user}</h4>

        <button onClick={remove}>&times; remove</button>
            
            <br />
            <button onClick={() => load()}>load tracks</button>

            <p>{count || 0}</p>

            <br /><br />

    </section>

}
