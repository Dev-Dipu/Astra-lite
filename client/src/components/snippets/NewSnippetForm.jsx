import React, { useState, useContext, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaUnlock, FaLock } from "react-icons/fa";
import LanguageDropdown from "./LanguageDropdown"; // Import the LanguageDropdown component
import { UserContext } from "../../context/Context"; // Adjust the path as per your project
import axios from "../../utility/axios";

const NewSnippetForm = ({ isOpen, onClose }) => {
    const { user } = useContext(UserContext);
    const [isPublic, setIsPublic] = useState(true);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [language, setlanguage] = useState("bash");

    const togglePrivacy = () => setIsPublic((prev) => !prev);

    useEffect(() => {
        setTitle("");
        setError("");
    }, [])
    

    const handleCreateSnippet = () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setError(""); // Clear error if any
        // Handle snippet creation logic here
        axios.post("/snippets", {
            title,
            language,
            private: !isPublic,
            createdBy: user._id
        })
        .then(res => {
            console.log(res.data);
            onClose(); // Close the panel
            setTitle(""); // Clear the title
            // open snippet editor with the new snippet id
            window.location.href = `/editor/snippet/${res.data?.data?._id}`;
        })
        .catch(err => {
            console.log(err);
        });
    };

    return (
        isOpen && (
            <div className="fixed top-0 left-0 h-full w-full z-50 bg-black bg-opacity-65 flex items-center justify-center">
                <div className="border-[#1e1f26] bg-[#0C0C0C] border-[3px] h-fit w-1/3 rounded-[5px]">
                    {/* Header */}
                    <div className="px-4 py-3 flex justify-between items-center border-b-[3px] text-xl border-[#1e1f26] text-white">
                        <h1>New Snippet</h1>
                        <button
                            onClick={onClose}
                            className="font-bold px-2 py-1 text-xl rounded-[3px] bg-[#1e1f26] hover:bg-red-600"
                        >
                            <IoClose />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3">
                        {/* Language Selector */}
                        <div className="flex flex-col gap-2 w-3/4">
                            <label className="text-xl text-white">Language</label>
                            <LanguageDropdown language={setlanguage} />
                        </div>

                        {/* Title Input */}
                        <div className="flex mt-4">
                            <div className="flex flex-col gap-2 w-full">
                            <label className="text-xl text-white">Title</label>
                            <div className="flex gap-3 items-center">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="px-4 py-3 bg-[#1e1f26] rounded-[5px] text-white outline-none text-xl w-full"
                                placeholder="Enter snippet title"
                                required
                            />
                            <button
                                onClick={togglePrivacy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-[5px] text-white text-lg transition ${
                                    isPublic
                                        ? "bg-[#27E0B3] hover:brightness-110"
                                        : "bg-[#DC143C] hover:brightness-110"
                                }`}
                            >
                                {isPublic ? <FaUnlock /> : <FaLock />}
                                {isPublic ? "Public" : "Private"}
                            </button>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            </div>
                            
                        </div>


                        {/* Owner Section */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex flex-col w-full gap-2">
                          <label className="text-xl">Owner</label>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-[5px] overflow-hidden bg-amber-400">
                                    <img
                                        className="h-full w-full object-cover"
                                        src={user.avatar}
                                        alt="avatar"
                                    />
                                </div>
                                <h1 className="text-xl text-white">{user.username}</h1>
                            </div>
                            <button
                                onClick={handleCreateSnippet}
                                className="bg-[#1e1f26] px-4 py-2 rounded-[5px] text-white text-lg hover:brightness-110"
                            >
                                Create
                            </button>
                            </div>
                          </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default NewSnippetForm;
