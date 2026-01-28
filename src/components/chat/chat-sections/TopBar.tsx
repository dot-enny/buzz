import { ChevronDoubleLeftIcon, InformationCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";

export const TopBar = () => {

  const { setIsChatOpen, isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat, groupData } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  // Determine what to display
  const getDisplayInfo = () => {
    if (isGlobalChat) {
      return {
        avatar: './img/avatar-placeholder.png',
        name: 'Global Buzz',
        status: 'Buzz all the way!'
      };
    } else if (isGroupChat && groupData) {
      return {
        avatar: groupData.groupPhotoURL || null,
        name: groupData.groupName,
        status: `${groupData.participants?.length || 0} members`
      };
    } else {
      return {
        avatar: !isBlocked ? user.avatar : './img/avatar-placeholder.png',
        name: user.username,
        status: isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status
      };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className="top p-3 sm:p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        {isGroupChat && !displayInfo.avatar ? (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
            <UserGroupIcon className="w-7 h-7 text-white" />
          </div>
        ) : (
          <img src={displayInfo.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        )}
        <div className="texts flex flex-col gap-1">
          <span className="text-lg font-bold">{displayInfo.name}</span>
          <p className="text-sm font-light text-neutral-500 line-clamp-1">{displayInfo.status}</p>
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


