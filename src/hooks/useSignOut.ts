import { useAppStateStore } from "../lib/appStateStore";
import { useChatStore } from "../lib/chatStore";
import { auth } from "../lib/firebase";

export const useSignOut = () => {
    const { resetChat } = useChatStore();
    const { setIsChatOpen, setIsChatDetailOpen } = useAppStateStore();

    const signOut = async () => {
        resetChat();
        setIsChatOpen(false);
        setIsChatDetailOpen(false);
        await auth.signOut();
    };

    return { signOut }
}