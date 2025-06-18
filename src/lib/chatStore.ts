import { create } from 'zustand'
import { useUserStore } from './userStore';
import { GLOBAL_CHAT_ID } from '../hooks/useSignup';

interface ChatStore {
    chatId: string | null;
    isGlobalChat: boolean;
    user: any;
    isCurrentUserBlocked: boolean,
    isReceiverBlocked: boolean,
    isLoading: boolean,
    changeChat: (chatId: string, user: any) => void;
    resetChat: () => void;
    changeBlock: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    chatId: null,
    isGlobalChat: false,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    isLoading: false,
    changeChat: (chatId: string, user: any) => {
        const isGlobalChat = chatId === GLOBAL_CHAT_ID;
        set({ isLoading: true });
        const currentUser = useUserStore.getState().currentUser;
        if (isGlobalChat) {
            set({
                chatId,
                isGlobalChat: true,
                isLoading: false,
                user: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            })
        } else {
            set({
                chatId,
                isGlobalChat: false,
                user,
                isCurrentUserBlocked: user.blocked.includes(currentUser.id),
                isReceiverBlocked: currentUser.blocked.includes(user.id),
                isLoading: false,
            });
        }
    },
    resetChat: () => {
        set({
            chatId: null,
            user: null,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
            isLoading: false,
        });
    },
    changeBlock: () => {
        set(state => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
    }
}));
