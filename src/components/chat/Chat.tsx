import { useChatStore } from "../../lib/chatStore"
import { TopBar } from "./chat-sections/TopBar"
import { Messages } from "./chat-sections/Messages"
import { ComposeMessage } from "./chat-sections/ComposeMessaage"
import { useMarkMessagesAsRead } from "../../hooks/chat/useMarkMessagesAsRead"
import { useUpdateMessages } from "../../hooks/chat/useUpdateMessages"
import { useMessageSearch } from "../../hooks/chat/useMessageSearch"
import { ChatSearchBar } from "./chat-sections/ChatSearchBar"
import { useTypingIndicator } from "../../hooks/chat/useTypingIndicator"
import { TypingIndicator } from "../ui/TypingIndicator"
import { AnimatePresence } from "framer-motion"

export const Chat = () => {
  const { chatId } = useChatStore();
  
  // Get messages and optimistic update callbacks
  const { messages, endRef, addOptimisticMessage, markMessageFailed, markMessageSent } = useUpdateMessages();
  
  // Typing indicator
  const { typingUsers, setTyping, clearTyping } = useTypingIndicator();
  
  // Message search
  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    openSearch,
    closeSearch,
    resultCount,
    activeResultIndex,
    activeResult,
    goToNextResult,
    goToPreviousResult,
    getMatchIndices,
  } = useMessageSearch(messages);
  
  // Mark messages as read when chat is viewed
  useMarkMessagesAsRead();

  return (
    <div className="h-[100svh] flex flex-col flex-[2] border-l border-r border-neutral-800 relative">
      {chatId  ? (
        <>
          <TopBar 
            onSearchClick={openSearch} 
            typingUsernames={typingUsers.map(u => u.username)}
          />
          <ChatSearchBar
            isOpen={isSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClose={closeSearch}
            resultCount={resultCount}
            activeResultIndex={activeResultIndex}
            onNextResult={goToNextResult}
            onPreviousResult={goToPreviousResult}
          />
          <Messages 
            messages={messages} 
            endRef={endRef}
            activeSearchResultId={activeResult?.message.id}
            getMatchIndices={getMatchIndices}
          />
          
          {/* Typing indicator above compose */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <TypingIndicator usernames={typingUsers.map(u => u.username)} />
            )}
          </AnimatePresence>
          
          <ComposeMessage 
            optimisticCallbacks={{ 
              addOptimisticMessage, 
              markMessageFailed, 
              markMessageSent 
            }}
            onTyping={setTyping}
            onStopTyping={clearTyping}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-neutral-600 font-medium text-center max-w-[65%] leading-relaxed">
            Select a chat to see messages
          </p>
        </div>
      )
      }
    </div>
  )
}

