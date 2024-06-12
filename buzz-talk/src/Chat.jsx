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
    const {username,id,setId,setUsername} = useContext(UserContext);
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

    function sendMessage(ev, file=null){
        if(ev){
            ev.preventDefault();
        }
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
        }));
        setNewMessageText('');
        setMessages(prev => ([...prev,
            {text: newMessageText, 
             sender: id,
             recipient: selectedUserId,
             id: Date.now(),
            }]));
            if(file){
                axios.get('/messages/'+selectedUserId).then(res => {
                    setMessages(res.data);
                }); 
            }
    }

    function sendFile(ev){
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,

            });
        };
    }

    function logout(){
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        });
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
            <div className="bg-blue-100 w-1/3 pl-4 pt-4 flex flex-col relative h-full mb-4">
                <div className="flex-grow overflow-y-scroll absolute top-0 right-0 left-0 bottom-2">

              
                    <Logo/>
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
                                    online={false}
                                    />
                            ))}

                
                    <div className="p-2 text-center flex items-center justify-center">
                        <span className="mr-2 text-sm text-gray-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" fillRule="evenodd" />
                                </svg>
                             <b>{username}</b></span>
                        <button onClick={logout} className="text-sm text-white bg-blue-600 p-2 border rounded-lg">Logout</button>
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
                                            {message.file && (
                                                <div>
                                                    <a target="_blank"
                                                        href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                        {message.file}
                                                    </a>
                                                </div>
                                            )}
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
                    <label type="button" className="bg-blue-500 p-2 text-white rounded-xl cursor-pointer">
                        <input type="file" className="hidden" onChange={sendFile} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                        </svg>

                    </label>
                    <button type="submit" className="bg-blue-500 p-2 text-white rounded-xl">
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