import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utility/axios";
import { storage } from "../utility/helperFunctions";
import { toast } from "react-toastify";
import { toastOptions } from "../utility/constants";

const Register = () => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();
    const [phase, setPhase] = useState(1);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        setError("")
        clearErrors();
    }, [phase]);

    const checkUnique = async (field, value) => {
        const { data } = await axios.get(`/services/checkunique/${field}/${value}`)
        return data.data;
    };
    

    // Progress to the next phase
    const nextPhase = async () => {
        clearErrors();
        if (phase === 1) {
            try {
                const fullName = watch("fullname");
                const username = watch("username");
                if (!fullName) {
                    setError("fullname", { message: "Full Name is required" });
                    return;
                }
                if (!username) {
                    setError("username", { message: "Username is required" });
                    return;
                }
                const unique = await checkUnique("username", username);
                if (!unique) {
                    setError("username", { message: "Username already taken" });
                    return;
                }

                setPhase(2);
            } catch (err) {
                setError("username", { message: err });
            }
        } else if (phase === 2) {
            const email = watch("email");
            const password = watch("password");
            const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

            if (!email) {
                setError("email", { message: "Email is required" });
                return;
            }
            if (!password) {
                setError("password", { message: "Password is required" });
                return;
            }
            if (!passwordRegex.test(password)) {
                setError("password", {
                    message:
                        "Password must be at least 8 characters, include one capital letter, and one symbol.",
                });
                return;
            }
            try {
                const unique = await checkUnique("email", email);
                if (!unique) {
                    setError("email", { message: "Email already taken" });
                    return;
                }

                setPhase(3);
            } catch (err) {
                setError("email", { message: err });
            }
        }
    };

    // Handle avatar upload preview
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            setValue("avatar", file);
        }
    };

    // Submit form data
    const registerUser = (dets) => {
        const formData = new FormData();
        Object.entries(dets).forEach(([key, value]) => formData.append(key, value));
    
        axios.post("/users/register", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(({ data }) => {
            if (data.success) {
                const { accessToken } = data.data;
                storage.set("accessToken", accessToken);
                toast.success(data.message, toastOptions)
                navigate("/snippets");
            }
        })
        .catch((err) => {
            console.error(err);
            navigate("/register");
        });
    };
    

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col text-xl w-[440px]">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl mb-3">Register</h1>
                    {/* Progress Bar */}
                    <div className="flex items-center my-5 gap-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center gap-4">
                                <span
                                    className={`w-4 h-4 rounded-full border-[3.5px] ${
                                        phase >= step
                                            ? "bg-[#27E0B3] border-[#fff]"
                                            : "border-[#8a8a8a]"
                                    }`}
                                ></span>
                                {step < 3 && (
                                    <span
                                        className={`block w-20 h-[2px] ${
                                            phase > step
                                                ? "bg-[#27E0B3]"
                                                : "bg-[#8a8a8a]"
                                        }`}
                                    ></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={"/"}
                        className="text-[#0084fd] hover:text-[#0084fd]/95 cursor-pointer"
                    >
                        Already have an account
                    </Link>
                </div>

                <form
                    onSubmit={handleSubmit(registerUser)}
                    className="flex flex-col my-10 gap-10 relative"
                    encType="multipart/form-data"
                >
                    {/* Phase 1: Full Name and Username */}
                    {phase === 1 && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                autoComplete="off"
                                {...register("fullname")}
                                className="text-white placeholder:text-[#8a8a8a] p-2 pl-3 w-full bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                            />

                            <input
                                type="text"
                                placeholder="Username"
                                autoComplete="off"
                                {...register("username")}
                                className="text-white placeholder:text-[#8a8a8a] p-2 pl-3 w-full bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                            />

                            <button
                                type="button"
                                onClick={nextPhase}
                                className="text-[#0c0c0c] bg-[#27E0B3] py-2 px-8 rounded-full self-end font-semibold"
                            >
                                Next
                            </button>
                        </>
                    )}

                    {/* Phase 2: Email and Password */}
                    {phase === 2 && (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                {...register("email")}
                                className="text-white placeholder:text-[#8a8a8a] p-2 pl-3 w-full bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                {...register("password")}
                                className="text-white tracking-[6px] placeholder:text-[#8a8a8a] placeholder:tracking-normal p-2 pl-3 w-full bg-transparent outline-none border-b border-[#8a8a8a] focus:border-white"
                            />

                            <button
                                type="button"
                                onClick={nextPhase}
                                className="text-[#0c0c0c] bg-[#27E0B3] py-2 px-8 rounded-full self-end font-semibold"
                            >
                                Next
                            </button>
                        </>
                    )}

                    {/* Phase 3: Avatar Upload */}
                    {phase === 3 && (
                        <>
                        <div className="flex items-center justify-between">
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="text-white p-2 pl-3 w-2/3 bg-transparent"
                            />
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="w-16 h-16 rounded-md mt-4"
                                />
                            )}
                            </div>
                            <button
                                type="submit"
                                className="text-[#0c0c0c] bg-[#27E0B3] py-2 px-8 rounded-full self-end font-semibold"
                            >
                                Submit
                            </button>
                        </>
                    )}
                    <div className="absolute bottom-2 left-2 text-red-500 text-sm w-3/4">
                       {
                        Object.values(errors).flatMap((error) =>
                            error.message? error.message : []
                        ).join(" and ") ||
                            ""
                       }
                    </div>
                </form>
                <div className="flex items-center gap-4 mb-10">
                    <span className="block w-full bg-[#8a8a8a] h-[1px]"></span>
                    <h3>Or</h3>
                    <span className="block w-full bg-[#8a8a8a] h-[1px]"></span>
                </div>
                <Link
                    to={`${import.meta.env.VITE_AUTH_GOOGLE}`}
                    className="flex items-center justify-center gap-4 border border-[#8a8a8a] hover:border-white py-3 rounded-full cursor-pointer transition-all ease duration-300"
                >
                    <img
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                        className="w-6"
                    />
                    <h2 className="text-2xl">Continue with Google</h2>
                </Link>
                {/* <div className="flex items-center justify-center gap-4 border border-[#8a8a8a] opacity-60 py-3 rounded-full cursor-pointer transition-all ease duration-300 grayscale">
                    <img
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                        className="w-6"
                    />
                    <h2 className="text-2xl">Continue with Google</h2>
                </div> */}
            </div>
        </div>
    );
};

export default Register;
