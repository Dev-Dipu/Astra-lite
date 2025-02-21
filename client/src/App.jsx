import React from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import Signin from "./pages/Signin";
import Register from "./pages/Register";
import User from "./pages/User";
import Snippets from "./components/snippets/Snippets";
import SnippetEditor from "./components/snippets/SnippetEditor";
import Profile from "./pages/Profile";
import Documentation from "./pages/Documentation";
import ErrorPage from "./pages/ErrorPage"
import { ToastContainer } from "react-toastify"
import UnderDevelopment from "./components/Partials/UnderDevelopment";


const App = () => {

    return (
        <div onContextMenu={(e)=>e.preventDefault()} className="bg-[#0C0C0C] text-white min-h-screen h-screen  select-none">
            <Routes>
                <Route path="/" element={<Signin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<Profile/>} />
                <Route path="/docs" element={<Documentation/>} />
                <Route path="/editor">
                    <Route path="snippet/:id" element={<SnippetEditor />} />
                </Route>
                <Route path="/" element={<User />}>
                    <Route path={"snippets"} element={<Snippets />} />
                    <Route path={"pixelpen"} element={<UnderDevelopment/>} />
                    <Route path={"workspace"} element={<UnderDevelopment/>} />
                </Route>
                <Route path="*" element={<ErrorPage/>} />
            </Routes>
            <ToastContainer/>
        </div>
    );
};

export default App;
