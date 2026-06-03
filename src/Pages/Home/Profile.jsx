import { useEffect, useState } from "react"

function Profile(){
    const [recent , setRecent] = useState([])
    const [profile , setProfile]  = useState({})
    

    useEffect(() => {
        async function fetchRecent(){
            const response = await fetch("https://zchat-production-5d76.up.railway.app/gethistory",{
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem('jwt')
                }
            })
            const data = await response.json()
            setRecent(data)
        }
        async function fetchProfile(){
            const response = await fetch("https://zchat-production-5d76.up.railway.app/profile",{
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem('jwt')
                }
            })
            const data = await response.json()
            setProfile(data)
        }
        fetchProfile()
        fetchRecent()
    },[])

    return (
        <>
            <div className="w-full flex flex-col  items-center bg-neutral-100 h-full ">
                <h1 className="text-3xl font-extrabold font-mono text-orange-700 ">Profile</h1>
                <div className="w-full  flex-1 flex gap-10 p-4 items-center  bg-neutral-100">
                    <div className="flex-1 flex  h-full items-center justify-end">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-30 text-neutral-400">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-4 grid grid-cols-2 items-center h-full">
                        <div className="w-fit">
                            <h1 className="text-2xl text-neutral-600 font-bold">{profile.username || "username"}</h1>
                            <h1 className="font-sans">username</h1>
                        </div>
                        <div className="w-fit">
                            <h1 className="text-2xl text-neutral-600 font-bold">{profile.fullname || "fullname"}</h1>
                            <h1 className="font-sans">fullname</h1>
                        </div>
                        <div className="w-fit">
                            <h1 className="text-2xl text-neutral-600 font-bold">{profile.email || "email@gmail.com"}</h1>
                            <h1 className="font-sans">email</h1>
                        </div>
                        <div>
                            <h1 className="text-2xl text-neutral-600 font-bold">{profile.creationDate || "13131"}</h1>
                            <h1 className="font-sans">Date of creation</h1>
                        </div>
                    </div>
                </div>
                <div className="flex-8 p-4 flex flex-col w-full border-t-2 bg-neutral-200 ">
                    <h1 className="text-3xl font-bold text-neutral-600">Recent calls</h1>
                    <div className=" w-full h-full flex flex-col gap-5 p-4">
                        {!recent.length && <>
                        <div className="flex h-full gap-4 justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-50 text-orange-700">
                            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
                            </svg>
                            <h1 className="font-extrabold text-2xl text-neutral-500">make some calls to display</h1>
                        </div>
                        </>}
                        {recent.map((call) => {
                            if(call.fromUsername == profile.username){
                                return ( 
                                <div className="w-full h-20 bg-white shadow-2xl justify-around flex items-center p-2 rounded-3xl">
                                    <h1 className="text-2xl  font-bold font-sans">{call.toUsername}</h1>
                                    <h1>{call.toEmail}</h1>
                                    <h1 className="text-2xl">{call.status}</h1>  
                                    <h1>{call.date}</h1>    
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-8 ${call.status === 'Answered' ? "text-green-500" : "text-red-500"}`}>
                                    <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                                    </svg>                  
                                </div>
                            )
                            }else {
                                return(
                                    <div className="w-full h-20 bg-white shadow-2xl justify-around flex items-center p-2 rounded-3xl">
                                        <h1 className="text-2xl  font-bold font-sans">{call.fromUsername}</h1>
                                        <h1>{call.toEmail}</h1>
                                        <h1 className="text-2xl">{call.status}</h1>  
                                        <h1>{call.date}</h1>    
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-8 ${call.status === 'Answered' ? "text-green-500" : "text-red-500"}`}>
                                        <path fillRule="evenodd" d="M19.5 9.75a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l4.72-4.72a.75.75 0 1 1 1.06 1.06L16.06 9h2.69a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )
                            }     
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile