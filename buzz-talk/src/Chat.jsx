import { useEffect, useState } from "react"
import Avatar from "./Avatar";

export default function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState([]);
    useEffect(() =>{
        const ws = new WebSocket('ws://localhost:4040');
       setWs(ws);
       ws.addEventListener('message',handleMessage);
    }, []);

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId,username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }
    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data)
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        }
        /*
        e.data.text().then(messageString => {
            console.log(messageString);
        });
        */
    }

    return(
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 pl-4 pt-4">
                <div className="text-blue-600 font-bold flex gap-2 mb-4 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>

                    MernChat
                </div>
                {Object.keys(onlinePeople).map(userId => (
                    <div className="border-b border-gray-400 py-2 flex gap-2">
                        <Avatar username={onlinePeople[userId]} userId={userId} />
                        <span>
                             {onlinePeople[userId]}
                        </span>
                       
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-300 w-2/3 p-4">
                <div className="flex-grow">Messages with selected persons</div>
                <div className="flex gap-2">
                    <input type="text" 
                           placeholder="Type your message here" 
                           className="bg-white p-2 flex-grow border rounded-sm" />
                    <button className="bg-blue-500 p-2 text-white rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}