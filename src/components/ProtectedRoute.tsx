import { PropsWithChildren, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../lib/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
	
    const { fetchUserInfo, currentUser } = useUserStore();
	const navigate = useNavigate();

	useEffect(() => {
        const unSub = onAuthStateChanged(auth, async (user: any) => {
			if(user) {
				const uid = user.uid || '';
				fetchUserInfo(uid);
			} else {
				navigate('/auth/sign-in')
			}
        });
        return () => unSub();
    }, [fetchUserInfo, auth]);

	return currentUser ? children : null;
}