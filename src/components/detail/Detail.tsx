import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"
import { useChatStore } from "../../lib/chatStore"
import { useBlockUser } from "../../hooks/chat-details/useBlockUser"
import { useRemoveChat } from "../../hooks/chat-details/useRemoveChat"
import { useSignOut } from "../../hooks/useSignOut"
import { ArrowLeftStartOnRectangleIcon, TrashIcon, NoSymbolIcon } from "@heroicons/react/24/outline"
import { Avatar, GroupAvatar } from "../ui/Avatar"
import { useState } from "react"
import EditGroupInfo from "./EditGroupInfo"
import { useUserStore } from "../../lib/userStore"
import { motion, AnimatePresence } from "framer-motion"
import { bubblySpring } from "../ui/ConnectionStatus"

export const Detail = () => {

  const { chatId, isGlobalChat, isGroupChat, isReceiverBlocked } = useChatStore();
  const { handleBlock } = useBlockUser();
  const { removeChat, isRemoving } = useRemoveChat();
  const { signOut } = useSignOut();
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleRemoveChat = async () => {
    await removeChat();
    setShowRemoveConfirm(false);
  };

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
      <div className="info p-5 flex-1 flex flex-col gap-7 overflow-y-auto pb-32">
        {chatId && <Options />}
      </div>
      
      {/* FIXED BOTTOM ACTIONS */}
      <div className="absolute bottom-0 inset-x-0 frosted-glass border-t border-neutral-800">
        <div className="flex flex-col py-2">
          {/* Remove Chat */}
          {(chatId && !isGlobalChat) && (
            <ActionButton 
              onClick={() => setShowRemoveConfirm(true)}
              icon={<TrashIcon className="size-5" />}
              label="Remove Chat"
              variant="muted"
            />
          )}
          
          {/* Block User - only for 1-on-1 chats */}
          {(chatId && !isGlobalChat && !isGroupChat) && (
            <ActionButton 
              onClick={handleBlock}
              icon={<NoSymbolIcon className="size-5" />}
              label={isReceiverBlocked ? 'Unblock User' : 'Block User'}
              variant="danger"
            />
          )}
          
          {/* Logout */}
          <ActionButton 
            onClick={signOut}
            icon={<ArrowLeftStartOnRectangleIcon className="size-5" />}
            label="Logout"
            variant="danger"
          />
        </div>
      </div>
      
      <EditGroupInfo isOpen={isEditGroupOpen} setIsOpen={setIsEditGroupOpen} />
      
      {/* Remove Chat Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={bubblySpring}
              className="bg-neutral-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Remove Chat?</h3>
              <p className="text-neutral-400 text-sm mb-6">
                This will permanently remove the chat and all messages from your account. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-700 hover:bg-neutral-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRemoveChat}
                  disabled={isRemoving}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 transition-colors font-medium disabled:opacity-50"
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  )
}

// Unified action button component
const ActionButton = ({ onClick, icon, label, variant }: { 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  variant: 'muted' | 'danger'
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3 w-full hover:bg-neutral-800/50 transition-colors ${
      variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-neutral-400 hover:text-neutral-300'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
)

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