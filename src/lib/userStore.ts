import { doc, getDoc, setDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

interface AuthUserProfile {
    email?: string | null;
    displayName?: string | null;
}

interface UserStore {
    currentUser: any;
    isLoading: boolean;
    fetchUserInfo: (uid: string, authUser?: AuthUserProfile) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    currentUser: null,
    isLoading: true,
    fetchUserInfo: async (uid: string, authUser?: AuthUserProfile) => {
        if(!uid) set({ currentUser: null, isLoading: false });
        
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false });
            } else {
                const email = authUser?.email || "";
                const profile = {
                    username: authUser?.displayName || email.split("@")[0] || "Buzz user",
                    email,
                    id: uid,
                    avatar: "",
                    status: "I'm using buzz",
                    blocked: []
                };

                await setDoc(docRef, profile);
                set({ currentUser: profile, isLoading: false });
            };

        } catch (err) {
            console.log(err)
            set({ currentUser: null, isLoading: false });
        }
    }
}))
