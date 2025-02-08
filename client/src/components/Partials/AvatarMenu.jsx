import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "../../utility/axios";
import { UserContext } from "../../context/Context";
import { FaUser, FaSignOutAlt, FaBook, FaCommentDots, FaMedal } from "react-icons/fa";
import { storage } from "../../utility/helperFunctions";

const AvatarMenu = () => {
    const [menu, toggleMenu] = useState(false);
    const { user } = useContext(UserContext);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                toggleMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuOptions = [
        { icon: FaUser, label: "Account",
            onClick: () => {
                window.location.href = "/account";
            },
         },
        { icon: FaBook, label: "Documentation" },
        { icon: FaCommentDots, label: "Feedback" },
        {
            icon: FaSignOutAlt,
            label: "Logout",
            onClick: () => {
                axios.post("/users/logout").then(() => {
                    window.location.href = "/";
                    storage.remove("accessToken");
                    storage.clear();
                });
            },
        },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={() => toggleMenu(!menu)} className="overflow-hidden rounded-[5px] cursor-pointer">
                {user?.avatar && <img src={user.avatar} alt="avatar" className="h-12 w-12 object-cover rounded-[5px]" />}
            </div>
            <div
                className={`${
                    !menu ? "h-0 before:w-0" : "before:w-12"
                } cursor-pointer absolute right-0 top-full overflow-hidden min-w-48 bg-[#1E1F26] rounded-[5px] shadow-xl transition-all ease-in before:h-0.5 before:bg-[#27E0B3] before:absolute before:top-0 before:right-0 before:transition-all before:ease-in mt-1 rounded-tr-none z-50`}
            >
                <div className="p-4 border-b border-gray-700">
                    <div className="flex gap-1.5 items-center">
                    <div className="text-white text-sm">{user?.username}</div>
                    <FaMedal className="inline-block text-xs text-[#d66b4b] drop-shadow-[0_0_6px_rgba(93,64,55,0.6)]" />


                    </div>
                    <div className="text-gray-500 text-xs">{user?.email}</div>
                </div>
                {menuOptions.map((option, index) => (
                    <div
                        key={index}
                        className="option cursor-pointer py-2.5 px-4 hover:bg-[#8a8a8a]/10 flex items-center"
                        onClick={option.onClick}
                    >
                        <option.icon className="mr-2" />
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvatarMenu;