import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

    async function handleSubmit(ev){
        ev.preventDefault();  
        const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        try{
            const {data} = await axios.post(url, {
                username,
                password,
            }, { withCredentials: true});
        setLoggedInUsername(username);
        setId(data.id);
        }
        catch(error){
            console.error("Error Registering :", error);
        }
    }
    return(
        <div className="bg-blue-400 h-screen flex items-center">
            <form className="w-80 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={username} 
                        onChange={ev => setUsername(ev.target.value)} 
                        type="text" placeholder="username" 
                        className="block w-full rounded-md p-3 mb-5 border"/>
                <input value={password} 
                        onChange={ev => setPassword(ev.target.value)}
                        type="password" placeholder="password" 
                        className="block w-full rounded-md p-3 mb-5 border"/>
                <button className="bg-blue-500 text-white block w-full rounded-md p-2 mt-2 mb-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className="text-center mt-3">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member?&nbsp; 
                            <button onClick={() => setIsLoginOrRegister('login')}>
                                <b>Login here</b>
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Dont have an account?&nbsp; 
                            <button onClick={() => setIsLoginOrRegister('register')}>
                                <b>Register here</b>
                            </button>
                        </div>
                    )}

                </div>
            </form>

        </div>
    );
}