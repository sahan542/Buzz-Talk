import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from "lodash/uniqBy";

export default function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const {username,id} = useContext(UserContext);
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
        const messageData = JSON.parse(ev.data);
        console.log({ev,messageData});
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        }
        else if('text' in messageData){
            setMessages(prev => ([...prev, {...messageData}]));
        }
        /*
        e.data.text().then(messageString => {
            console.log(messageString);
        });
        */
    }

    function sendMessage(ev){
        ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev => ([...prev,
            {text: newMessageText, 
             sender: id,
             recipient: selectedUserId,
             id: Date.now(),
            }]));
    }

    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id]; // Corrected line
   // console.log({onlinePeopleExclOurUser});

   const messagesWithoutDupes = uniqBy(messages, 'id');
    


    return(
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 pl-4 pt-4">
                <Logo/>
                {Object.keys(onlinePeopleExclOurUser).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)} className={`border-b border-gray-400 flex gap-2 cursor-pointer ${userId === selectedUserId ? 'bg-blue-300' : ''}`}>
                        {userId === selectedUserId && (
                            <div className="w-1 bg-blue-600 h-12 rounded-r-md"></div>
                        )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                            <Avatar username={onlinePeople[userId]} userId={userId} />
                            <span className="text-gray-800">{onlinePeople[userId]}</span>
                        </div>

                       
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-300 w-2/3 p-4">
                <div className="flex-grow">
                    
                    {!selectedUserId && (
                        <div className="flex h-full flex-grow items-center justify-center">
                            <div className="text-gray-800">&larr; Select a person from the slidebar</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full" >
                            <div className="overflow-y-scroll absolute inset-0">
                                {messagesWithoutDupes.map(message => (
                                    <div className={(message.sender === id ? 'text-right' : 'text-left')} key={id}>
                                        <div className={"text-left inline-block p-2 my-2 rounded-lg text-sm " +(message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                        sender:{message.sender} <br/>
                                        my id: {id} <br/>
                                        {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                    <input type="text" 
                           value={newMessageText}
                           onChange={ev => setNewMessageText(ev.target.value)}
                           placeholder="Type your message here" 
                           className="bg-white p-2 flex-grow border rounded-sm" />
                    <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    </button>
                </form>
                )}
                
            </div>
        </div>
    )
}