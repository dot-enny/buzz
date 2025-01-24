import { useState, useEffect } from "react";

export const useSelectAvatar = () => {

    const [avatar, setAvatar] = useState<Avatar>({
        file: null,
        url: "/img/avatar-placeholder.png"
    });

    const selectAvatar = (e: any) => {
        if (e.target.files[0])
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
    };

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

    return { avatar, selectAvatar };
}