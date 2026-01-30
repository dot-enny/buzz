import { List } from "../components/list/List";
import { Chat } from "../components/chat/Chat";
import { Detail } from "../components/detail/Detail";
import MobileDetail from "../components/detail/MobileDetail";
import { useAppStateStore } from "../lib/appStateStore";
import { useChatStore } from "../lib/chatStore";
import { motion, PanInfo } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ConnectionStatus } from "../components/ui/ConnectionStatus";

export default function Home() {

  const { isChatOpen, setIsChatOpen, setIsChatDetailOpen } = useAppStateStore();
  const { chatId } = useChatStore();
  
  // Breakpoint matching 'md' in Tailwind (768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    // Dragged Right -> Close
    if (info.offset.x > swipeThreshold && info.velocity.x >= 0) {
      setIsChatOpen(false);
    }
    // Dragged Left -> Open Detail (if chat active)
    else if (info.offset.x < -swipeThreshold && !!chatId && info.velocity.x <= 0) {
      setIsChatDetailOpen(true);
    }
  };

  return (
    <main className="max-h-screen overflow-clip md:flex relative">
      {/* Connection Status Banner */}
      <ConnectionStatus />
      
      {/* 
        List is flex-1 on desktop.
        On mobile, it's always visible behind the chat (which is absolute/fixed).
        We removed 'max-md:hidden' so it stays visible during swipe. 
      */}
      <div className="flex-1 w-full max-w-full">
        <List />
      </div>

      <motion.div 
        className={`
          md:flex-1 lg:flex-[2] min-h-screen 
          max-md:fixed max-md:inset-0 max-md:z-10 max-md:bg-neutral-950
          border-l border-r border-neutral-800
        `}
        initial={false}
        animate={isMobile ? { x: isChatOpen ? "0%" : "100%" } : { x: "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        
        // Drag logic only for mobile
        drag={isMobile ? "x" : false}
        // Allow dragging right (positive) to close.
        // Allow slight dragging left (negative) to signal intent for Detail.
        dragConstraints={{ left: -50 }}
        dragElastic={{ left: 0.2, right: 1 }} 
        dragSnapToOrigin={true}
        
        onDragEnd={handleDragEnd}
      >
        <Chat />
      </motion.div>
      
      <div className="max-xl:hidden flex-1">
        <Detail />
      </div>
      <MobileDetail />
    </main>
  )
};
