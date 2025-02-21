import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../../utility/axios";
import Snippet from "./Snippet";
import AvatarMenu from "../Partials/AvatarMenu";
import { FaAngleLeft, FaPlay, FaAngleDown } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { IoIosCloud, IoMdSettings } from "react-icons/io";
import CodeMirror from "@uiw/react-codemirror";
import {
    abcdef,
    abyss,
    androidstudio,
    andromeda,
    atomone,
    aura,
    basicDark,
    basicLight,
    bbedit,
    bespin,
    copilot,
    darcula,
    dracula,
    duotoneDark,
    duotoneLight,
    eclipse,
    githubDark,
    githubLight,
    gruvboxDark,
    gruvboxLight,
    kimbie,
    material,
    materialDark,
    materialLight,
    monokai,
    monokaiDimmed,
    noctisLilac,
    nord,
    okaidia,
    quietlight,
    red,
    solarizedDark,
    solarizedLight,
    sublime,
    tokyoNight,
    tokyoNightDay,
    tokyoNightStorm,
    tomorrowNightBlue,
    vscodeDark,
    whiteDark,
    whiteLight,
    xcodeDark,
    xcodeLight,
} from "@uiw/codemirror-themes-all";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import executeCode from "../../utility/executeCode";
import { debounce, downloadCode } from "../../utility/helperFunctions";
import { UserContext } from "../../context/Context";
import { runtimes } from "../../utility/constants";
import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa";
import { formatDistanceToNowStrict } from "date-fns";
import { RiBardFill } from "react-icons/ri";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import { askAI } from "../../utility/askAI";
import ReactMarkdown from "react-markdown";

const languageExtensions = {
    javascript,
    python,
    java,
    cpp,
    go,
    php,
    rust,
};

const editorThemes = {
    Abcdef: abcdef,
    Abyss: abyss,
    "Android Studio": androidstudio,
    Andromeda: andromeda,
    "Atom One": atomone,
    Aura: aura,
    "Basic Dark": basicDark,
    "Basic Light": basicLight,
    BBEdit: bbedit,
    Bespin: bespin,
    Copilot: copilot,
    Darcula: darcula,
    Dracula: dracula,
    "Duotone Dark": duotoneDark,
    "Duotone Light": duotoneLight,
    Eclipse: eclipse,
    "GitHub Dark": githubDark,
    "GitHub Light": githubLight,
    "Gruvbox Dark": gruvboxDark,
    "Gruvbox Light": gruvboxLight,
    Kimbie: kimbie,
    Material: material,
    "Material Dark": materialDark,
    "Material Light": materialLight,
    Monokai: monokai,
    "Monokai Dimmed": monokaiDimmed,
    "Noctis Lilac": noctisLilac,
    Nord: nord,
    Okaidia: okaidia,
    "Quiet Light": quietlight,
    Red: red,
    "Solarized Dark": solarizedDark,
    "Solarized Light": solarizedLight,
    Sublime: sublime,
    "Tokyo Night": tokyoNight,
    "Tokyo Night Day": tokyoNightDay,
    "Tokyo Night Storm": tokyoNightStorm,
    "Tomorrow Night Blue": tomorrowNightBlue,
    "VS Code Dark": vscodeDark,
    "White Dark": whiteDark,
    "White Light": whiteLight,
    "Xcode Dark": xcodeDark,
    "Xcode Light": xcodeLight,
};

const SnippetEditor = () => {
    const { user } = useContext(UserContext);
    const [snippet, setSnippet] = useState(null);
    const location = useLocation();
    const { state } = location;
    const { id } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [autosave, setAutosave] = useState(false);
    const [languageExtension, setLanguageExtension] = useState(javascript);
    const [theme, setTheme] = useState(editorThemes.Dracula); // Default theme
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState(""); // Mock terminal input
    const [output, setOutput] = useState(""); // Mock terminal output
    const [fontSize, setFontSize] = useState(16); // Default font size
    const [fontStyle, setFontStyle] = useState("monospace"); // Default font style
    const [saveMoreOption, setSaveMoreOption] = useState(false);
    const [like, setLike] = useState([]);
    const [query, setQuery] = useState("");
    const [aiResponse, setAiResponse] = useState({});

    const handleThemeChange = (event) => {
        const selectedTheme = editorThemes[event.target.value];
        setTheme(selectedTheme);
    };

    const handleFontSizeChange = (event) => {
        setFontSize(Number(event.target.value));
    };

    const handleFontStyleChange = (event) => {
        setFontStyle(event.target.value);
    };

    const handleRunCode = async () => {
        setShowSettings(false);
        const res = await executeCode(snippet, code, input);

        // Mock terminal output
        setOutput(`${snippet.title} ~\n${res?.stderr || res?.stdout}`);
    };

    const saveCode = () => {
        axios
            .patch(`/snippets/save/${id}`, { code })
            .then(() => {
                console.log("Code saved successfully.");
            })
            .catch((err) => {
                console.error("Error saving code:", err);
            });
    };

    const [isLoadingAI, setIsLoadingAI] = useState(false); // Loading state for AI response

    const handleAI = async (event) => {
        if ((event.key === "Enter" && query.trim() !== "") || event.type === "click") {
            setIsLoadingAI(true); // Start loading
            try {
                const res = await askAI(
                    event.type === "click" ? "explain" : "generate",
                    snippet?.language,
                    code,
                    event.type === "click" ? setQuery("explain me") && query : query
                );
                console.log(res);
                setAiResponse(res);
            } catch (error) {
                console.error("Error fetching AI response:", error); // Handle errors
            } finally {
                setIsLoadingAI(false); // Stop loading, even if there's an error
                setQuery("");
            }
        }


    };

    useEffect(() => {
        axios
            .get(`/snippets/${id}`)
            .then(({ data }) => {
                setSnippet(data.data);
                setCode(data.data.code);
                setLike(data.data.likes);
            })
            .catch((err) => console.log(err));
    }, [id]);

    useEffect(() => {
        if (snippet?.language) {
            (snippet.language === "cplusplus" || snippet.language === "c") &&
                setLanguageExtension(cpp);

            const langExt = languageExtensions[snippet.language];
            if (langExt) setLanguageExtension(langExt);
        }
    }, [snippet]);

    useEffect(() => {
        const debouncedSave = debounce(saveCode, 2500); // Debounce delay of 2.5 seconds

        if (autosave) {
            const autosaveInterval = setTimeout(() => {
                debouncedSave();
            }, 5000);

            return () => clearInterval(autosaveInterval); // Cleanup interval on component unmount
        }
    }, [code]);

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(".cm-editor > .cm-scroller");
        if (editor !== null) {
            editor.style.fontFamily = `${fontStyle}, monospace`;
        }
    }, [fontStyle]);

    useEffect(() => {
        aiResponse?.code && setCode(aiResponse?.code);
    }, [aiResponse]);

    return (
        <div className="p-6 h-screen flex flex-col">
            <header className="flex justify-between items-center mb-4">
                <div className="w-80 flex gap-[2px]">
                    <div
                        onClick={() => navigate(-1)}
                        className="bg-[#1e1f26] flex items-center justify-center rounded-tl-[5px] rounded-bl-[5px] px-0.5 cursor-pointer active:scale-95"
                    >
                        <FaAngleLeft />
                    </div>
                    {snippet && (
                        <div
                            className={`flex bg-[#1e1f26] rounded-[5px] p-2 gap-2.5 text-xl rounded-tl-none rounded-bl-none flex-grow`}
                        >
                            <div className="h-14 w-14 overflow-hidden rounded-[5px] flex-shrink-0">
                                <img
                                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${snippet?.language}/${snippet?.language}-original.svg`}
                                    alt="icon"
                                />
                            </div>
                            <div className="flex flex-col justify-between flex-grow overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h1>{snippet?.title}</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs rounded-full px-3 py-[3px] bg-[#444857] w-fit">
                                        {user?._id === snippet?.createdBy
                                            ? snippet?.private
                                                ? "Private"
                                                : "Public"
                                            : "@" + state?.createdBy}
                                    </h4>

                                    <p className="text-xs">
                                        {formatDistanceToNowStrict(
                                            new Date(snippet?.createdAt),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRunCode}
                        className="flex items-center justify-center gap-2 bg-[#1e1f26] h-fit px-5 py-2.5 rounded-[5px]"
                    >
                        <FaPlay className="leading-none flex items-center justify-center" />
                        Run
                    </button>
                </div>
                <div className="flex gap-5 items-center justify-end min-w-[350px]">
                    {user?._id === snippet?.createdBy ||
                    snippet?.canAccess?.includes(user?._id) ? (
                        <div className="flex gap-[2px] relative">
                            <button
                                onClick={saveCode}
                                className="flex items-center justify-center gap-2 bg-[#1e1f26] h-fit px-5 py-2.5 rounded-[5px] rounded-tr-none rounded-br-none"
                            >
                                <IoIosCloud />
                                Save
                            </button>
                            <div
                                onClick={() => {
                                    setSaveMoreOption(!saveMoreOption);
                                }}
                                className="bg-[#1e1f26] rounded-tr-[5px] rounded-br-[5px] px-0.5 cursor-pointer flex items-center active:scale-95"
                            >
                                <FaAngleDown
                                    className={`scale-90 transition-all ease-in ${
                                        saveMoreOption && "rotate-180"
                                    }`}
                                />
                            </div>
                            {saveMoreOption && (
                                <div className="absolute top-[114%] w-[150%] z-40 right-0 bg-[#1e1f26] p-2 px-3 rounded-[5px] flex flex-col items-center gap-3">
                                    <label className="flex items-center justify-between cursor-pointer gap-1 w-full">
                                        <span
                                            className={`${
                                                !autosave && "text-[#9CA3AF]"
                                            }`}
                                        >
                                            AutoSave
                                        </span>
                                        <input
                                            type="checkbox"
                                            name="canshare"
                                            id="canshare"
                                            checked={autosave}
                                            onChange={(e) =>
                                                setAutosave(e.target.checked)
                                            } // Handle changes properly
                                            className="sr-only peer"
                                        />
                                        <div className="scale-75 relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27E0B3]"></div>
                                    </label>
                                    <button
                                        className="flex justify-between w-full items-center text-gray-400 active:text-white"
                                        onClick={() =>
                                            downloadCode(
                                                snippet?.title
                                                    ?.split(" ")
                                                    .join("_") +
                                                    runtimes?.find(
                                                        (r) =>
                                                            r?.language ===
                                                            snippet?.language
                                                    )?.extension,
                                                code
                                            )
                                        }
                                    >
                                        Download
                                        <FaDownload className="m-2 mr-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-center bg-[#1e1f26] h-fit px-4 py-2.5 rounded-[5px] cursor-pointer transition-all ease-in-out active:scale-90"
                            onClick={(e) => {
                                e.stopPropagation();
                                axios
                                    .post(`/snippets/like/${snippet?._id}`)
                                    .then((response) => {
                                        console.log();
                                        setLike(response.data.data.likes);
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                            }}
                        >
                            {snippet && [...like]?.includes(user?._id) ? (
                                <div className="">
                                    <img
                                        className="h-6"
                                        src={"/images/Heart.svg"}
                                        alt=""
                                    />
                                </div>
                            ) : (
                                <FaRegHeart className="text-2xl scale-75" />
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center justify-center gap-2 bg-[#1e1f26] h-fit px-5 py-2.5 rounded-[5px]"
                    >
                        <IoMdSettings className="leading-none flex items-center justify-center scale-110" />
                        Settings
                    </button>
                    <AvatarMenu />
                </div>
            </header>
            <div className="gap-4 flex-grow flex overflow-y-auto">
                <div className="rounded-[5px] overflow-hidden w-[76%] relative">
                    {
                        code && <button className="bg-[#0c0c0c] text-sm h-fit px-3 py-1.5 rounded-[5px] absolute z-50 top-0 right-0 m-2.5 opacity-80 hover:opacity-100" onClick={handleAI} >
                        Explain me
                    </button>
                    }
                    <CodeMirror
                        className="h-full cmeditor"
                        value={code}
                        height="100%"
                        extensions={[languageExtension].filter(Boolean)}
                        onChange={(value) => setCode(value)}
                        theme={theme}
                        style={{
                            fontSize: `${fontSize}px`,
                        }}
                        basicSetup={{
                            lineNumbers: true,
                            lineWrapping: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            foldGutter: true,
                            syntaxHighlighting: true,
                            highlightActiveLine: true,
                            highlightSelectionMatches: true,
                            matchBrackets: true,
                        }}
                    />
                </div>
                <div className="bg-[#1e1f26]/0 w-[24%] h-full rounded-[5px] overflow-hidden relative text-white flex flex-col gap-2">
                    <div>
                        <input
                            type="text"
                            name="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="px-3.5 py-2.5 bg-[#1e1f26] rounded-[5px] text-white outline-none w-full"
                            placeholder="Enter required input"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div>
                        <textarea
                            className="px-3 py-2 mt-2 bg-[#1e1f26] rounded-[5px] text-white outline-none text-base w-full min-h-36 resize-none"
                            placeholder={snippet?.title + " ~"}
                            value={output}
                            disabled
                            required
                        ></textarea>
                    </div>
                    <div className="h-[80vh] rounded-[5px] bg-[#1e1f26] px-3 py-2 flex flex-col justify-between relative overflow-auto">
                        <div className="flex items-center p-0.5 justify-between">
                            <h1 className="flex items-center gap-1.5">
                                <RiBardFill /> Asky
                            </h1>
                        </div>

                        <div className="overflow-auto relative h-full">
                            {!isLoadingAI && (
                                <div
                                    className={`flex flex-col h-full items-center justify-center ${
                                        aiResponse?.readme ? "hidden" : ""
                                    }`}
                                >
                                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                                        Hello, {user?.fullname?.split(" ")[0]}
                                    </h1>
                                </div>
                            )}
                            {/* Relative for positioning */}
                            {isLoadingAI && ( // Show skeleton loader while loading
                                <div className="animate-pulse pt-2 space-y-3">
                                    {[75, 100, 50, 80, 100, 60].map(
                                        (width, index) => (
                                            <div
                                                key={index}
                                                className={`h-4 rounded-md bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 
                                                bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear]`}
                                                style={{ width: `${width}%` }}
                                            ></div>
                                        )
                                    )}

                                    <style>
                                        {`
                                    @keyframes shimmer {
                                      0% { background-position: -200% 0; }
                                      100% { background-position: 200% 0; }
                                    }
                                  `}
                                    </style>
                                </div>
                            )}
                            <div className={`${isLoadingAI ? "hidden" : ""}`}>
                                {" "}
                                {/* Hide content */}
                                <ReactMarkdown className={"h-full"}>
                                    {aiResponse?.readme}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="How can I help you 🤔"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleAI}
                                className={`px-3 py-2 mt-2 rounded-[5px] text-white outline-none text-base w-full transition-all duration-300
          ${
              isLoadingAI
                  ? "bg-[length:200%_200%] animate-gradient-move bg-gradient-to-r from-[#0C0C0C] via-[#3C3C3C] to-[#0C0C0C]"
                  : "bg-[#0C0C0C] pl-10"
          }`}
                            />
                            <style>
                                {`
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-move {
            animation: gradient-move 3s infinite linear;
          }
        `}
                            </style>
                            <PiPaperPlaneRightFill
                                className={`text-2xl absolute top-4 left-2 transition-all duration-1000 ease-in-out
              ${isLoadingAI ? "translate-x-[1200%] opacity-0" : ""}`} // Animated plane
                            />
                        </div>
                    </div>

                    <div
                        className={`absolute top-0 right-0 w-full h-full bg-[#1e1f26] px-4 py-3 transition-transform duration-300 ease-in-out ${
                            !showSettings && "translate-x-[101%]"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl text-white">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="font-bold p-2 text-2xl rounded-md text-white hover:text-zinc-300 transition-colors duration-300"
                                aria-label="Close Settings"
                            >
                                <IoClose />
                            </button>
                        </div>
                        <div className="mt-6">
                            <label className="block text-lg font-medium text-white mb-2">
                                Theme
                            </label>
                            <select
                                onChange={handleThemeChange}
                                className="p-2 rounded-[5px] bg-transparent text-white outline-none border-[3px] cursor-pointer"
                            >
                                {Object.keys(editorThemes).map((themeName) => (
                                    <option
                                        className="bg-[#1e1f26] "
                                        key={themeName}
                                        value={themeName}
                                    >
                                        {themeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-6">
                            <label className="block text-lg font-medium text-white mb-2">
                                Font Size
                            </label>
                            <input
                                type="number"
                                value={fontSize}
                                onChange={handleFontSizeChange}
                                className="p-2 pl-6 rounded-[5px] bg-transparent text-white outline-none border-[3px] w-20"
                            />
                        </div>
                        <div className="mt-6">
                            <label className="block text-lg font-medium text-white mb-2">
                                Font Style
                            </label>
                            <select
                                onChange={handleFontStyleChange}
                                className="p-2 rounded-[5px] bg-transparent text-white outline-none border-[3px] cursor-pointer"
                            >
                                {["monospace", "serif", "sans-serif"].map(
                                    (font) => (
                                        <option
                                            className="bg-[#1e1f26] "
                                            key={font}
                                            value={font.toLowerCase()}
                                        >
                                            {font.charAt(0).toUpperCase() +
                                                font.substring(1)}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnippetEditor;
