import { ChevronDoubleLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";

export const TopBar = () => {

  const { setIsChatOpen, isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
  // const isStatusLong = user.status.length > 35;
  // const isStatusLongMobile = user.status.length > 30;
  // const status = isStatusLong ? user.status.slice(0, 30) : user.status.slice(0, 35);
  // const statusMobile = isStatusLongMobile ? user.status.slice(0, 27) : user.status.slice(0, 29);

  return (
    <div className="top p-3 sm:p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        { isGlobalChat ? <img src={'./img/avatar-placeholder.png'} alt="user" className="w-14 h-14 rounded-full object-cover" /> :
        <img src={!isBlocked ? user.avatar : './img/avatar-placeholder.png'} alt="user" className="w-14 h-14 rounded-full object-cover" /> }
        <div className="texts flex flex-col gap-1">
          { isGlobalChat ? <span className="text-lg font-bold">Global Buzz</span> :
          <span className="text-lg font-bold">{user.username}</span> }
          {/* <p className="max-md:hidden text-sm font-light text-neutral-500">{isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : status}{isStatusLong && '...'}</p>
          <p className="md:hidden text-sm font-light text-neutral-500">{isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : statusMobile}{isStatusLongMobile && '...'}</p> */}
          {
            isGlobalChat ? <p className="text-sm font-light text-neutral-500 line-clamp-1">Buzz all the way!</p> :
            <p className="text-sm font-light text-neutral-500 line-clamp-1">{isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status}</p>
          }
        </div>
      </div>
      <div className="actions flex gap-5">
        <button onClick={() => setIsChatDetailOpen(!isChatDetailOpen)}>
          <InformationCircleIcon className="text-white size-6 xl:hidden" />
        </button>
        <button>
          <ChevronDoubleLeftIcon className="text-white size-6 md:hidden" onClick={() => setIsChatOpen(false)} />
        </button>
      </div>
    </div>
  )
}

