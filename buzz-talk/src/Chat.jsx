import { useContext, useEffect, useRef, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import Contact from "./Contact";

export default function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const {username,id} = useContext(UserContext);
    const divUnderMessages = useRef();
    const [offlinePeople, setOfflinePeople] = useState({});
    useEffect(() =>{
       connectToWs();
    }, []);

    function connectToWs(){
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close', () =>{
            setTimeout(() => {
                console.log('Disconnected.Trying to reconnect.');
                connectToWs();
            }, 1000);
        });
    }

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
        console.log('message sent');
        setMessages(prev => ([...prev,
            {text: newMessageText, 
             sender: id,
             recipient: selectedUserId,
             id: Date.now(),
            }]));
    }

    useEffect(() => {
        const div = divUnderMessages.current;
        if(div){
            div.scrollIntoView({behavior:'smooth', block:'end'});
        }

    }, [messages]);

    useEffect(() =>{
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));

                const offlinePeople = {};
                offlinePeopleArr.forEach(p => {
                    offlinePeople[p._id] = p;
                });
                console.log({offlinePeople,offlinePeopleArr});
            setOfflinePeople(offlinePeople);
        });

    }, [onlinePeople]);

    useEffect(() => {
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then(res => {
                setMessages(res.data);
                console.log(res.data);
            });
        }
    }, [selectedUserId]);

    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id]; // Corrected line
   // console.log({onlinePeopleExclOurUser});

   const messagesWithoutDupes = uniqBy(messages, '_id');
    


    return(
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3 pl-4 pt-4">
                <Logo/>
                <div className="relative h-full mb-4">
                    <div className="overflow-y-scroll absolute top-0 right-0 left-0 bottom-2">
                        {Object.keys(onlinePeopleExclOurUser).map(userId => (
                            <Contact
                                key={userId}
                                id={userId} 
                                username={onlinePeopleExclOurUser[userId]}
                                onClick={() =>setSelectedUserId(userId)}
                                selected={userId === selectedUserId}
                                online={true}
                                />
                        ))}
                        {Object.keys(offlinePeople).map(userId => (
                            <Contact
                                key={userId}
                                id={userId} 
                                username={offlinePeople[userId].username}
                                onClick={() =>setSelectedUserId(userId)}
                                selected={userId === selectedUserId}
                                online={true}
                                />
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col bg-blue-300 w-2/3 p-4">
                <div className="flex-grow">
                    
                    {!selectedUserId && (
                        <div className="flex h-full flex-grow items-center justify-center">
                            <div className="text-gray-800">&larr; Select a person from the slidebar</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                            <div className="relative h-full mb-4" >
                                <div className="overflow-y-scroll absolute top-0 right-0 left-0 bottom-2">
                                    {messagesWithoutDupes.map(message => (
                                        <div className={(message.sender === id ? 'text-right' : 'text-left')} key={message._id}>
                                            <div className={"text-left inline-block p-2 my-2 rounded-lg text-sm " +(message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>

                                            {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="h-12" ref={divUnderMessages}></div>
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