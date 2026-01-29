import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"
import { useChatStore } from "../../lib/chatStore"
import { useBlockUser } from "../../hooks/chat-details/useBlockUser"
import { useSignOut } from "../../hooks/useSignOut"
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline"

export const Detail = () => {

  const { chatId, isGlobalChat, isGroupChat, isReceiverBlocked } = useChatStore();
  const { handleBlock } = useBlockUser();

  const { signOut } = useSignOut();

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
          <ChatDetails />
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
    </div>

  )
}

const ChatDetails = () => {
  const { isGlobalChat, isGroupChat, user, groupData, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  return (
    <div className="user py-7 px-5 flex flex-col items-center gap-3 border-b border-neutral-800">
      {
        isGlobalChat ? (
          <>
            <img src="./img/avatar-placeholder.png" alt="user" className="w-24 h-24 rounded-full object-cover" />
            <h2>Global Buzz</h2>
            <p className="text-neutral-500">Buzz all the way!</p>
          </>
        ) : isGroupChat && groupData ? (
          <>
            {groupData.groupPhotoURL ? (
              <img src={groupData.groupPhotoURL} alt={groupData.groupName} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            )}
            <h2>{groupData.groupName}</h2>
            <p className="text-neutral-500">{groupData.participants?.length || 0} members</p>
          </>
        ) : (
          <>
            <img src={!isBlocked ? user.avatar : './img/avatar-placeholder.png'} alt="user" className="w-24 h-24 rounded-full object-cover" />
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