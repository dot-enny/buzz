import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";
import { useCheckGlobalChat } from "./useCheckGlobalChat";

export const useSignin = () => {
    const { initializeUserChatsForGlobal } = useCheckGlobalChat();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const { email, password } = Object.fromEntries(formData);

        try {
            const res = await signInWithEmailAndPassword(auth, email as string, password as string);
            await initializeUserChatsForGlobal(res.user.uid);
            navigate('/')
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }
    
    return { handleSignin, isLoading }
}