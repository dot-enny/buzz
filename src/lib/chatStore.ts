import { create } from 'zustand'
import { useUserStore } from './userStore';

interface ChatStore {
    chatId: string | null;
    user: any;
    isCurrentUserBlocked: boolean,
    isReceiverBlocked: boolean,
    changeChat: (chatId: string, user: any) => void;
    resetChat: () => void;
    changeBlock: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId: string, user: any) => {
        const currentUser = useUserStore.getState().currentUser;
        set({
            chatId,
            user,
            isCurrentUserBlocked: user.blocked.includes(currentUser.id),
            isReceiverBlocked: currentUser.blocked.includes(user.id),
        });
    },
    resetChat: () => {
        set({
            chatId: null,
            user: null,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        });
    },
    changeBlock: () => {
        set(state => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
    }
}));
