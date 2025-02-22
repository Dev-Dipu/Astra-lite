import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utility/axios';
import {debounce} from '../../utility/helperFunctions' // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [isActive, setIsActive] = useState(false);
    const [searchType, setSearchType] = useState("snippets");
    const [suggestions, setSuggestions] = useState([]);
    const searchInputRef = useRef(null);

    const navigate = useNavigate();

    // Focus search bar on Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleFocus = () => {
        setIsActive(true);
    };

    const handleBlur = (e) => {
        // Only deactivate if the new focus is outside the search bar
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setSuggestions([]);
            setIsActive(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query){
          setSuggestions([]);
          return;
        }

        const endpoint = searchType === "snippets"
            ? `/snippets/search?query=${query}`
            : `/pixelpens/search?query=${query}`;

        try {
            const response = await axios.get(endpoint);
            console.log(response.data.data)
            setSuggestions(response.data.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    // Apply debounce to the handleSearch function
    const debouncedHandleSearch = debounce(handleSearch, 300);

    const openSnippet = (id, createdBy) => {
      navigate(`/editor/snippet/${id}`, {
        state: {
          createdBy
        },
      });
  };

    return (
        <div>
            {isActive && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40" onClick={() => setIsActive(false)}></div>
            )}
            <div className={`relative ${isActive ? 'fixed inset-0 z-50 flex items-center justify-center' : ''}`} onBlur={handleBlur} tabIndex="-1">
                <div className="relative">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search"
                        className={`bg-[#1E1F26] outline-none placeholder:text-[#8a8a8a] px-4 py-2 rounded-[5px] text-xl ${isActive ? 'w-80' : 'w-64'} pr-20 transition-all ease-in-out duration-300`}
                        onFocus={handleFocus}
                        onChange={(e) => debouncedHandleSearch(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 scale-90">
                        <span className='bg-[#2C2D35] text-[#8a8a8a] px-2 py-1 rounded border border-[#3A3B44] text-sm'>Ctrl</span>
                        <span className='bg-[#2C2D35] text-[#8a8a8a] px-2 py-1 rounded border border-[#3A3B44] text-sm'>K</span>
                    </div>
                </div>
                {isActive && (
                    <div className="absolute top-full left-0 mt-2 flex space-x-2 justify-center w-full">
                        <button
                            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${
                                searchType === "snippets"
                                    ? "bg-[#27E0B3] text-white"
                                    : "bg-[#1E1F26] text-gray-400 hover:bg-[#2D2E36]"
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setSearchType("snippets")}
                        >
                            Snippets
                        </button>
                        <button
                            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${
                                searchType === "pixelpen"
                                    ? "bg-[#9327FF] text-white"
                                    : "bg-[#1E1F26] text-gray-400 hover:bg-[#2D2E36]"
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setSearchType("pixelpen")}
                        >
                            PixelPen
                        </button>
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1E1F26] rounded-md shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">
                        {suggestions.map((item, index) => (
                            <div key={index} className="p-2 px-3 border-b border-[#2C2D35] flex items-center gap-2 cursor-pointer hover:bg-[#8a8a8a]/10" onClick={()=>openSnippet(item?._id, item?.createdBy?.username)}>
                                {searchType === "snippets" && (
                                    <>
                                        <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${item?.language}/${item?.language}-original.svg`} alt={item?.language} className="w-8 h-8 rounded-[5px] mr-1" />
                                        <div>
                                            <div className="text-white">{item?.title}</div>
                                            <div className="text-[#8a8a8a] text-sm">Created by {item?.createdBy?.username}</div>
                                        </div>
                                    </>
                                )}
                                {searchType === "pixelpen" && (
                                    <div>
                                        <div className="text-white">{item.title}</div>
                                        <div className="text-[#8a8a8a] text-sm">Created by {item.createdBy}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;