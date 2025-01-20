// 'use client'

// import { useEffect, useState } from 'react'
// import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
// import { ArrowPathIcon, MinusCircleIcon, PaperAirplaneIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
// import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
// import { classNames } from '../../utils/helpers'
// import React from 'react'
// import { useAddUser } from '../../hooks/useAddUser'
// import { IconSearch } from '../icons/IconSearch'
// import Tooltip from './Tooltip'

// const tabs = [
//   { name: 'All', href: '#', current: true },
//   { name: 'Online', href: '#', current: false },
//   { name: 'Offline', href: '#', current: false },
// ]

// export default function Drawer({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {

//   const { fetchUsers, searchUser, isLoading, addUser, addingUserId, users } = useAddUser()

//   useEffect(() => {
//     if (isOpen) fetchUsers();
//   }, [isOpen])

//   return (
//     <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
//       <DialogBackdrop
//         transition
//         className="fixed inset-0 bg-gray-900/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
//       />
//       <div className="fixed inset-0" />
//       <div className="fixed inset-0 overflow-hidden">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
//             <DialogPanel
//               transition
//               className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
//             >
//               <div className="flex h-full flex-col overflow-y-scroll bg-neutral-900 shadow-xl">
//                 <DrawerHeader setIsOpen={setIsOpen} />
//                 <Tabs />
//                 <SearchBar searchUser={searchUser} isLoading={isLoading} />
//                 <DrawerTeamList users={users} addUser={addUser} addingUserId={addingUserId} />
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </div>
//     </Dialog>
//   )
// }

// const DrawerHeader = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => (
//   <div className="p-6">
//     <div className="flex items-start justify-between">
//       <DialogTitle className="text-base font-semibold">Team</DialogTitle>
//       <div className="ml-3 flex h-7 items-center">
//         <button
//           type="button"
//           onClick={() => setIsOpen(false)}
//           className="relative rounded-md hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
//         >
//           <span className="absolute -inset-2.5" />
//           <span className="sr-only">Close panel</span>
//           <XMarkIcon aria-hidden="true" className="size-6" />
//         </button>
//       </div>
//     </div>
//   </div>
// )

// const DrawerTeamList = ({ users, addUser, addingUserId }: { users: (User & { isAdded: boolean })[], addUser: (val: User) => void, addingUserId: string | null }) => (
//   <ul role="list" className="flex-1 divide-y divide-gray-200 overflow-y-auto">
//     {users.map((user) => (
//       <DrawerTeamListItem key={user.id} user={user} addUser={addUser} isAddingUserId={addingUserId == user.id} />
//     ))}
//   </ul>
// )

// const DrawerTeamListItem = ({ user, addUser, isAddingUserId }: { user: User & { isAdded: boolean }, addUser: (val: User) => void, isAddingUserId: boolean }) => (
//   <li>
//     <div className="group relative flex items-center px-5 py-6 hover:bg-gray-800/30">
//       <div className="-m-1 block flex-1 p-1">
//         <div aria-hidden="true" className="absolute inset-0 group-hover:bg-gray-800" />
//         <div className="relative flex min-w-0 flex-1 items-center">
//           <DrawerTeamListItemImage user={user} />
//           <DrawerTeamListItemDetails user={user} />
//         </div>
//       </div>
//       <DrawerTeamListItemMenu />
//       <button onClick={() => addUser(user)}>
//         { user.isAdded ? 
//         <Tooltip tip="Remove User" className="-left-10">
//           <MinusCircleIcon className="text-white size-7 hover:animate-pulse" />
//         </Tooltip>
//           : isAddingUserId ? <ArrowPathIcon className="text-white size-7 animate-spin" /> :
//           <Tooltip tip="Add User" className="-left-5">
//             <PlusCircleIcon className="text-white size-7 hover:animate-pulse" />
//           </Tooltip>
//         }
//       </button>
//     </div>
//   </li>
// )

// const DrawerTeamListItemImage = ({ user }: { user: User }) => (
//   <span className="relative inline-block shrink-0">
//     <img alt="" src={user.avatar} className="size-10 rounded-full" />
//     <span
//       aria-hidden="true"
//       className={classNames(
//         Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-300',
//         'absolute right-0 top-0 block size-2.5 rounded-full ring-2 ring-white',
//       )}
//     />
//   </span>
// )

// const DrawerTeamListItemDetails = ({ user }: { user: User }) => (
//   <div className="ml-4 truncate">
//     <p className="truncate text-sm font-medium text-gray-100">{user.username}</p>
//     <p className="truncate text-sm text-gray-500">{user.status}</p>
//   </div>
// )

// const DrawerTeamListItemMenu = () => (
//   <Menu as="div" className="relative ml-2 inline-block shrink-0 text-left">
//     <MenuButton className="group relative inline-flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
//       <span className="absolute -inset-1.5" />
//       <span className="sr-only">Open options menu</span>
//       <span className="flex size-full items-center justify-center rounded-full">
//         <EllipsisVerticalIcon
//           aria-hidden="true"
//           className="size-5 text-gray-400 group-hover:text-gray-500"
//         />
//       </span>
//     </MenuButton>
//     <MenuItems
//       transition
//       className="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
//     >
//       <div className="py-1">
//         <MenuItem>
//           <a
//             href="#"
//             className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
//           >
//             View profile
//           </a>
//         </MenuItem>
//         <MenuItem>
//           <a
//             href="#"
//             className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
//           >
//             Send message
//           </a>
//         </MenuItem>
//       </div>
//     </MenuItems>
//   </Menu>
// )

// const Tabs = () => {
//   return (
//     <div className="border-b border-gray-200">
//       <div className="px-6">
//         <nav className="-mb-px flex space-x-6">
//           {tabs.map((tab) => (
//             <a
//               key={tab.name}
//               href={tab.href}
//               className={classNames(
//                 tab.current
//                   ? 'border-indigo-500 text-indigo-500'
//                   : 'border-transparent hover:border-gray-300 hover:text-gray-700',
//                 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
//               )}
//             >
//               {tab.name}
//             </a>
//           ))}
//         </nav>
//       </div>
//     </div>
//   )
// }

// const SearchBar = ({ searchUser }: { searchUser: (val: string) => void, isLoading: boolean }) => {
//   return (
//     <div className="flex-1 bg-neutral-900 flex items-center gap-5 p-2 rounded-lg">
//       <IconSearch />
//       <input type="text" placeholder="Search"
//         onChange={(e) => searchUser(e.target.value)}
//         className="bg-transparent border-none outline-none text-white"
//       />
//     </div>
//   )
// }
