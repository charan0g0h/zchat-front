
import { Route, Routes } from "react-router-dom"
import Login from "./Pages/Login"
import Home from "./Pages/Home/Home"
import Messages from "./Pages/Home/Messages"
import Videochat from "./Pages/Home/Videochat"
import Profile from "./Pages/Home/Profile"
import Signup from "./Pages/Signup"

function App() {
  
  return (
    <>
    <Routes>
      <Route element={<Login/>} path="/"></Route>
      <Route element={<Signup></Signup>} path="/signup"></Route>
      <Route  element={<Home/>} path="/home">
        <Route element={<Messages/>} path="messages"></Route>
        <Route element={<Videochat/>} path="videochat"/>
        <Route element={<Profile/>} path="profile"></Route>
      </Route>
    </Routes>
    </>
      
  )
}

export default App
