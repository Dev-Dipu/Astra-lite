import React, { useRef } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";

const Snippet = ({ data, userId, className, onContextMenu }) => {
    const { title, language, createdAt, _id, likes } = data;
    const timeAgo = formatDistanceToNowStrict(new Date(createdAt), {
        addSuffix: true,
    });
    const navigate = useNavigate();
    const snippetRef = useRef(null);

    const openSnippet = (id) => {
        navigate(`/editor/snippet/${id}`);
    };

    return (
        <div ref={snippetRef} onContextMenu={(e) => onContextMenu(e, _id)} className="relative">
            <div
                onClick={() => openSnippet(_id)}
                className={`flex bg-[#1e1f26] rounded-[5px] p-2 gap-2.5 text-xl ${className}`}
            >
                <div className="h-14 w-14 overflow-hidden rounded-[5px] flex-shrink-0">
                    <img
                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language}/${language}-original.svg`}
                        alt="icon"
                    />
                </div>
                <div className="flex flex-col justify-between overflow-hidden flex-grow">
                    <div className="flex justify-between items-center">
                        <h1>{title}</h1>
                        {[...likes]?.includes(userId) && <div className="text-sm"><img src={"/images/Heart.svg"} alt="" /></div>}
                    </div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-xs rounded-full px-3 py-[3px] bg-[#444857] w-fit">
                            {data.private ? "Private" : "Public"}
                        </h4>
                        <p className="text-xs">{timeAgo}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Snippet;