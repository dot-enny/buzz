import { useEffect, useRef, useState } from "react"
import { IconCamera } from "../icons/IconCamera"
import { IconEmoji } from "../icons/IconEmoji"
import { IconInfo } from "../icons/IconInfo"
import { IconMicrophone } from "../icons/IconMicrophone"
import { IconPhone } from "../icons/IconPhone"
import { IconPhoto } from "../icons/IconPhoto"
import { IconVideo } from "../icons/IconVideo"
import EmojiPicker from "emoji-picker-react"

export const Chat = () => {
  return (
    <div className="h-screen flex flex-col flex-[2] border-l border-r border-neutral-800">
      <Top />
      <Center />
      <Bottom />
    </div>
  )
}

const Top = () => {
  return (
    <div className="top p-5 flex justify-between items-center border-b border-neutral-800">
      <div className="user flex items-center gap-5">
        <img src="./img/avatar-placeholder.png" alt="user" className="w-14 h-14 rounded-full object-cover" />
        <div className="texts flex flex-col gap-1">
          <span className="text-lg font-bold">Jane Doe</span>
          <p className="text-sm font-light text-neutral-500">Lorem ipsum dolor, sit amet.</p>
        </div>
      </div>
      <div className="actions flex gap-5">
        <IconPhone />
        <IconVideo />
        <IconInfo />
      </div>
    </div>
  )
}


const Center = () => {
  return (
    <div className="center flex-1 p-5 overflow-scroll flex flex-col gap-5">
      <Messages />
    </div>
  )
}

const Bottom = () => {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState('');

  const handleEmoji = (e: any) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  }
  
  return (
    <div className="bottom mt-auto flex justify-between items-center gap-5 p-5 border-t border-neutral-800">
        <div className="icons flex gap-5">
          <IconPhoto />
          <IconCamera />
          <IconMicrophone />
        </div>
        <input type="text" placeholder="Type a message..."
          className="flex-1 bg-neutral-900 border-none outline-none text-white p-5 rounded-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="emoji relative">
          <div onClick={() => setOpenEmoji(prev => !prev)}>
            <IconEmoji />
          </div>
          <div className="absolute bottom-12 left-0">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="bg-blue-900 text-white py-2 px-4 border-none rounded">Send</button>
      </div>
  )
}

const Messages = () => {

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const endRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div className="message max-w-[70%] flex gap-5">
        <img src="./img/avatar-placeholder.png" alt="user" className="w-7 h-7 rounded-full object-cover" />
        <div className="texts flex-1 flex flex-col gap-1">
          <p className="text-white bg-blue-950/30 p-5 rounded-lg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore ducimus quae alias deserunt illum nisi id quo incidunt ex, exercitationem possimus laborum quos, voluptate nobis amet odit, dolores beatae sequi!</p>
          <span className="text-neutral-500 text-xs">12:00 PM</span>
        </div>
      </div>
      <div className="message max-w-[70%] flex gap-5 self-end">
        <div className="texts flex-1 flex flex-col gap-1">
          <img src="./img/photo-placeholder.png" alt="user" className="rounded-lg object-cover" />
          <p className="text-white bg-blue-900 p-5 rounded-lg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore ducimus quae alias deserunt illum nisi id quo incidunt ex, exercitationem possimus laborum quos, voluptate nobis amet odit, dolores beatae sequi!</p>
          <span className="text-neutral-500 text-xs">12:00 PM</span>
        </div>
      </div>
      <div ref={endRef} />
    </>
  )
}
