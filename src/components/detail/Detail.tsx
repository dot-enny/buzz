import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"
import { auth, db } from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore"
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore"
import { useUserStore } from "../../lib/userStore"

export const Detail = () => {

  const { currentUser, fetchUserInfo } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeChat } = useChatStore();

  const signOut = async () => {
    await auth.signOut();
  };

  const handleBlock = async () => {
    if (!chatId) return;

    const userDocRef = doc(db, "users", currentUser.id);

    const toggleBlock = async (blockValue: ('block' | 'unblock'), id: string) => {
      try {
        await updateDoc(userDocRef, {
          blocked: blockValue === 'block' ? arrayUnion(id) : arrayRemove(id)
        });
        refetchUserInfo(id);
      } catch (err) {
        console.log(err);
      }
    };

    const chatRef = doc(db, "chats", chatId);
    const chatDocSnap = await getDoc(chatRef);
    const chatData = chatDocSnap.data();

    const refetchUserInfo = async (blockedUserId: string) => {
      fetchUserInfo(currentUser.id);
      const receiverDocRef = doc(db, "users", blockedUserId);
      const receiverDocSnap = await getDoc(receiverDocRef);
      const user = receiverDocSnap.data();
      changeChat(chatId, user);
    };

    // UNBLOCK USER
    if (!user) {
      if (!chatData) return;
      const blockedUser = chatData.messages.find((chat: any) => chat.senderId != currentUser.id);
      toggleBlock('unblock', blockedUser.senderId);
      return;
    };

    // BLOCK USER
    toggleBlock('block', user.id);
  };

  return (
    <div className="flex-1 flex flex-col h-screen relative">
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
            <img src={user.avatar} alt="user" className="w-24 h-24 rounded-full object-cover" />
            <h2>{user.username}</h2>
            <p className="text-neutral-500">{user.status}</p>
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
                {isCurrentUserBlocked ? 'You are Blocked!' : isReceiverBlocked ? 'User Blocked' : 'Block User'}
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