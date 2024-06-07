import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {id} = useContext(UserContext);
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

    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id]; // Corrected line
    console.log({onlinePeopleExclOurUser});
    


    return(
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 pl-4 pt-4">
                <Logo/>
                {Object.keys(onlinePeopleExclOurUser).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)} className={`border-b border-gray-400 py-2 flex gap-2 pl-4 cursor-pointer ${userId === selectedUserId ? 'bg-blue-300' : ''}`}>
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