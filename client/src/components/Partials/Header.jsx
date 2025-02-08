import { NavLink } from "react-router-dom";
import AvatarMenu from "./AvatarMenu";
import SearchBar from "./SearchBar"

const Header = () => {
    return (
        <header className="flex justify-between items-center">
            <nav className="text-xl flex gap-0.5">
                <NavLink
                    to={"/snippets"}
                    className={(e) => {
                        return [
                            "bg-[#1E1F26] px-4 py-2 rounded-tl-[5px] rounded-bl-[5px] border-b-2",

                            e.isActive && "border-b-2 border-[#27E0B3]",
                            !e.isActive &&
                                "hover:border-b-2 hover:border-[#8a8a8a] border-transparent",
                        ].join(" ");
                    }}
                >
                    Snippets
                </NavLink>
                <NavLink
                    to={"/pixelpen"}
                    className={(e) => {
                        return [
                            "bg-[#1E1F26] px-4 py-2 border-b-2",
                            e.isActive && "border-b-2 border-[#27E0B3]",
                            !e.isActive &&
                                "hover:border-b-2 hover:border-[#8a8a8a] border-transparent",
                        ].join(" ");
                    }}
                >
                    Pixelpen
                </NavLink>
                <NavLink
                    to={"/workspace"}
                    className={(e) => {
                        return [
                            "bg-[#1E1F26] px-4 py-2 rounded-tr-[5px] rounded-br-[5px] relative border-b-2",

                            e.isActive && "border-b-2 border-[#27E0B3]",
                            !e.isActive &&
                                "hover:border-b-2 hover:border-[#8a8a8a] border-transparent",
                        ].join(" ");
                    }}
                >
                    Workspace
                </NavLink>
            </nav>
            {/* <input
                type="text"
                placeholder="Search"
                className="bg-[#1E1F26] outline-none placeholder:text-[#8a8a8a] px-4 py-2 rounded-[5px] text-xl"
            /> */}
            <SearchBar/>
            <AvatarMenu/>
        </header>
    );
};

export default Header;
