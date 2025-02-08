import React, {useState} from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { runtimes } from "../../utility/constants";

const LanguageDropdown = ({language}) => {

    
    const [selectedOption, setSelectedOption] = useState(runtimes[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (runtime) => {
        setSelectedOption(runtime);
        language(runtime.language)
        setIsOpen(false); // Close dropdown
    };

    return (
        <div className="relative w-full">
            {/* Selected Option */}
            <div
                className="flex items-center justify-between p-2 pr-4 bg-[#1e1f26] rounded-md text-white text-xl cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <img
                        className="h-10 w-10 object-cover rounded-md"
                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${selectedOption.language}/${selectedOption.language}-original.svg`}
                        alt="language icon"
                    />
                    <span>
                        {selectedOption.language.charAt(0).toUpperCase()+selectedOption.language.slice(1)} ({selectedOption.version})
                    </span>
                </div>
                <span >{isOpen ? <FaAngleUp/> : <FaAngleDown/>}</span>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <ul className="absolute w-full bg-[#1e1f26] border border-gray-700 rounded-md mt-2 z-10 max-h-48 overflow-y-auto">
                    {runtimes.map((runtime, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#2a2b33] cursor-pointer"
                            onClick={() => handleOptionClick(runtime)}
                        >
                            <img
                                className="h-8 w-8 object-cover rounded-md"
                                src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${runtime.language}/${runtime.language}-original.svg`}
                                alt="icon"
                            />
                            <span>
                                {runtime.language.charAt(0).toUpperCase()+runtime.language.slice(1)} ({runtime.version})
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageDropdown;
