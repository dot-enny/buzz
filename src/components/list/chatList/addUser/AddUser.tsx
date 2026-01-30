import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useAddUser, UserWithChatInfo } from '../../../../hooks/useAddUser'
import Tooltip from '../../../ui/Tooltip'
import { useEffect, useState } from 'react'
import { Spinner } from '../../../ui/Spinner'
import { Avatar } from '../../../ui/Avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { bubblySpring } from '../../../ui/ConnectionStatus'

export default function AddUser({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchUsers, openChat, isLoading, filteredUsers, setFilterInput, totalUnadded } = useAddUser(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchQuery('');
      setFilterInput('');
    }
  }, [isOpen]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilterInput(query);
  };

  // Determine if we're showing unadded users or search results
  const isShowingUnadded = !searchQuery.trim();
  const hasResults = filteredUsers.length > 0;

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
              <div className="flex h-full flex-col bg-neutral-900 shadow-xl">
                <DrawerHeader setIsOpen={setIsOpen} />
                <SearchBar value={searchQuery} onChange={handleSearch} />
                
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner />
                    </div>
                  ) : !hasResults && isShowingUnadded ? (
                    <AllCaughtUpState />
                  ) : !hasResults && !isShowingUnadded ? (
                    <NoResultsState query={searchQuery} />
                  ) : (
                    <>
                      {isShowingUnadded && totalUnadded > 0 && (
                        <SectionHeader 
                          title="Discover people" 
                          subtitle={`${totalUnadded} user${totalUnadded !== 1 ? 's' : ''} you haven't messaged`}
                        />
                      )}
                      {!isShowingUnadded && hasResults && (
                        <SectionHeader 
                          title="Search results" 
                          subtitle={`${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`}
                        />
                      )}
                      <UserList users={filteredUsers} openChat={openChat} />
                    </>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

const DrawerHeader = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => (
  <div className="p-6 pb-4">
    <div className="flex items-start justify-between">
      <div>
        <DialogTitle className="text-lg font-semibold">New Message</DialogTitle>
        <p className="text-sm text-neutral-400 mt-1">Find someone to start a conversation</p>
      </div>
      <div className="ml-3 flex h-7 items-center">
        <Tooltip tip="Close" className="-left-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="relative rounded-md text-neutral-400 hover:text-white transition-colors"
          >
            <span className="absolute -inset-2.5" />
            <XMarkIcon aria-hidden="true" className="size-6" />
          </button>
        </Tooltip>
      </div>
    </div>
  </div>
)

const SearchBar = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <div className="px-6 pb-4">
    <div className="flex items-center gap-3 bg-neutral-800 rounded-xl px-4 py-3">
      <MagnifyingGlassIcon className="text-neutral-400 size-5 shrink-0" />
      <input 
        type="text" 
        placeholder="Search by username..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500"
        autoFocus
      />
    </div>
  </div>
)

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="px-6 py-2 border-b border-neutral-800">
    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
    <p className="text-xs text-neutral-600 mt-0.5">{subtitle}</p>
  </div>
)

const AllCaughtUpState = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
      <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-green-400" />
    </div>
    <p className="text-neutral-300 font-medium">You've messaged everyone!</p>
    <p className="text-neutral-500 text-sm mt-1">Search for specific users above</p>
  </motion.div>
)

const NoResultsState = ({ query }: { query: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <p className="text-neutral-400">No users found matching "{query}"</p>
  </motion.div>
)

const UserList = ({ users, openChat }: { 
  users: UserWithChatInfo[], 
  openChat: (user: UserWithChatInfo) => void
}) => (
  <ul role="list" className="divide-y divide-neutral-800">
    <AnimatePresence>
      {users.map((user, index) => (
        <UserListItem 
          key={user.id} 
          user={user} 
          openChat={openChat}
          index={index}
        />
      ))}
    </AnimatePresence>
  </ul>
)

const UserListItem = ({ user, openChat, index }: { 
  user: UserWithChatInfo, 
  openChat: (user: UserWithChatInfo) => void,
  index: number
}) => (
  <motion.li
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ ...bubblySpring, delay: index * 0.05 }}
  >
    <button 
      onClick={() => openChat(user)}
      className="w-full group relative flex items-center px-6 py-4 hover:bg-neutral-800/50 transition-colors"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative">
          <Avatar src={user.avatar} name={user.username} size="md" />
          {user.isAdded && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center">
              <ChatBubbleLeftEllipsisIcon className="w-3 h-3 text-blue-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-white">{user.username}</p>
            {user.isAdded && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 font-medium">
                Active
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-500">{user.status || 'Hey there! I\'m using Buzz'}</p>
        </div>
      </div>
      <Tooltip tip={user.isAdded ? "Continue chat" : "Start chat"} className="-left-10">
        <div className={`p-2 rounded-full transition-colors ${
          user.isAdded 
            ? 'bg-blue-600/20 group-hover:bg-blue-600/30' 
            : 'bg-neutral-700/50 group-hover:bg-neutral-700'
        }`}>
          {user.isAdded ? (
            <ChatBubbleLeftEllipsisIcon className="size-5 text-blue-400" />
          ) : (
            <UserPlusIcon className="size-5 text-neutral-300" />
          )}
        </div>
      </Tooltip>
    </button>
  </motion.li>
)