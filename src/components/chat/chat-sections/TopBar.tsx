import { ChevronDoubleLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";

export const TopBar = () => {

  const { setIsChatOpen, isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  const { user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  return (
    <div className="top p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        <img src={!isBlocked ? user.avatar : './img/avatar-placeholder.png'} alt="user" className="w-14 h-14 rounded-full object-cover" />
        <div className="texts flex flex-col gap-1">
          <span className="text-lg font-bold">{user.username}</span>
          <p className="text-sm font-light text-neutral-500">{isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status}</p>
        </div>
      </div>
      <div className="actions flex gap-5">
        <button onClick={() => setIsChatDetailOpen(!isChatDetailOpen)}>
          <InformationCircleIcon className="text-white size-6 xl:hidden" />
        </button>
        <button>
          <ChevronDoubleLeftIcon className="text-white size-6" onClick={() => setIsChatOpen(false)} />
        </button>
      </div>
    </div>
  )
}

