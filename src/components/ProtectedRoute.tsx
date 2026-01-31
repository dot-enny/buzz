import { PropsWithChildren, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../lib/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Spinner } from "./ui/Spinner";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
	
    const { fetchUserInfo, currentUser } = useUserStore();
	const navigate = useNavigate();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
        const unSub = onAuthStateChanged(auth, async (user: any) => {
			if(user) {
				const uid = user.uid || '';
				await fetchUserInfo(uid);
			} else {
				navigate('/auth/sign-in')
			}
			setIsChecking(false);
        });
        return () => unSub();
    }, [fetchUserInfo, navigate]);

	// Show loading state while checking auth
	if (isChecking) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return currentUser ? children : null;
}