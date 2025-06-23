import { useState, useEffect } from "react";
import { useUserStore } from "../lib/userStore";

export const useSelectAvatar = (isOpen?: boolean) => {
    const { currentUser } = useUserStore();
    const [avatar, setAvatar] = useState<Avatar>({
        file: null,
        url: ""
    });

    const selectAvatar = (e: any) => {
        if (e.target.files[0])
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
    };
    const removeAvatar = () => {
        setAvatar({ file: null, url: "" })
    }

    useEffect(() => {
        if (isOpen && !avatar.url && currentUser.avatar) {
            setAvatar({ file: null, url: currentUser.avatar })
        }
    }, [isOpen])

    return { avatar, selectAvatar, removeAvatar };
}