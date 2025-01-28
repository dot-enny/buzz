'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CameraIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSelectAvatar } from '../../../hooks/useSelectAvatar';
import { useUpdateProfile } from '../../../hooks/useUpdateProfile';
import { FormEventHandler } from 'react';
import { useUserStore } from '../../../lib/userStore';

interface EditInfoProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function EditInfo({ isOpen, setIsOpen }: EditInfoProps) {

    const { currentUser, fetchUserInfo } = useUserStore();
    const { avatar, selectAvatar } = useSelectAvatar();
    const { updateProfile, updatingProfile } = useUpdateProfile();

    const handleSubmit = async (e: React.FormEvent) => {
        const formData = new FormData(e.target as HTMLFormElement);
        const { username, status } = Object.fromEntries(formData) as { username: string, status: string };
        e.preventDefault();
        try {
            await updateProfile({ username, status, avatar });
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsOpen(false);
            fetchUserInfo(currentUser.id)
        }
    };

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-900/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-neutral-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            </button>
                        </div>

                        <div className="flex sm:items-center">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                                <UserCircleIcon aria-hidden="true" className="size-6 text-blue-600" />
                            </div>
                            <div className="mt-3 sm:ml-4 sm:mt-0 max-sm:ml-4 max-sm:w-full">
                                <DialogTitle as="h3" className="text-base font-semibold">
                                    Edit Profile
                                </DialogTitle>
                            </div>
                        </div>

                        <div className="p-4 mt-2">
                            <DialogContent selectAvatar={selectAvatar} avatar={avatar} handleSubmit={handleSubmit} isLoading={updatingProfile} />
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

interface DialogContentProps {
    selectAvatar: (e: any) => void;
    avatar: Avatar;
    handleSubmit: FormEventHandler<HTMLFormElement>;
    isLoading: boolean;
}

const DialogContent = ({ selectAvatar, avatar, handleSubmit, isLoading }: DialogContentProps) => {

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label htmlFor="avatar" className="mx-auto relative cursor-pointer">
                <img src={avatar.url || '/img/avatar-placeholder.png'} alt="Profile Picture" className="size-20 rounded-full object-cover" />
                <div className="mix-blend-multiply hover:bg-gray-400 transition-all size-20 rounded-full grid place-items-center absolute top-0">
                    <CameraIcon className="size-5" />
                </div>
                <input type="file" id="avatar" className="hidden" onChange={selectAvatar} />
            </label>
            <label htmlFor="username" className="text-sm flex gap-3 items-center">
                <span className="min-w-max">Username :</span>
                <input type="text" name="username" className="bg-neutral-800 p-3 rounded-lg border-none outline-none w-full" />
            </label>
            <label htmlFor="status" className="text-sm flex gap-3 items-center">
                <span className="min-w-max">Status :</span>
                <input type="text" name="status" className="bg-neutral-800 p-3 rounded-lg border-none outline-none w-[80%]" />
            </label>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    disabled={isLoading}
                >
                    {isLoading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </form>
    )
}
