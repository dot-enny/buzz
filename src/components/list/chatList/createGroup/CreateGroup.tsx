import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, UserGroupIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { useUserStore } from '../../../../lib/userStore'
import { collection, getDocs, query, where, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import { upload } from '../../../../lib/upload'
import { toast } from 'react-toastify'
import Tooltip from '../../../ui/Tooltip'

interface CreateGroupProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}

export default function CreateGroup({ isOpen, setIsOpen }: CreateGroupProps) {
  const { currentUser } = useUserStore()
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupPhoto, setGroupPhoto] = useState<{ file: File | null; url: string }>({
    file: null,
    url: '',
  })
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers()
    }
  }, [isOpen])

  const fetchAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('id', '!=', currentUser.id))
      const snapshot = await getDocs(q)

      const users: User[] = []
      snapshot.forEach((doc) => {
        users.push(doc.data() as User)
      })

      setAllUsers(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGroupPhoto({
        file,
        url: URL.createObjectURL(file),
      })
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    setIsCreating(true)

    try {
      // Upload group photo if provided
      let groupPhotoURL = ''
      if (groupPhoto.file) {
        groupPhotoURL = (await upload(groupPhoto.file)) as string
      }

      // Create chat document for the group
      const chatId = `group_${Date.now()}_${currentUser.id}`
      const chatRef = doc(db, 'chats', chatId)
      
      // Generate group name if not provided - list of first 3 members
      let finalGroupName = groupName.trim();
      if (!finalGroupName) {
        const memberNames = allUsers
          .filter(u => selectedUsers.includes(u.id))
          .slice(0, 3)
          .map(u => u.username);
        finalGroupName = memberNames.join(', ') + (selectedUsers.length > 3 ? '...' : '');
      }
      
      await setDoc(chatRef, {
        createdAt: new Date(),
        createdBy: currentUser.id,
        type: 'group',
        groupName: finalGroupName,
        ...(groupDescription.trim() && { groupDescription: groupDescription.trim() }),
        ...(groupPhotoURL && { groupPhotoURL }),
      })

      // Add all participants to the group (including creator)
      const participants = [currentUser.id, ...selectedUsers]
      
      // Create chat entry for each participant
      for (const userId of participants) {
        const userChatsRef = doc(db, 'userchats', userId)
        const userChatsDoc = await getDoc(userChatsRef)

        const newChatEntry: UserChat = {
          chatId,
          type: 'group',
          groupName: finalGroupName,
          ...(groupDescription.trim() && { groupDescription: groupDescription.trim() }),
          ...(groupPhotoURL && { groupPhotoURL }),
          participants,
          admins: [currentUser.id], // Creator is admin
          createdBy: currentUser.id,
          lastMessage: null,
          isSeen: userId === currentUser.id,
          unreadCount: 0,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }

        if (userChatsDoc.exists()) {
          await updateDoc(userChatsRef, {
            chats: arrayUnion(newChatEntry),
          })
        } else {
          await setDoc(userChatsRef, {
            chats: [newChatEntry],
          })
        }
      }

      toast.success('Group created successfully!')
      
      // Reset form
      setGroupName('')
      setGroupDescription('')
      setGroupPhoto({ file: null, url: '' })
      setSelectedUsers([])
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create group')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex h-full flex-col bg-neutral-900 shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="w-6 h-6 text-blue-500" />
                      <DialogTitle className="text-base font-semibold">Create Group Chat</DialogTitle>
                    </div>
                    <Tooltip tip="Close" className="-left-10">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-md hover:text-gray-500"
                      >
                        <XMarkIcon className="size-6" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Group Info Section */}
                <div className="p-6 border-b border-neutral-800">
                  {/* Group Photo */}
                  <div className="flex justify-center mb-4">
                    <label htmlFor="group-photo" className="cursor-pointer group relative">
                      <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {groupPhoto.url ? (
                          <img
                            src={groupPhoto.url}
                            alt="Group"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PhotoIcon className="w-10 h-10 text-neutral-600" />
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-white" />
                      </div>
                    </label>
                    <input
                      type="file"
                      id="group-photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  {/* Group Name */}
                  <input
                    type="text"
                    placeholder="Group name (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors mb-3"
                  />
                  
                  {/* Group Description */}
                  <textarea
                    placeholder="Group description (optional)"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Members Section */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 pb-4">
                    <h3 className="text-sm font-medium text-neutral-400 mb-2">
                      Add Members ({selectedUsers.length})
                    </h3>
                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* User List */}
                  <div className="flex-1 overflow-y-auto px-6">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className="flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg cursor-pointer transition-colors mb-2"
                      >
                        <img
                          src={user.avatar || '/img/avatar-placeholder.png'}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-neutral-500 line-clamp-1">{user.status}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedUsers.includes(user.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-neutral-600'
                          }`}
                        >
                          {selectedUsers.includes(user.id) && (
                            <CheckIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800">
                  <button
                    onClick={handleCreateGroup}
                    disabled={isCreating || selectedUsers.length === 0}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
