import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { upload } from "../lib/upload";
import { useSelectAvatar } from "./useSelectAvatar";

export const useSignup = () => {

    const [isLoading, setIsLoading] = useState(false);
    const { avatar, selectAvatar } = useSelectAvatar();

    const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email as string, password as string);
            const imgUrl = await upload(avatar.file as unknown as File);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                avatar: imgUrl,
                status: "I'm using buzz",
                blocked: []
            });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });

            toast.success("Account created successfully! You can now login!");
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsLoading(false);
        }
    }

    return { isLoading, avatar, selectAvatar, signUp }

}