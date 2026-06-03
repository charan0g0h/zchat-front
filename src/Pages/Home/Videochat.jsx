import { Stomp } from "@stomp/stompjs";
import Peer from "peerjs"
import { use, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

function Videochat(){
    const peerref = useRef()
    const clientref = useRef()
    const myvideo = useRef()
    const recivedvideo = useRef()  
    const [peerid,setPeerid] = useState(null)
    const [mystream, setMystream] = useState(false)
    const [remote , setRemote] = useState(false)
    const [toUsername,setToUsername] = useState("")
    const [answer,setAnswer] = useState(0)
    const [request,setRequest] = useState(null)
    const [ongoingcall ,setOngoingcall] = useState(null)
    const [seconds, setSeconds] = useState(0);
    const [callrequest , setCallrequest] = useState(false)

    useEffect(() => {
        if (!ongoingcall) return;
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [ongoingcall]);
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    useEffect(() => {
        if(request != null){
            console.log("REQUEST IS RECIVED AND PROCESSING")
            if(answer == 1){
            const data = {
                ...request,
                mode: "IdSent",
                callerId : peerid,
                toUsername : request.fromUsername,
                fromUsername : null
            }
            clientref.current.send("/app/video-call",
                {},
                JSON.stringify(data)
            )
            setOngoingcall(request)
            setRequest(null)
            setAnswer(0)
            }else if(answer == -1){
                const data = {
                    ...request,
                    mode : "RequestReject",
                    toUsername : request.fromUsername,
                    fromUsername : null
                }
                
                clientref.current.send("/app/video-call",
                    {},
                    JSON.stringify(data)
                )
                setRequest(null)
                setAnswer(0)
            }
            
        }
    },[answer,request,peerid])

    useEffect(() => {
        const socket  = new SockJS("https://zchat-production-5d76.up.railway.app/chat")
        const client = Stomp.over(socket)
        clientref.current = client
        console.log("CLIENT CREATED")
        client.connect({
            "Authorization" : "Bearer " + localStorage.getItem('jwt')
        } , () => {
            console.log("CLIENT CONNECTED")
            client.subscribe("/user/queue/videocall",
                (videoCall) => {
                    const data = JSON.parse(videoCall.body)
                    console.log(data)
                    if(data.mode === "IdRequest" ){
                        console.log("peerid" + peerid)
                        setRequest(data)
                        setAnswer(0)
                    }
                    if(data.mode === "IdSent"){
                        callid(data.callerId)
                        setOngoingcall(data)
                    }
                    if(data.mode === "RequestReject"){
                    }
                },
                {}
            )
        })
            return () => {
                client.disconnect()
            }
    },[])

    function requestTimeout(){
        setCallrequest(true)
        setTimeout(() => {
            setCallrequest(false)
        },3000)
    }

    async function clientSend(){
        const videocall = {
            toUsername : toUsername,
            callDate : new Date(),
            mode : "IdRequest"
        }
        console.log("SENDING IDREQUEST")
        clientref.current.send(
            "/app/video-call",
            {},
            JSON.stringify(videocall)
        )
        requestTimeout()
    }

    useEffect(() => {
        var peer = new Peer()
        peer.on('open',function(id){
            setPeerid(id)
            console.log(id)
        })
        peer.on("call", async (call) => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            myvideo.current.srcObject = stream
            await myvideo.current.play()
            setMystream(true)
            call.answer(stream)
            call.on("stream", async (remoteStream) => {
                recivedvideo.current.srcObject = remoteStream
                await recivedvideo.current.play()
                setRemote(true)
            })       
        })
        peerref.current = peer

        return() => {
            peer.destroy()
        }
    },[])

    async function callid(id){
    const stream = await navigator.mediaDevices
          .getUserMedia({video : true , audio : true})
            myvideo.current.srcObject = stream
           await myvideo.current.play()
           setMystream(true)
            const call = peerref.current.call(id, stream)
            call.on('stream' ,async (remotestream) => {
              recivedvideo.current.srcObject = remotestream
             await recivedvideo.current.play()
             setRemote(true)
            })
  }
    return(
        <div className="w-full   h-full">
            <div className=" w-full h-full flex ">
                <div className="basis-240 flex flex-col gap-4  p-4">
                    <div className="bg-white basis-64 flex gap-3 p-4 flex-col items-center rounded-3xl">
                        <h1 className="text-3xl font-extrabold text-orange-600">Start a Call</h1>
                        <h2>Enter a Username to start a Video call</h2>
                        <div className="flex border-2 items-center    border-orange-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <input value={toUsername} onChange={(e) => setToUsername(e.target.value)} className="w-100 h-10 border-l-2 border-orange-700 text-center" placeholder="username"></input>
                        </div>
                        <div className="flex items-center rounded-2xl shadow-md bg-orange-400 justify-center gap-4 h-13 w-50 ">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                            <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                            </svg>
                            <button onClick={clientSend} className="text-white text-2xl font-extrabold">call</button>
                        </div>
                        {callrequest && <h1 className="font-extrabold text-green-500">call request sent </h1>}
                    </div>
                    <div className=" w-full h-1/2 bg-white p-4 flex gap-8 rounded-3xl">
                        <div className="relative border-2 basis-128 max-h-100 max-w-200 rounded-3xl overflow-hidden">
                            {!mystream && (
                                <div className="flex justify-center h-full items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-26">
                                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                                    </svg>
                                </div>
                            )}
                            <video
                                ref={myvideo}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="relative border-2 basis-128 max-h-100 max-w-200 rounded-3xl overflow-hidden">
                            {!remote && (
                                <div className="flex justify-center h-full items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-26">
                                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                                    </svg>
                                </div>
                            )}

                            <video
                                ref={recivedvideo}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
                <div className="basis-120 flex flex-col gap-4 p-2 ">
                    <div className="w-full h-fit p-4 rounded-3xl  flex flex-col bg-neutral-50">
                         <h1 className="text-2xl w-full font-bold text-center">Call details</h1>
                         {ongoingcall ? <>
                         <div className="flex gap-2 p-1 border-b-2 border-neutral-200 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 w-fit ">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                            <h1 className=" w-fit font-bold ">To</h1>
                            <h2 className="flex-1 text-right font-bold pr-8 ">{ongoingcall.toUsername}</h2>
                        </div>
                        <div className="flex gap-2 p-1 border-b-2 border-neutral-200 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 w-fit ">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                            <h1 className=" font-bold w-fit ">from</h1>
                            <h2 className="flex-1 w-full text-right font-bold pr-8 ">{ongoingcall.fromUsername}</h2>
                        </div>
                        <div className="flex gap-2 p-1 border-b-2 border-neutral-200 items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 ">
                            <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                            </svg>
                            <h1 className=" w-fit font-bold ">call type</h1>
                            <h2 className="flex-1 text-right font-bold pr-8 ">video call</h2>
                        </div>
                        <div className="flex gap-2 p-1 border-b-2 border-neutral-200 items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 w-fit ">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                            </svg>
                            <h1 className=" w-fit font-bold ">call duration</h1>
                            <h2 className="flex-1 text-right font-bold pr-8 ">{minutes} : {seconds}</h2>
                        </div>
                         </>  : <div className="h-60 flex flex-col justify-center items-center">
                            <h2>start a call to display details</h2>
                        </div>}
                         
                    </div>
                    <div className="w-full flex-1 rounded-3xl p-4 bg-neutral-50">
                        <h1 className="text-center mb-4 font-bold text-2xl">Call request</h1>
                        {request ? <div className="w-full justify-around items-center flex gap-2 p-2 h-20 border-2 rounded-3xl">
                            <h1 className="text-2xl">{request.fromUsername}</h1>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" onClick={() => setAnswer(1)} className="size-10 text-green-500">
                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" onClick={() => setAnswer(-1)} className="size-10 text-red-500">
                            <path fillRule="evenodd" d="M15.22 3.22a.75.75 0 0 1 1.06 0L18 4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L19.06 6l1.72 1.72a.75.75 0 0 1-1.06 1.06L18 7.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L16.94 6l-1.72-1.72a.75.75 0 0 1 0-1.06ZM1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                            </svg>
                        </div> :
                        <div className="flex h-30 flex-col justify-center items-center">
                            <h2>currently you have no requests</h2>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Videochat