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

        // CHECK IF USER IS BLOCKED
        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }
        // CHECK IF RECEIVER IS BLOCKED
        else if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {
            set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        };
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
