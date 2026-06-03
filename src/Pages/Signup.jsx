import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Signup(){
    const [profile , setProfile ] = useState({username : null , fullname : null ,email :null ,password:null , confirmpassword :null})
    const [status , setStatus] = useState({code : null , description : null})
    const [warning , setWarning] = useState(false)
    const nav = useNavigate()


    async function createAccount(){
        if(profile.confirmpassword === profile.password){
            const reg = {
                username : profile.username ,
                password : profile.password,
                fullname : profile.fullname,
                email : profile.email
            }
            const response = await fetch("https://zchat-production-5d76.up.railway.app/auth/register",{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                },
                body : JSON.stringify(reg)
            })
            const data = await response.json()
            if(data.code == 0){
                nav("/")
            }
            setStatus(data)
        }else{
            setWarning(true)
        }
    }

    return (
        <>
            <div className="w-full h-screen flex justify-center items-center flex-1 bg-neutral-300">
    <div className="w-150 bg-neutral-100 rounded-[2rem] shadow-2xl p-10">

        <div className="flex flex-col items-center ">
            <div className="w-20 h-10 rounded-full bg-orange-600 flex justify-center items-center text-white text-3xl font-bold">
                Z
            </div>

            <h1 className="text-5xl font-extrabold">Create Account</h1>

            <p className="font-mono text-xl">
                already have an account?
                <Link
                    to="/"
                    className="text-orange-700 ml-2 hover:underline"
                >
                    log in now
                </Link>
            </p>
        </div>

        <div className="mt-5 flex flex-col gap-4">

            <div className="flex border-2 rounded-3xl overflow-hidden h-12">
                <input
                    placeholder="Username"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile , username : e.target.value})}
                    className="flex-1 text-center text-2xl outline-none"
                />
                <div className="w-16 border-l-2 flex justify-center items-center">
                    👤
                </div>
            </div>
            <div className="flex border-2 rounded-3xl overflow-hidden h-12">
                <input
                    placeholder="Fullname"
                    value={profile.fullname}
                    onChange={(e) => setProfile({...profile , fullname : e.target.value})}
                    className="flex-1 text-center text-2xl outline-none"
                />
                <div className="w-16 border-l-2 flex justify-center items-center">
                    👤
                </div>
            </div>
            <div className="flex border-2 rounded-3xl overflow-hidden h-12">
                <input
                    placeholder="Email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile , email : e.target.value})}
                    className="flex-1 text-center text-2xl outline-none"
                />
                <div className="w-16 border-l-2 flex justify-center items-center">
                    📧
                </div>
            </div>

            <div className="flex border-2 rounded-3xl overflow-hidden h-12">
                <input
                    type="password"
                    placeholder="Password"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile , password : e.target.value})}
                    className="flex-1 text-center text-2xl outline-none"
                />
                <div className="w-16 border-l-2 flex justify-center items-center">
                    🔒
                </div>
            </div>

            <div className="flex border-2 rounded-3xl overflow-hidden h-12">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={profile.confirmpassword}
                    onChange={(e) => setProfile({...profile , confirmpassword : e.target.value})}
                    className="flex-1 text-center text-2xl outline-none"
                />
                <div className="w-16 border-l-2 flex justify-center items-center">
                    🔑
                </div>
            </div>
            {warning && <h1 className="text-red-500">password doesn't match</h1>}
            <h1 className="text-red-500">{status.description}</h1>
            <button
            onClick={() => createAccount()}
                className="
                mt-4
                h-12
                bg-orange-600
                text-white
                text-3xl
                font-bold
                rounded-3xl
                hover:bg-orange-700
                transition
                "
            >
                Create Account
            </button>

        </div>
    </div>
</div>
        </>
    )
}

export default Signup