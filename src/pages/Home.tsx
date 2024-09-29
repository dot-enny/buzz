import { List } from "../components/list/List";
import { Chat } from "../components/chat/Chat";
import { Detail } from "../components/detail/Detail";

export default function Home () {

  return (
    <main className="flex min-h-screen">
      <List />
      <Chat />
      <Detail />
    </main>
  )
};
 