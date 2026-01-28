import { create } from 'zustand'
import { useUserStore } from './userStore';
import { GLOBAL_CHAT_ID } from '../hooks/useSignup';

interface ChatStore {
    chatId: string | null;
    isGlobalChat: boolean;
    isGroupChat: boolean;
    user: any;
    groupData: any;
    isCurrentUserBlocked: boolean,
    isReceiverBlocked: boolean,
    isLoading: boolean,
    changeChat: (chatId: string, user: any, chatType?: string, groupData?: any) => void;
    resetChat: () => void;
    changeBlock: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    chatId: null,
    isGlobalChat: false,
    isGroupChat: false,
    user: null,
    groupData: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    isLoading: false,
    changeChat: (chatId: string, user: any, chatType?: string, groupData?: any) => {
        const isGlobalChat = chatId === GLOBAL_CHAT_ID;
        const isGroupChat = chatType === 'group';
        set({ isLoading: true });
        const currentUser = useUserStore.getState().currentUser;
        
        if (isGlobalChat) {
            set({
                chatId,
                isGlobalChat: true,
                isGroupChat: false,
                isLoading: false,
                user: null,
                groupData: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            })
        } else if (isGroupChat) {
            set({
                chatId,
                isGlobalChat: false,
                isGroupChat: true,
                user: null,
                groupData,
                isLoading: false,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            })
        } else {
            set({
                chatId,
                isGlobalChat: false,
                isGroupChat: false,
                user,
                groupData: null,
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
            groupData: null,
            isGlobalChat: false,
            isGroupChat: false,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
            isLoading: false,
        });
    },
    changeBlock: () => {
        set(state => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
    }
}));
