import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login(){
    const [username , setUsername] = useState("")
    const [password , setPassword] = useState("")
    const [failed,setFailed] = useState("")
    const nav = useNavigate()

    async function login(e){
        e.preventDefault()
        const response = await fetch("http://localhost:8080/auth/login",{
            method : "POST",
            headers : {
                "Content-Type" : "application/json",  
            },
            body : JSON.stringify({username : username ,
                password : password
            })
        })
        const data = await response.json();
        console.log(data)
        if(data.code == 0){
            localStorage.setItem('jwt',data.description)
            nav('home/messages')
        }else {
            setFailed(data.description)
        }
    }

    return(
        <>
            <div className="w-full h-full bg-neutral-300">
                <div className="w-full h-20 flex justify-between shadow-md bg-white items-center p-4">
                    <div className="w-fit flex gap-4 h-full">
                        <div className=" rounded-full bg-orange-600 w-20 flex justify-center  text-4xl font-extrabold text-white shadow-md">Z</div>
                        <div className="text-4xl font-extrabold">ZChat</div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">create your own worlds</h1>
                    </div>
                </div>
                <div className="w-full h-150 flex justify-center items-center">
                    <div className="h-fit w-150 bg-white rounded-3xl shadow-2xl p-4">
                        <h1 className="text-3xl font-bold font-sans text-center">Log in</h1>
                        <div className="p-3 flex gap-2 justify-center">
                            <span className="font-mono font-semibold">new to Zchat?</span>
                            <span className="font-mono font-semibold text-orange-700">sign up now</span>
                        </div>
                        <form onSubmit={login} className="w-full p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-4 border-2 pr-3 rounded-2xl ">
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className=" rounded-l-2xl w-full border-r-2 h-12 text-2xl text-center"
                                 placeholder="Username" ></input>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-4 border-2 pr-3 rounded-2xl ">
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-l-2xl w-full border-r-2  h-12 text-2xl text-center" 
                                placeholder="password" ></input>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </div>
                            <h1 className="font-semibold text-orange-700">forget password?</h1>
                            <h1 className="text-red-500 font-bold">{failed}</h1>
                            <button type="submit" className="bg-red-500 text-2xl font-extrabold rounded-3xl text-white p-2">Log In</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login