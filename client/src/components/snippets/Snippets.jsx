import React, { useContext, useEffect, useState, useRef } from "react";
import Snippet from "./Snippet";
import ExploreSnippet from "./ExploreSnippet";
import axios from "../../utility/axios";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import NewSnippetForm from "./NewSnippetForm";
import { UserContext } from "../../context/Context";
import { storage } from "../../utility/helperFunctions";

const Snippets = () => {
    const [snippets, setSnippets] = useState([]);
    const { user } = useContext(UserContext);

    const [page, setPage] = useState(1); // Current page
    const [hasMore, setHasMore] = useState(false);

    const [exploreSnippets, setExploreSnippets] = useState([]);
    const [articles, setArticles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [snippetPanel, setSnippetPanel] = useState(false);

    // Context menu state
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [activeSnippet, setActiveSnippet] = useState(null);

    const menuRef = useRef(null);

    const features = [
        {
            badge: "New",
            badgeColor: "#27E0B3",
            description: "Ask AI for code review and help",
        },
        {
            badge: "Update",
            badgeColor: "#FFC857",
            description: "Enhanced collaborative coding experience",
        },
        {
            badge: "Beta",
            badgeColor: "#6A6FEA",
            description: "Code autocompletion with AI",
        },
        {
            badge: "Alert",
            badgeColor: "#FF5E5E",
            description: "Scheduled maintenance notifications",
        },
    ];

    useEffect(() => {
        if (!storage.get("articles")) {
            fetch("https://dev.to/api/articles")
                .then((res) => res.json())
                .then((data) => {
                    storage.set("articles", data.slice(0, 30));
                    setArticles(data.slice(0, 30));
                })
                .catch((error) =>
                    console.error("Error fetching articles:", error)
                );
        } else {
            setArticles(storage.get("articles"));
        }

        axios
            .get("/snippets/random")
            .then(({ data }) => {
                setExploreSnippets(data.data);
            })
            .catch((err) =>
                console.error("Failed to fetch explore snippets:", err)
            );

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === 30 - 1 ? 0 : prev + 1));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchSnippets();
    }, [page]);

    const fetchSnippets = () => {
        axios
            .get(`/snippets?page=${page}&limit=8`)
            .then(({ data }) => {
                setSnippets(data.data.snippets);
                setHasMore(data.data.hasMore);
            })
            .catch((err) => console.error("Failed to fetch snippets:", err));
    };

    const prevSlide = () =>
        setCurrentIndex((prev) =>
            prev === 0 ? articles.length - 1 : prev - 1
        );
    const nextSlide = () =>
        setCurrentIndex((prev) =>
            prev === articles.length - 1 ? 0 : prev + 1
        );

    const handleRightClick = (e, snippetId) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setActiveSnippet(snippetId);
        setShowMenu(true);
    };

    const handleLikeToggle = () => {
        axios.post(`/snippets/like/${activeSnippet}`).then(() => {
            fetchSnippets();
        });
        setShowMenu(false);
    };

    const handleUpdate = () => {
        // Update logic here
        // console.log("update feature is remaining...")
        setShowMenu(false);
    };

    const handleDelete = () => {
        axios.delete(`/snippets/${activeSnippet}`).then(() => {
            fetchSnippets();
        });
        setShowMenu(false);
    };

    const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        if (showMenu) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 relative">
            {/* Left Section */}
            <div>
                {/* Recent Snippets */}
                <div className="recentsnippets min-h-96">
                    <div className="head flex items-center justify-between">
                        <div className="flex gap-4">
                            <h1 className="text-3xl">Recent Snippets</h1>
                            <div className="pagination-controls flex justify-center gap-4 mt-1 text-2xl">
                                {page !== 1 && (
                                    <button
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={page === 1}
                                    >
                                        <FaAngleLeft />
                                    </button>
                                )}
                                {hasMore && (
                                    <button
                                        onClick={() =>
                                            setPage(
                                                (prev) => hasMore && prev + 1
                                            )
                                        }
                                        disabled={!hasMore}
                                    >
                                        <FaAngleRight />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <select className="outline-none bg-[#1e1f26] py-2 px-4 rounded-[5px]">
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="all">All</option>
                            </select>
                            <button
                                onClick={() => setSnippetPanel(true)}
                                className="bg-[#1e1f26] hover:brightness-125 px-4 py-2 rounded-[5px]"
                            >
                                New Snippet
                            </button>
                        </div>
                    </div>
                    <div className="snippets mt-4 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        {snippets.length ? (
                            snippets.map((snippet) => (
                                <Snippet
                                    key={snippet._id}
                                    data={snippet}
                                    userId={user?._id}
                                    className={
                                        "hover:scale-[.98] hover:ring-2 hover:ring-white hover:bg-[#0c0c0c] cursor-pointer ease-in-out"
                                    }
                                    onContextMenu={handleRightClick}
                                />
                            ))
                        ) : (
                            <h1 className="text-gray-500">
                                Create your first Snippet
                            </h1>
                        )}
                    </div>
                </div>

                {/* Explore Snippets */}
                <div className="exploresnippets mt-6">
                    <h1 className="text-3xl">Explore Snippets</h1>
                    <div className="snippets mt-4 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        {exploreSnippets &&
                            exploreSnippets.map((snippet) => (
                                <ExploreSnippet
                                    key={snippet._id}
                                    userId={user?._id}
                                    data={snippet}
                                />
                            ))}
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col">
                {/* Feature Updates */}
                <div className="featureupdates">
                    <h1 className="text-3xl mt-1">Feature Updates</h1>
                    <div className="features mt-4 rounded-[5px] bg-[#1E1F26] py-3 px-4 space-y-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="text-xs rounded px-2 py-[2px] font-semibold text-[#1E1F26]"
                                    style={{
                                        backgroundColor: feature.badgeColor,
                                    }}
                                >
                                    {feature.badge}
                                </div>
                                <h2>{feature.description}</h2>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slider */}
                <div className="relative w-full h-full rounded-[5px] overflow-hidden mt-6">
                    <div
                        className="w-full h-full flex transition-transform duration-700"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {articles.map((article, index) => (
                            <div
                                onClick={() =>
                                    window.open(
                                        `${article.url}` ||
                                            `https://dev.to/${article.user.username}/${article.slug}`
                                    )
                                }
                                key={index}
                                className="w-full h-full flex-shrink-0 cursor-pointer bg-cover bg-center relative"
                                style={{
                                    backgroundImage: `url(${
                                        article.cover_image ||
                                        article.social_image
                                    })`,
                                }}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>

                                {/* Title */}
                                <div className="absolute bottom-4 left-4 w-4/5 text-white text-2xl font-semibold">
                                    {article.title}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                        <FaAngleLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                        <FaAngleRight />
                    </button>
                </div>
            </div>

            {/* Snippet Panel */}
            <NewSnippetForm
                isOpen={snippetPanel}
                onClose={() => setSnippetPanel(false)}
            />

            {/* Context Menu */}
            {showMenu && (
                <ul
                    ref={menuRef}
                    className="absolute bg-[#1e1f26] rounded-[5px] text-white shadow-lg border border-gray-600 z-40 -translate-x-1/2 -translate-y-full"
                    style={{ top: menuPosition.y, left: menuPosition.x }}
                >
                    <li
                        className="p-2 hover:bg-gray-700 cursor-pointer"
                        onClick={handleLikeToggle}
                    >
                        {snippets
                            .find((snippet) => snippet._id === activeSnippet)
                            ?.likes.includes(user?._id)
                            ? "Dislike"
                            : "Like"}
                    </li>
                    <li
                        className="p-2 hover:bg-gray-700 cursor-pointer"
                        onClick={handleUpdate}
                    >
                        Update
                    </li>
                    <li
                        className="p-2 hover:bg-gray-700 cursor-pointer"
                        onClick={handleDelete}
                    >
                        Delete
                    </li>
                </ul>
            )}
        </div>
    );
};

export default Snippets;