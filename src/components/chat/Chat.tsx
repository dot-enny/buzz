import { useEffect, useRef, useState } from "react"
import { IconCamera } from "../icons/IconCamera"
import { IconEmoji } from "../icons/IconEmoji"
import { IconInfo } from "../icons/IconInfo"
import { IconMicrophone } from "../icons/IconMicrophone"
import { IconPhone } from "../icons/IconPhone"
import { IconPhoto } from "../icons/IconPhoto"
import { IconVideo } from "../icons/IconVideo"
import EmojiPicker from "emoji-picker-react"
import { useChatStore } from "../../lib/chatStore"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore"
import { upload } from "../../lib/upload"
interface Img {
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
    <div className="h-screen flex flex-col flex-[2] border-l border-r border-neutral-800">
      {chatId ? (
        <>
          <Top />
          <Center img={img.url} />
          <Bottom setImg={setImg} img={img} />
        </>
      ) : (
        <h3 className="text-3xl m-auto text-neutral-800 font-semibold text-center max-w-[65%] leading-[1.3]">
          Select a chat to display your messages here
        </h3>
      )
      }
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


const Center = ({ img }: { img: string }) => {

  const { chatId } = useChatStore();
  const [chat, setChat] = useState<any | null>(null);

  const messages = chat?.messages;

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(
        doc(db, "chats", chatId),
        (res: any) => {
          setChat(res.data());
        }
      );
      return () => unSub();
    }
  }, [chatId]);

  return (
    <div className="center flex-1 p-5 overflow-scroll flex flex-col gap-5">
      {messages &&
        messages.map((message: any) => (
          <Message key={message.createdAt} message={message} />
        ))
      }
      {
        img &&
        <div className="message max-w-[70%] flex gap-5 self-end">
          <div className="texts flex-1 flex flex-col gap-1">
            {img && <img src={img} alt="user" className="rounded-lg object-cover" />}
          </div>
        </div>
      }
    </div>
  )
}

const Bottom = ({ setImg, img }: { setImg: React.Dispatch<React.SetStateAction<Img>>, img: Img }) => {
  const { currentUser } = useUserStore();
  const { chatId, user } = useChatStore();

  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState('');

  const handleEmoji = (e: any) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleImg = (e: any) => {
    if (e.target.files[0])
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
  };

  const handleSendText = async () => {
    if (text === "") return;

    let imgUrl = null;

    if (chatId)

      try {
        if (img.file) imgUrl = await upload(img.file);

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            ...(imgUrl != null && { img: imgUrl })
          })
        })
      } catch (err) {
        console.log(err)
      };


    const userIDs = [currentUser.id, user.id];

    userIDs.forEach(async (id) => {
      const userChatsRef = doc(db, "userchats", id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex((chat: any) => chat.chatId === chatId);

        userChatsData.chats[chatIndex].lastMessage = text;
        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
        userChatsData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatsRef, {
          chats: userChatsData.chats,
        });
      };
    });

    setImg({
      file: null,
      url: "",
    });
    setText("");

  };


  return (
    <div className="bottom mt-auto flex justify-between items-center gap-5 p-5 border-t border-neutral-800">
      <div className="icons flex gap-5">
        <label htmlFor="file">
          <IconPhoto />
        </label>
        <input type="file" id="file" className="hidden" onChange={handleImg} />
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
      <button 
        onClick={handleSendText}
        className="bg-blue-900 text-white py-2 px-4 border-none rounded" 
      >
        Send
      </button>
    </div>
  )
}

const Message = ({ message }: { message?: any }) => {

  const { currentUser } = useUserStore();

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      {
        message.senderId === currentUser.id ?
          (
            <div className="message self-end">
              <div className="texts flex-1 flex flex-col gap-1">
                {message.img &&
                  <img src={message.img} alt="user" className="rounded-lg object-cover" />
                }
                <p className="text-white bg-blue-900 p-5 rounded-lg">{message.text}</p>
                {/* <span className="text-neutral-500 text-xs">{ message.createdAt }</span> */}
                <span className="text-neutral-500 text-xs">12:00 PM</span>
              </div>
            </div>
          ) : (
            <div className="message">
              <img src="./img/avatar-placeholder.png" alt="user" className="w-7 h-7 rounded-full object-cover" />
              <div className="texts flex-1 flex flex-col gap-1">
                {message.img &&
                  <img src={message.img} alt="user" className="rounded-lg object-cover" />
                }
                <p className="text-white bg-blue-950/30 p-5 rounded-lg">{message.text}</p>
                {/* <span className="text-neutral-500 text-xs">{ message.createdAt }</span> */}
                <span className="text-neutral-500 text-xs">12:00 PM</span>
              </div>
            </div>
          )
      }

      <div ref={endRef} />
    </>
  )
}
