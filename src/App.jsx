
import { Route, Routes } from "react-router-dom"
import Login from "./Pages/Login"
import Home from "./Pages/Home/Home"
import Messages from "./Pages/Home/Messages"

function App() {
  
  return (
    <>
    <Routes>
      <Route element={<Login/>} path="/"></Route>
      <Route  element={<Home/>} path="/home">
        <Route element={<Messages/>} path="messages"></Route>
      </Route>
    </Routes>
    </>
      
  )
}

export default App
