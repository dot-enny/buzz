import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { upload } from "../lib/upload";

export const useSignup = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [avatar, setAvatar] = useState<{
        file: File | null,
        url: string
    }>({
        file: null,
        url: "/img/avatar-placeholder.png"
    });

    useEffect(() => {
        if (!avatar.file) {
            fetch(avatar.url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "avatar-placeholder.png", { type: "image/png" });
                    setAvatar(prev => ({ ...prev, file }));
                });
        }
    }, []);


    const selectAvatar = (e: any) => {
        if (e.target.files[0])
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
    };

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