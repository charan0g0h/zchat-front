import { useEffect, useRef, useState } from "react"
import SockJS from "sockjs-client"
import { Stomp } from "@stomp/stompjs"

function Messages(){
    
    const clientref = useRef()
    const chatref = useRef()
    const [allChats, setAllChats] = useState(new Map())
    const [usernames, setUsernames] = useState([])
    const [profiles , setprofiles] = useState([])
    const [selectedUser, setSelectedUser] = useState({username : null , email : null , fullname : null})
    const [text , setText] = useState("")
    const [search , setSearch] = useState("")
    const [searchprofile , setsearchprofile] = useState(null)

    useEffect(() => {
        const sortedUsers = Array.from(allChats.entries())
            .sort((a, b) => {
                const lastMsgA = a[1][a[1].length - 1];
                const lastMsgB = b[1][b[1].length - 1];
                return new Date(lastMsgB.sentDate) - new Date(lastMsgA.sentDate);
            })
            .map(([username]) => username);
        setUsernames(sortedUsers);
    }, [allChats]);

    useEffect(() => {
        async function getprofiles(){
            const response = await fetch("http://localhost:8080/getallprofiles",{
                method : "POST",
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem("jwt"),
                    "Content-Type":"application/json"
                },
                body : JSON.stringify(usernames)
            })
            const data = await response.json()
            setprofiles(data)
        }
        if(usernames.length > 0){
            getprofiles()
        }
    },[usernames])

    useEffect(() => {
        if(chatref.current){
            chatref.current.scrollTop = chatref.current.scrollHeight
        }
    },[allChats,selectedUser])

    useEffect(() => {
        async function fetchChats(){
            const response = await fetch("http://localhost:8080/getallchats", {
                headers : {
                    "Authorization" : "Bearer " + localStorage.getItem("jwt")
                }
            });
            const data = await response.json();
            const chatMap = new Map(Object.entries(data));
            console.log(chatMap)
            setAllChats(chatMap);
        }
        fetchChats();
    }, []);
    
    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/chat");
        const client = Stomp.over(socket)
        clientref.current = client
        client.connect({
            "Authorization" : "Bearer " + localStorage.getItem("jwt")
        },() => {
            client.subscribe(
                "/user/queue/messages",
                (msg) => {
                     const newMessage = JSON.parse(msg.body);
                    setAllChats((prev) => {
                        const updated = new Map(prev);
                        const otherUser = newMessage.fromUsername;
                        const oldMessages = updated.get(otherUser) || [];
                        updated.set(otherUser, [
                            ...oldMessages,
                            newMessage
                        ]);
                        return updated;
                    });
                })
           
        })
        
        return () => {
        client.disconnect();
        }
    },[])

    function send(){
        const msg = {
        toUsername: selectedUser.username,
        message: text,
        sentDate: new Date()
        };
        console.log("before send")
        clientref.current.send(
            "/app/private-message",
            {},
            JSON.stringify(msg)
        );
        console.log("after send")
        setAllChats((prev) => {
            const updated = new Map(prev);
            const oldMessages = updated.get(selectedUser.username) || [];
            updated.set(selectedUser.username, [
                ...oldMessages,
                msg
            ]);

            return updated;
        });
        setText("")
    }

    async function searchop(username){
        const response = await fetch("http://localhost:8080/search/"+username,{
            headers : {
                "Authorization" : "Bearer " + localStorage.getItem('jwt')
            },
        })
        const data = await response.json()
        setsearchprofile(data)
        setSearch("")
    }
    return(
        <> 

            <div className="flex w-full  ">
                <div className="w-170 h-140  shadow-md">
                    <div className="w-full bg-neutral-50  h-20  shadow-md p-6 ">
                        <h1 className=" text-center text-2xl font-bold font-sans text-orange-600">Chats</h1>
                    </div>
                    <div className="w-full h-full flex flex-col p-4 bg-neutral-200">
                        <div className="flex border-2 items-center  bg-neutral-50 rounded-3xl border-orange-700">
                            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-l-3xl  h-10 text-center"placeholder="search chat"></input>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" onClick={() => {searchop(search)}} className="size-6 mx-2">
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {searchprofile != null && <>
                            <div 
                                key={searchprofile.username}
                                onClick={() => setSelectedUser({username : searchprofile.username ,fullname : searchprofile.fullname, email : searchprofile.email})}
                                className="w-full min-h-15 flex border-b-2 gap-4 hover:cursor-pointer items-center p-4 bg-white rounded-2xl">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                    className="size-12 text-orange-300"> 
                                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="font-bold">{searchprofile.username}</h1>
                                    <h2 className="font-sans">{searchprofile.email}</h2>
                                </div>
                            </div>
                        </>} 
                            {profiles.map((profile) => {
                                return(
                                    <div 
                                        key={profile.username}
                                        onClick={() => setSelectedUser({username : profile.username ,fullname : profile.fullname, email : profile.email})}
                                     className="w-full min-h-15 flex gap-4 items-center p-4 bg-white rounded-2xl">
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                            className="size-12 text-orange-300"> 
                                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="font-bold">{profile.username}</h1>
                                            <h2 className="font-sans">{profile.email}</h2>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>    
                </div>
                <div className="w-full">
                    {
                        selectedUser.username == null && <div className="w-full h-full flex flex-col justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                            className="size-60 text-orange-700">
                        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                        </svg>
                        <h1 className="font-bold text-2xl">End to End Encrypted</h1>
                        <h2>build trusts</h2>
                        </div>
                    }
                    { selectedUser.username != null && 
                            <div className=" w-full flex flex-col h-160 border-l-2 bg-neutral-100">
                    <div className="w-full flex gap-4 items-center p-4  h-20 bg-orange-100">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                            className="size-16 text-orange-400">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-bold text-3xl">{selectedUser.username || "username"}</h1>
                            <h2 className="font-sans">{selectedUser.email || "email@gmail.com"}</h2>
                        </div>
                    </div>
                    <div className="w-full p-8  flex flex-col h-full rounded-b-4xl">
                    <div ref={chatref} className=" w-full  flex flex-col h-full gap-2 overflow-y-auto rounded-b-4xl">
                        {
                            (allChats.get(selectedUser.username)|| []).map((message) => {
                                if(message.fromUsername == selectedUser.username){
                                    return (
                                        <div className="w-full h-15  flex">
                                            <div className="p-4 w-fit flex h-15 gap-2 bg-purple-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                                className="size-6 text-neutral-800">
                                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                                                </svg>
                                                <h1 className="font-bold">{message.message}</h1>
                                            </div>
                                        </div>
                                    )
                                }else{
                                    return (
                                        <div className="w-full h-15 justify-end flex">
                                            <div className="p-4 w-fit flex  h-15 gap-2 bg-pink-100">
                                                <h1 className="font-bold">{message.message}</h1>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                                className="size-6 text-neutral-800">
                                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                                                </svg>
                                                
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                    <div className="w-full h-15 border-2 rounded-3xl flex gap-2 items-center  border-neutral-200 bg-white ">
                            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="enter message" className="w-full h-full rounded-l-3xl font-bold text-center"></input>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" onClick={send} className="size-8 mx-1 hover:cursor-pointer">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                    </div>
                    </div>
                </div>
                }
                </div>
                
            </div>    
        </>
    )
    }

export default Messages