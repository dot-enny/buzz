import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "../../../lib/userStore";
import Tooltip from "../../ui/Tooltip";
import { useState } from "react";
import EditInfo from "./EditInfo";
import { ThemeToggle } from "../../ui/ThemeToggle";

export const UserInfo = () => {

  const { currentUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <img src={currentUser.avatar || './img/avatar-placeholder.png'} alt="user" className="w-12 h-12 rounded-full object-cover" />
        <span className="">
          <h2>{currentUser.username}</h2>
          <span className="text-xs text-gray-400 line-clamp-1">{currentUser.status}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button onClick={() => (setIsOpen((prev) => !prev))}>
          <Tooltip tip="edit profile" className="mt-2 -ml-7 w-full">
            <PencilSquareIcon className="text-neutral-300 dark:text-neutral-300 size-5 cursor-pointer" />
          </Tooltip>
        </button>
      </div>

      <EditInfo isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
