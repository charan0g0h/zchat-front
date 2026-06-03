import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"

function Home(){
    const nav = useNavigate()
    function logout(){
        localStorage.setItem('jwt',"")
        nav("/")
    }
    
    return(
        <div className="flex flex-col h-screen ">
            <div className="w-full  p-2 flex-1 flex items-center bg-white border-b-2 border-neutral-400 ">
                <div className="w-full  flex justify-between   items-center p-4">
                        <div className="w-fit flex gap-4 h-full">
                            <div className=" rounded-full bg-orange-600 w-20 flex justify-center  text-4xl font-extrabold text-white shadow-md">Z</div>
                            <div className="text-4xl font-extrabold">ZChat</div>
                        </div>
                        <h1 className="text-2xl font-bold">create your own worlds</h1>
                </div>
            </div>
            <div className="w-full h-full flex-8 bg-neutral-300 flex">
                <div className="bg-neutral-100 border-r-2 border-neutral-400 basis-32 shadow-2xl">
                    <ul className="h-full w-full  flex flex-col justify-around items-center">
                        <NavLink to={"/home/messages"} className={ ({ isActive }) => isActive? "bg-neutral-200 p-6 rounded-3xl"  : "" }>
                        <li>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10 text-orange-600 cursor-pointer hover:size-9">
                        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
                        </svg>
                        </li>
                        </NavLink>
                        <NavLink to={"/home/videochat"} className={ ({ isActive }) => isActive? "bg-neutral-200 p-6 rounded-3xl"  : "" }>
                        <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10 text-orange-600 cursor-pointer hover:size-9">
                        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                        </svg>
                        </li>
                        </NavLink>
                        <NavLink to={"/home/profile"} className={ ({ isActive }) => isActive? "bg-neutral-200 p-6 rounded-3xl"  : "" }>
                        <li>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10 text-orange-600 hover:cursor-pointer hover:size-9">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                        </svg>
                        </li>
                        </NavLink>
                        <li onClick={()=>logout()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10 text-orange-600 hover:cursor-pointer hover:size-9">
                            <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                            </svg>
                            <h1>Logout</h1>
                        </li>
                    </ul>
                </div>
                <div className="w-full h-full " ><Outlet></Outlet></div>
            </div>
        </div>
    )
}

export default Home