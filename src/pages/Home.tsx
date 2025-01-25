import { List } from "../components/list/List";
import { Chat } from "../components/chat/Chat";
import { Detail } from "../components/detail/Detail";
import MobileDetail from "../components/detail/MobileDetail";
import { useAppStateStore } from "../lib/appStateStore";

export default function Home() {

  const { isChatOpen } = useAppStateStore();

  return (
    <main className="flex min-h-screen">
      <div className={`flex-1 ${isChatOpen && 'max-md:hidden'}`}>
        <List />
      </div>
      <div className={`${!isChatOpen && 'max-md:hidden'} md:flex-1 lg:flex-[2] min-h-screen`}>
        <Chat />
      </div>
      <div className="max-xl:hidden flex-1">
        <Detail />
      </div>
      <MobileDetail />
    </main>
  )
};
