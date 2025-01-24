'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ArrowPathIcon, CheckBadgeIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAddUser } from '../../../../hooks/useAddUser'
import Tooltip from '../../../ui/Tooltip'
import { useEffect } from 'react'

export default function AddUser({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {

  const { fetchUsers, addUser, addingUserId, filteredUsers, setFilterInput } = useAddUser()

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen])

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-neutral-900 shadow-xl">
                <DrawerHeader setIsOpen={setIsOpen} />
                <SearchBar setFilterInput={setFilterInput} isLoading={false} />
                <UserList users={filteredUsers} addUser={addUser} addingUserId={addingUserId} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

const DrawerHeader = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => (
  <div className="p-6">
    <div className="flex items-start justify-between">
      <DialogTitle className="text-base font-semibold">Add other users on buzz as friends</DialogTitle>
      <div className="ml-3 flex h-7 items-center">
        <Tooltip tip="Close panel" className="-left-10">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="relative rounded-md hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
          >
            <span className="absolute -inset-2.5" />
            <span className="sr-only">Close panel</span>
            <XMarkIcon aria-hidden="true" className="size-6" />
          </button>
        </Tooltip>
      </div>
    </div>
  </div>
)

const UserList = ({ users, addUser, addingUserId }: { users: (User & { isAdded: boolean })[], addUser: (val: User) => void, addingUserId: string | null }) => (
  <ul role="list" className="flex-1 divide-y divide-gray-200 overflow-y-auto">
    {users.map((user) => (
      <UserListItem key={user.id} user={user} addUser={addUser} isAddingUserId={addingUserId == user.id} />
    ))}
  </ul>
)

const UserListItem = ({ user, addUser, isAddingUserId }: { user: User & { isAdded: boolean }, addUser: (val: User) => void, isAddingUserId: boolean }) => (
  <li>
    <div className="group relative flex items-center px-5 py-6 hover:bg-gray-800/30">
      <div className="-m-1 block flex-1 p-1">
        {/* <div aria-hidden="true" className="absolute inset-0 group-hover:bg-gray-800" /> */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <TeamListItemImage user={user} />
          <TeamListItemDetails user={user} />
        </div>
      </div>
      {/* <DrawerTeamListItemMenu /> */}
      <button onClick={() => !user.isAdded ? addUser(user) : null}>
        { user.isAdded ? 
          <CheckBadgeIcon className="text-white size-7 cursor-default" />
          : isAddingUserId ? <ArrowPathIcon className="text-white size-7 animate-spin" /> :
          <Tooltip tip="add user" className="-left-5">
            <PlusIcon className="text-white size-6" />
          </Tooltip>
        }
      </button>
    </div>
  </li>
)

const TeamListItemImage = ({ user }: { user: User }) => (
  <span className="relative inline-block shrink-0">
    <img alt="" src={user.avatar} className="size-10 rounded-full object-cover" />
    {/* <span
      aria-hidden="true"
      className={classNames(
        Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-300',
        'absolute right-0 top-0 block size-2.5 rounded-full ring-2 ring-white',
      )}
    /> */}
  </span>
)

const TeamListItemDetails = ({ user }: { user: User }) => (
  <div className="ml-4 truncate">
    <p className="truncate text-sm font-medium text-gray-100">{user.username}</p>
    <p className="truncate text-sm text-gray-500">{user.status}</p>
  </div>
)

const SearchBar = ({ setFilterInput }: { setFilterInput: (val: string) => void, isLoading: boolean }) => {
  return (
    <div className="bg-neutral-900 flex items-center gap-5 px-6 py-2 rounded-lg">
      <MagnifyingGlassIcon className="text-white size-5" />
      <input type="text" placeholder="Search"
        onChange={(e) => setFilterInput(e.target.value)}
        className="bg-transparent border-none outline-none text-white"
      />
    </div>
  )
}