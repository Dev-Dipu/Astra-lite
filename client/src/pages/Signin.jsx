import React, { useEffect } from "react";
import {useForm} from "react-hook-form";
import axios from "../utility/axios";
import { Link, useNavigate } from "react-router-dom";
import { storage } from "../utility/helperFunctions";

const Signin = () => {
    const {register, handleSubmit} = useForm();
    const navigate = useNavigate();
    

    const loginUser = dets => {
        axios.post("/users/login", dets)
        .then(({data}) => {
            if(data.success){
                const {accessToken} = data.data;
                storage.set("accessToken", accessToken);
                navigate("/snippets");
            }
        })
        .catch(err => {
            console.log(err);
            navigate("/");
        });
    }
    
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col text-xl">
                <h1 className="text-4xl mb-3">Sign In</h1>
                <div className="flex gap-2">
                    <h3 className="text-[#8a8a8a]">New User?</h3>
                    <Link to={"/register"} className="text-[#0084fd] hover:text-[#0084fd]/95 cursor-pointer">
                        Create an account
                    </Link>
                </div>
                <form className="flex flex-col my-10 gap-10" onSubmit={handleSubmit(loginUser)}>
                    <input
                        type="text"
                        placeholder="Email"
                        autoComplete="off"
                        required
                        {...register("email")}
                        className="text-white placeholder:text-[#8a8a8a] p-2 pl-3 w-[440px] bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        {...register("password")}
                        className="text-white tracking-[6px] placeholder:text-[#8a8a8a] placeholder:tracking-normal p-2 pl-3 w-[440px] bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                    />
                    <button
                        className="text-[#0c0c0c] bg-[#27E0B3] w-fit py-2 px-8 rounded-full self-end font-semibold"
                        type="submit"
                    >
                        Continue
                    </button>
                </form>
                <div className="flex items-center gap-4 mb-10">
                    <span className="block w-full bg-[#8a8a8a] h-[1px]"></span>
                    <h3>Or</h3>
                    <span className="block w-full bg-[#8a8a8a] h-[1px]"></span>
                </div>
                <Link to={`${import.meta.env.VITE_AUTH_GOOGLE}`} className="flex items-center justify-center gap-4 border border-[#8a8a8a] hover:border-white py-3 rounded-full cursor-pointer transition-all ease duration-300">
                    <img
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                        className="w-6"
                    />
                    <h2 className="text-2xl">Continue with Google</h2>
                </Link>
            </div>
        </div>
    );
};

export default Signin;
