import { useChatStore } from "../../lib/chatStore"
import { TopBar } from "./chat-sections/TopBar"
import { Messages } from "./chat-sections/Messages"
import { ComposeMessage } from "./chat-sections/ComposeMessaage"
import { useMarkMessagesAsRead } from "../../hooks/chat/useMarkMessagesAsRead"

export const Chat = () => {
  const { chatId } = useChatStore();
  
  // Mark messages as read when chat is viewed
  useMarkMessagesAsRead();

  return (
    <div className="h-[100svh] flex flex-col flex-[2] border-l border-r border-neutral-800 relative">
      {chatId  ? (
        <>
          <TopBar />
          <Messages />
          <ComposeMessage />
        </>
      ) : (
        <h3 className="text-3xl m-auto text-neutral-800 font-semibold text-center max-w-[65%] leading-[1.3]">
          Select a chat to see messages
        </h3>
      )
      }
    </div>
  )
}

