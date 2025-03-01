import React, { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa6";
import axios from "../../utility/axios";
const ExploreSnippet = ({ data, userId }) => {
    const { title, language, createdAt, createdBy, likes, _id } = data;
    const [like, setLike] = useState([...likes]);

    const timeAgo = formatDistanceToNowStrict(new Date(createdAt), {
        addSuffix: true,
    });

    const navigate = useNavigate();

    const openSnippet = (id) => {
        navigate(`/editor/snippet/${id}`, {
            state: { createdBy: createdBy.username },
        });
    };

    return (
        <div
            onClick={() => openSnippet(_id)}
            className="flex bg-[#1e1f26] rounded-[5px] p-2 gap-2.5 text-xl  hover:scale-[.98] hover:ring-2 hover:ring-white hover:bg-[#0c0c0c] cursor-pointer ease-in-out"
        >
            <div className="h-14 w-14 overflow-hidden rounded-[5px]">
                <img
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language}/${language}-original.svg`}
                    alt="icon"
                />
            </div>
            <div className="flex flex-col justify-between flex-grow">
                <div className="flex justify-between items-center">
                    <h1>{title}</h1>
                    <button onClick={(e)=>{
                            e.stopPropagation();
                            axios.post(`/snippets/like/${_id}`)
                            .then((response) => {
                                setLike(response.data.data.likes);                                  

                            })
                            .catch((error) => {
                                console.error(error);
                            });
                        }}>
                    <div className="text-sm flex gap-1 items-center">
                        
                        {
                            like?.includes(userId) ? <img src={"/images/Heart.svg"} alt="" /> : <FaRegHeart/>
                        }
                        <div>{like.length}</div>
                    </div>
                        </button>
                </div>
                <div className="flex items-center justify-between">
                    <h4 className="text-xs rounded-full px-3 py-[3px] bg-[#444857] w-fit">
                        @{createdBy?.username}
                    </h4>
                    <p className="text-xs mr-1">{timeAgo}</p>
                </div>
            </div>
        </div>
    );
};

export default ExploreSnippet;
