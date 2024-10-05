import { useState } from "react";
import { IconPlus } from "../../icons/IconPlus"
import { IconSearch } from "../../icons/IconSearch"
import { IconMinus } from "../../icons/IconMinus";
import { AddUser } from "./addUser/AddUser";

export const ChatList = () => {

    const [addMode, setAddMode] = useState(false);

    return (
        <div className="flex-1 overflow-y-scroll">
            <div className="flex items-center gap-5 p-5">
                <div className="flex-1 bg-neutral-900 flex items-center gap-5 p-2 rounded-lg">
                    <IconSearch />
                    <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-white" />
                </div>
                <div onClick={() => setAddMode((prev) => !prev)} className="cursor-pointer">
                    {addMode ? <IconMinus /> : <IconPlus />}
                </div>
            </div>
            <ListItem />
            <ListItem />
            <ListItem />

            <>
                { addMode && <AddUser /> }
            </>
        </div>
    )
}


const ListItem = () => {
    return (
        <div className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800">
            <img src="./img/avatar-placeholder.png" alt="user" className="w-12 h-12 rounded-full object-cover" />
            <div>
                <h2>John Doe</h2>
                <p className="text-neutral-500">Hello</p>
            </div>
        </div>
    )
}
