import { doc, getDoc, updateDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../lib/firebase";
import { upload } from "../lib/upload";
import { useState } from "react";
import { useUserStore } from "../lib/userStore";

export const useUpdateProfile = () => {

    const [isLoading, setIsLoading] = useState(false);

    const { currentUser } = useUserStore();

    const updateProfile = async (userData: { username: string, status: string, avatar: Avatar }) => {
        const userRef = collection(db, "users");
        setIsLoading(true);

        try {
            const imgUrl = userData.avatar.file ? await upload(userData.avatar.file as unknown as File) : null;
            const userDoc = doc(userRef, currentUser.id);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const existingUserData = userSnapshot.data();
                await updateDoc(userDoc, {
                    ...existingUserData,
                    username: userData.username,
                    status: userData.status,
                    avatar: imgUrl ? imgUrl : ""
                });
            }

            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(err.message)
            console.error(err)
        } finally {
            setIsLoading(false);
        }
    }

    return { updateProfile, updatingProfile: isLoading };
}