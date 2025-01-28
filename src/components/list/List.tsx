import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { ChatList } from "./chatList/ChatList"
import { UserInfo } from "./userInfo/UserInfo"
import { useSignOut } from "../../hooks/useSignOut";

export const List = () => {

  const { signOut } = useSignOut();

  return (
    <div className="min-h-[100dvh] max-h-[100dvh]">
      <UserInfo />
      <ChatList />
      <button onClick={signOut} className="xl:hidden mt-1 w-fit mx-auto fixed bottom-5 left-5 rounded-full border border-red-300 p-3">
        <ArrowLeftStartOnRectangleIcon className="text-red-500 size-6" />
      </button>
    </div>
  )
}
