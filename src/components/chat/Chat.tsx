import { useState } from "react"
import { useChatStore } from "../../lib/chatStore"
import { TopBar } from "./chat-sections/TopBar"
import { Messages } from "./chat-sections/Messages"
import { ComposeMessage } from "./chat-sections/ComposeMessaage"
export interface Img {
  file: File | null,
  url: string
}

export const Chat = () => {
  const { chatId } = useChatStore();

  const [img, setImg] = useState<Img>({
    file: null,
    url: "",
  })

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] flex flex-col flex-[2] border-l border-r border-neutral-800 relative">
      {chatId  ? (
        <>
          <TopBar />
          <Messages img={img.url} />
          <ComposeMessage setImg={setImg} img={img} />
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

