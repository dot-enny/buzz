import { ChevronDoubleLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";

export const TopBar = () => {

  const { user } = useChatStore();

  return (
    <div className="top p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        <img src={ user.avatar } alt="user" className="w-14 h-14 rounded-full object-cover" />
        <div className="texts flex flex-col gap-1">
          <span className="text-lg font-bold">{user.username}</span>
          <p className="text-sm font-light text-neutral-500">{user.status}</p>
        </div>
      </div>
      <div className="actions flex gap-5">
        <InformationCircleIcon className="text-white size-6 xl:hidden" />
        <ChevronDoubleLeftIcon className="text-white size-6 max-xl:hidden" />
      </div>
    </div>
  )
}

