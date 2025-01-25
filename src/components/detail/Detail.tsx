import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"
import { auth } from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore"
import { useBlockUser } from "../../hooks/chat-details/useBlockUser"

export const Detail = () => {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, resetChat } = useChatStore();
  const { handleBlock } = useBlockUser();
  const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

  const signOut = async () => {
    await auth.signOut();
    resetChat()
  };

  return (
    <div className="flex-1 flex flex-col h-screen xl:relative">
      {/* CONTACT PROFILE */}
      {
        !chatId ? (
          <div className="flex-1 flex flex-col h-screen">
            <h3 className="text-3xl m-auto text-neutral-800 font-semibold text-center max-w-[80%] leading-[1.3]">
              Select a chat to see chat details
            </h3>
          </div>
        ) : (
          <div className="user py-7 px-5 flex flex-col items-center gap-3 border-b border-neutral-800">
            <img src={ !isBlocked ? user.avatar : './img/avatar-placeholder.png'} alt="user" className="w-24 h-24 rounded-full object-cover" />
            <h2>{ user.username }</h2>
            <p className="text-neutral-500">{ isReceiverBlocked ? 'You blocked this user !' : isCurrentUserBlocked ? 'This user blocked you !' : user.status }</p>
          </div>
        )
      }

      {/* CHAT MENU */}
      <div className="info p-5 flex-1 flex flex-col gap-7 overflow-y-auto">
        { chatId && <Options /> }
        <div className="absolute bottom-0 inset-x-0 frosted-glass py-5">
          <div className="flex">
            { chatId && 
              <button onClick={handleBlock} className="mt-1 text-red-500 w-fit mx-auto">
                { isReceiverBlocked ? 'Unblock User' : 'Block User' }
              </button>
            }
            <button onClick={signOut} className="mt-1 text-red-500 w-fit mx-auto">Logout</button>
          </div>
        </div>
      </div>
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