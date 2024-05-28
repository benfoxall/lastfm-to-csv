import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import React from "react";

export const App = () => {
    const users = useLiveQuery(() => db.users.toArray());

    return <>
        <h1>Last.fm to csv <small>(v2)</small></h1>
        <hr />
        <p>This fetches data from the lastfm api, and formats it as a csv document</p>

        <ul>
        {users?.map(row => 
        <li key={row.user}>
            
            <button onClick={e => db.users.delete(row.user)}>&times;</button> {row.user} 
            
            
    
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
