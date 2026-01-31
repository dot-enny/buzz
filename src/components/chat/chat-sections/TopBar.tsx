import { ChevronDoubleLeftIcon, InformationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";
import { Avatar, GroupAvatar } from "../../ui/Avatar";
import Tooltip from "../../ui/Tooltip";
import { TypingIndicatorCompact } from "../../ui/TypingIndicator";
import { AnimatePresence } from "framer-motion";

interface TopBarProps {
  onSearchClick?: () => void;
  typingUsernames?: string[];
}

export const TopBar = ({ onSearchClick, typingUsernames = [] }: TopBarProps) => {

  const { setIsChatOpen, isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat, groupData } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
  
  const isTyping = typingUsernames.length > 0;

  // Get subtitle text
  const getSubtitle = () => {
    if (isGlobalChat) return 'Buzz all the way!';
    if (isGroupChat && groupData) return `${groupData.participants?.length || 0} members`;
    if (isReceiverBlocked) return 'You blocked this user!';
    if (isCurrentUserBlocked) return 'This user blocked you!';
    return user.status;
  };

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
          <div className="text-sm font-light text-neutral-500 line-clamp-1 h-5">
            <AnimatePresence mode="wait">
              {isTyping ? (
                <TypingIndicatorCompact key="typing" usernames={typingUsernames} />
              ) : (
                <span key="status">{getSubtitle()}</span>
              )}
            </AnimatePresence>
          </div>
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


