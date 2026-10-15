import { PropsWithChildren, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../lib/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Spinner } from "./ui/Spinner";
import { FirebaseConfigNotice } from "./ui/FirebaseConfigNotice";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
	
	const { fetchUserInfo, currentUser, isLoading: isUserLoading } = useUserStore();
	const navigate = useNavigate();
	const [isChecking, setIsChecking] = useState(true);
	const [authError, setAuthError] = useState<Error | null>(null);

	useEffect(() => {
		if (!isFirebaseConfigured) {
			setIsChecking(false);
			return;
		}

        const unSub = onAuthStateChanged(auth, async (user: any) => {
			if(user) {
				const uid = user.uid || '';
				await fetchUserInfo(uid);
			} else {
				navigate('/auth/sign-in')
			}
			setIsChecking(false);
	        }, (error) => {
			setAuthError(error);
			setIsChecking(false);
		});
        return () => unSub();
    }, [fetchUserInfo, navigate]);

	if (!isFirebaseConfigured || authError) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
				<FirebaseConfigNotice />
			</div>
		);
	}

	// Show loading state while checking auth
	if (isChecking) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (currentUser) return children;

	return (
		<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
			<div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
				<h1 className="text-lg font-semibold text-white">Profile unavailable</h1>
				<p className="mt-2 text-sm leading-6 text-neutral-400">
					Your sign-in succeeded, but your Buzz profile could not be loaded.
				</p>
				<button
					disabled={isUserLoading}
					onClick={() => signOut(auth).then(() => navigate('/auth/sign-in'))}
					className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Sign out
				</button>
			</div>
		</div>
	);
}