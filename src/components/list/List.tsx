import { ChatList } from "./chatList/ChatList"
import { UserInfo } from "./userInfo/UserInfo"

export const List = () => {
  return (
    <div className="flex-1 flex flex-col h-screen">
      <UserInfo />
      <ChatList />
    </div>
  )
}
