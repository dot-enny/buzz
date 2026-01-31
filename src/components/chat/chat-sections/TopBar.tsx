import { ChevronDoubleLeftIcon, InformationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";
import { Avatar, GroupAvatar } from "../../ui/Avatar";
import Tooltip from "../../ui/Tooltip";

interface TopBarProps {
  onSearchClick?: () => void;
}

export const TopBar = ({ onSearchClick }: TopBarProps) => {

  const { setIsChatOpen, isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat, groupData } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  return (
    <div className="top p-3 sm:p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        {isGlobalChat ? (
          <Avatar src={null} name="Global Buzz" size="lg" className="flex-shrink-0" />
        ) : isGroupChat && groupData ? (
          <GroupAvatar src={groupData.groupPhotoURL} name={groupData.groupName} size="lg" className="flex-shrink-0" />
        ) : (
          <Avatar 
            src={isBlocked ? null : user.avatar} 
            name={user.username} 
            size="lg" 
            className="flex-shrink-0" 
          />
        )}
        <div className="texts flex flex-col gap-1">
          <span className="text-lg font-bold">
            {isGlobalChat ? 'Global Buzz' : isGroupChat && groupData ? groupData.groupName : user.username}
          </span>
          <p className="text-sm font-light text-neutral-500 line-clamp-1">
            {isGlobalChat 
              ? 'Buzz all the way!' 
              : isGroupChat && groupData 
                ? `${groupData.participants?.length || 0} members`
                : isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status
            }
          </p>
        </div>
      </div>
      <div className="actions flex gap-3">
        {/* Search button */}
        <Tooltip tip="Search messages" className="-left-12">
          <button 
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <MagnifyingGlassIcon className="text-neutral-400 hover:text-white size-5 transition-colors" />
          </button>
        </Tooltip>
        
        <button onClick={() => setIsChatDetailOpen(!isChatDetailOpen)} className="p-2 rounded-lg hover:bg-neutral-800 transition-colors xl:hidden">
          <InformationCircleIcon className="text-neutral-400 hover:text-white size-5 transition-colors" />
        </button>
        <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors md:hidden" onClick={() => setIsChatOpen(false)}>
          <ChevronDoubleLeftIcon className="text-neutral-400 hover:text-white size-5 transition-colors" />
        </button>
      </div>
    </div>
  )
}


