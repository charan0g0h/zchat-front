import { Route, Routes } from "react-router-dom"
import Login from "./Pages/Login"

function App() {
  
  return (
    <>
    <h1 className="bg-red-500 w-full text-4xl p-2 shadow-md font-serif text-neutral-100 font-extrabold text-center ">Z-CHAT</h1>
    <Routes>
      <Route element={<Login/>} path="/"></Route>
  </Routes>
    </>
      
  )
}

export default App
