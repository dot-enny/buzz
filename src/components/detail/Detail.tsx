import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"
import { useChatStore } from "../../lib/chatStore"
import { useBlockUser } from "../../hooks/chat-details/useBlockUser"
import { useSignOut } from "../../hooks/useSignOut"
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline"
import { Avatar, GroupAvatar } from "../ui/Avatar"
import { useState } from "react"
import EditGroupInfo from "./EditGroupInfo"
import { useUserStore } from "../../lib/userStore"

export const Detail = () => {

  const { chatId, isGlobalChat, isGroupChat, isReceiverBlocked } = useChatStore();
  const { handleBlock } = useBlockUser();
  const { signOut } = useSignOut();
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[100svh] xl:relative">
      {/* CONTACT PROFILE */}
      {
        !chatId ? (
          <div className="flex-1 flex flex-col h-screen">
            <h3 className="text-3xl m-auto text-neutral-800 font-semibold text-center max-w-[80%] leading-[1.3]">
              Select a chat to see chat details
            </h3>
          </div>
        ) : (
          <ChatDetails onEditGroup={() => setIsEditGroupOpen(true)} />
        )
      }

      {/* CHAT MENU */}
      <div className="info p-5 flex-1 flex flex-col gap-7 overflow-y-auto">
        {chatId && <Options />}
        <div className="absolute bottom-0 inset-x-0 frosted-glass py-5">
          <div className="flex">
            {(chatId && !isGlobalChat && !isGroupChat) &&
              <button onClick={handleBlock} className="mt-1 text-red-500 w-fit mx-auto">
                {isReceiverBlocked ? 'Unblock User' : 'Block User'}
              </button>
            }
            <button onClick={signOut} className="flex items-center gap-x-1 mt-1 text-red-500 w-fit mx-auto">
              <ArrowLeftStartOnRectangleIcon className="text-red-500 size-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <EditGroupInfo isOpen={isEditGroupOpen} setIsOpen={setIsEditGroupOpen} />
    </div>

  )
}

const ChatDetails = ({ onEditGroup }: { onEditGroup: () => void }) => {
  const { isGlobalChat, isGroupChat, user, groupData, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
  const isAdmin = groupData?.admins?.includes(currentUser.id);

  return (
    <div className="user py-7 px-5 flex flex-col items-center gap-3 border-b border-neutral-800">
      {
        isGlobalChat ? (
          <>
            <Avatar src={null} name="Global Buzz" size="xl" />
            <h2>Global Buzz</h2>
            <p className="text-neutral-500">Buzz all the way!</p>
          </>
        ) : isGroupChat && groupData ? (
          <>
            <GroupAvatar src={groupData.groupPhotoURL} name={groupData.groupName} size="xl" />
            <h2>{groupData.groupName}</h2>
            {groupData.groupDescription && (
              <p className="text-neutral-400 text-sm text-center max-w-xs">{groupData.groupDescription}</p>
            )}
            <p className="text-neutral-500">{groupData.participants?.length || 0} members</p>
            {isAdmin && (
              <button 
                onClick={onEditGroup}
                className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Group Info
              </button>
            )}
          </>
        ) : (
          <>
            <Avatar src={isBlocked ? null : user.avatar} name={user.username} size="xl" />
            <h2>{user.username}</h2>
            <p className="text-neutral-500">{isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status}</p>
          </>
        )
      }
    </div>
  )
}


const Options = () => {
  return (
    <>
      <Option title="Chat Settings" open={false} />
      <Option title="Chat Settings" open={false} />
      <Option title="Privacy & help" open={false} />
      <div>
        <Option title="Shared Photos" open />
        <div className="photos flex flex-col gap-5 mt-4">
          <PhotoItem />
          <PhotoItem />
          <PhotoItem />
          <PhotoItem />
        </div>
      </div>
      <Option title="Shared Files" open={false} />
    </>
  )
}

const Option = ({ title, open }: { title: string, open: boolean }) => {
  return (
    <div className="option">
      <div className="title flex items-center justify-between">
        <span>{title}</span>
        {open ? <IconChevronDown /> : <IconChevronUp />}
      </div>
    </div>
  )
}

const PhotoItem = () => {
  return (
    <div className="photo-item flex justify-between items-center gap-5">
      <div className="photo-detail flex items-center gap-5">
        <img src="./img/photo-placeholder.png" alt="photo" className="w-10 h-10 object-cover" />
        <span className="text-sm text-gray-300 font-light">photo_2024_2.png</span>
      </div>
      <IconDownload />
    </div>
  )
}