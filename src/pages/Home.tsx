import { List } from "../components/list/List";
import { Chat } from "../components/chat/Chat";
import { Detail } from "../components/detail/Detail";
import MobileDetail from "../components/detail/MobileDetail";
import { useAppStateStore } from "../lib/appStateStore";
import { useDragChatPanel } from "../hooks/useDragChatPanel";
import { useChatStore } from "../lib/chatStore";

export default function Home() {

  const { isChatOpen, setIsChatOpen, setIsChatDetailOpen } = useAppStateStore();
  const { chatId } = useChatStore();
  
  const { dragOffset, isDragging, handlers } = useDragChatPanel({
    onClose: () => setIsChatOpen(false),
    onOpenDetail: () => setIsChatDetailOpen(true),
    isOpen: isChatOpen,
    hasChatActive: !!chatId,
    threshold: 100,
  });

  return (
    <main className="max-h-screen overflow-clip md:flex relative">
      <div className={`flex-1 ${isChatOpen && 'max-md:hidden'}`}>
        <List />
      </div>
      <div 
        className={`
          md:flex-1 lg:flex-[2] min-h-screen
          max-md:fixed max-md:inset-0 max-md:z-10 max-md:bg-neutral-950
          ${!isChatOpen ? 'max-md:translate-x-full' : 'max-md:translate-x-0'}
        `}
        style={{
          transform: isChatOpen && dragOffset > 0 
            ? `translateX(${dragOffset}px)` 
            : undefined,
          transition: isDragging ? 'none' : 'transform 500ms ease-in-out',
        }}
        {...handlers}
      >
        <Chat />
      </div>
      <div className="max-xl:hidden flex-1">
        <Detail />
      </div>
      <MobileDetail />
    </main>
  )
};
