import { List } from "../components/list/List";
import { Chat } from "../components/chat/Chat";
import { Detail } from "../components/detail/Detail";
import MobileDetail from "../components/detail/MobileDetail";
import { useAppStateStore } from "../lib/appStateStore";

export default function Home() {

  const { isChatOpen } = useAppStateStore();

  return (
    <main className="max-h-screen overflow-clip md:flex relative">
      <div className={`flex-1 ${isChatOpen && 'max-md:hidden'}`}>
        <List />
      </div>
      <div className={`
        md:flex-1 lg:flex-[2] min-h-screen
        max-md:fixed max-md:inset-0 max-md:z-10 max-md:bg-neutral-950
        max-md:transition-transform max-md:duration-300 max-md:ease-in-out
        ${!isChatOpen ? 'max-md:translate-x-full' : 'max-md:translate-x-0'}
      `}>
        <Chat />
      </div>
      <div className="max-xl:hidden flex-1">
        <Detail />
      </div>
      <MobileDetail />
    </main>
  )
};
