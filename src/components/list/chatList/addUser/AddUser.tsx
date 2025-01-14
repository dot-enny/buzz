import React from "react";
import { useAddUser } from "../../../../hooks/useAddUser";

export const AddUser = () => {

    const { searchUser, isLoading, addUser, addingUserId, users } = useAddUser()

    return (
        <div className="absolute inset-0 w-max h-max m-auto p-7 bg-neutral-900 rounded-lg">
            <SearchBar searchUser={searchUser} isLoading={isLoading} />
            {
                users.length > 0 &&
                <div className="mt-12">
                    {users.map(user => (
                        <React.Fragment key={user.id}>
                            <UserItem user={user} handleAddUser={addUser} isAddingUser={addingUserId === user.id} />
                        </React.Fragment>
                    ))}
                </div>
            }
        </div>
    )
}

const SearchBar = ({ searchUser, isLoading }: { searchUser: (e: React.FormEvent<HTMLFormElement>) => void, isLoading: boolean }) => {
    return (
        <form className="flex gap-5" onSubmit={searchUser}>
            <input type="text" placeholder="Username" name="username" className="bg-neutral-800 p-3 rounded-lg border-none outline-none" />
            <button className="bg-blue-900 py-3 px-4 rounded-lg w-max relative flex items-center">
                <span className={`${isLoading ? 'visible' : 'invisible'} absolute inset-x-0 mb-2`}>...</span>
                <span className={!isLoading ? 'visible' : 'invisible'}>Search</span>
            </button>
        </form>
    )
}

const UserItem = ({ user, handleAddUser, isAddingUser}: { user: any, handleAddUser: (user: any) => void, isAddingUser: boolean }) => {
    return (
        <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-5">
                <img src={user.avatar || '/img/avatar-placeholder.png'} alt="" className="w-14 h-14 rounded-full object-cover" />
                <span>{user.username}</span>
            </div>
            <button disabled={user.isAdded} className="bg-blue-900 py-2 px-3 rounded-lg relative disabled:bg-transparent" onClick={() => handleAddUser(user)}>
                {
                    user.isAdded ?
                    (
                        <span className="text-sm">User Added</span>
                    ) :
                    (
                        <>
                            <span className={`${isAddingUser ? 'visible' : 'invisible'} absolute inset-x-0 mb-2`}>...</span>
                            <span className={!isAddingUser ? 'visible' : 'invisible'}>Add User</span>
                        </>
                    )
                }
            </button>
        </div>
    )
}
