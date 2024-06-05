import axios from "axios";
import { useState } from "react";

export default function Register(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function register(ev){
        ev.preventDefault();  
        try{
            const response = await axios.post('/register', {
                username,
                password,
            }, { withCredentials: true});
            console.log(response.data);
        }
        catch(error){
            console.error("Error Registering :", error);
        }
    }
    return(
        <div className="bg-blue-400 h-screen flex items-center">
            <form className="w-80 mx-auto mb-12" onSubmit={register}>
                <input value={username} 
                        onChange={ev => setUsername(ev.target.value)} 
                        type="text" placeholder="username" 
                        className="block w-full rounded-md p-3 mb-5 border"/>
                <input value={password} 
                        onChange={ev => setPassword(ev.target.value)}
                        type="password" placeholder="password" 
                        className="block w-full rounded-md p-3 mb-5 border"/>
                <button className="bg-blue-500 text-white block w-full rounded-md p-2 mt-2">Register</button>
            </form>

        </div>
    );
}