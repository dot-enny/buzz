import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "../../../lib/userStore";
import Tooltip from "../../ui/Tooltip";
import { useState } from "react";
import EditInfo from "./EditInfo";

export const UserInfo = () => {

  const { currentUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  // const isStatusLong = currentUser.status.length > 32;
  // const isStatusLongMobile = currentUser.status.length > 30;

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <img src={currentUser.avatar} alt="user" className="w-12 h-12 rounded-full object-cover" />
        <span className="">
          <h2>{currentUser.username}</h2>
          {/* <span className="max-md:hidden text-xs text-gray-400">{isStatusLong ? currentUser.status.slice(0, 32) : currentUser.status.slice(0, 35)}{ isStatusLong && '...' }</span>
          <span className="md:hidden text-xs text-gray-400">{isStatusLongMobile ? currentUser.status.slice(0, 29) : currentUser.status.slice(0, 30)}{ isStatusLongMobile && '...' }</span> */}
          <span className="text-xs text-gray-400 line-clamp-1">{currentUser.status}</span>
        </span>
      </div>
      <Tooltip tip="edit profile" className="mt-2 -ml-7 w-full">
        <PencilSquareIcon className="text-white size-5 cursor-pointer" onClick={() => (setIsOpen((prev) => !prev))} />
      </Tooltip>

      <EditInfo isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
