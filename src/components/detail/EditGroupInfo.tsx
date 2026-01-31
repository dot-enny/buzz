import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useUserStore } from '../../lib/userStore'
import { useChatStore } from '../../lib/chatStore'
import { doc, updateDoc, collection, getDocs, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { upload } from '../../lib/upload'
import { toast } from 'react-toastify'
import Tooltip from '../ui/Tooltip'
import { GroupAvatar } from '../ui/Avatar'

interface EditGroupInfoProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}

export default function EditGroupInfo({ isOpen, setIsOpen }: EditGroupInfoProps) {
  const { currentUser } = useUserStore()
  const { chatId, groupData } = useChatStore()
  
  const [groupName, setGroupName] = useState(groupData?.groupName || '')
  const [groupDescription, setGroupDescription] = useState(groupData?.groupDescription || '')
  const [groupPhoto, setGroupPhoto] = useState<{ file: File | null; url: string }>({
    file: null,
    url: groupData?.groupPhotoURL || '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGroupPhoto({
        file,
        url: URL.createObjectURL(file),
      })
    }
  }

  const handleUpdateGroup = async () => {
    if (!chatId || !groupData) return

    // Check if user is admin
    if (!groupData.admins?.includes(currentUser.id)) {
      toast.error('Only admins can edit group info')
      return
    }

    setIsUpdating(true)

    try {
      // Upload new photo if provided
      let groupPhotoURL = groupData.groupPhotoURL || ''
      if (groupPhoto.file) {
        groupPhotoURL = (await upload(groupPhoto.file)) as string
      }

      // Use existing name if empty
      const finalGroupName = groupName.trim() || groupData.groupName

      // Update the chat document
      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        groupName: finalGroupName,
        ...(groupDescription.trim() && { groupDescription: groupDescription.trim() }),
        ...(groupPhotoURL && { groupPhotoURL }),
      })

      // Update all participants' userchats
      const participants = groupData.participants || []
      for (const userId of participants) {
        const userChatsRef = doc(db, 'userchats', userId)
        const userChatsDoc = await getDocs(query(collection(db, 'userchats')))
        
        userChatsDoc.forEach(async (docSnap) => {
          if (docSnap.id === userId) {
            const userData = docSnap.data() as { chats: UserChat[] }
            const chats = userData.chats || []
            
            const updatedChats = chats.map((chat: UserChat) => {
              if (chat.chatId === chatId) {
                return {
                  ...chat,
                  groupName: finalGroupName,
                  ...(groupDescription.trim() && { groupDescription: groupDescription.trim() }),
                  ...(groupPhotoURL && { groupPhotoURL }),
                }
              }
              return chat
            })
            
            await updateDoc(userChatsRef, {
              chats: updatedChats,
            })
          }
        })
      }

      toast.success('Group info updated successfully!')
      setIsOpen(false)
      
      // Refresh the page to update the UI
      window.location.reload()
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Failed to update group info')
    } finally {
      setIsUpdating(false)
    }
  }

  const isAdmin = groupData?.admins?.includes(currentUser.id)

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
                    <DialogTitle className="text-base font-semibold">Edit Group Info</DialogTitle>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {!isAdmin && (
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg text-yellow-400 text-sm">
                      Only admins can edit group info
                    </div>
                  )}

                  {/* Group Photo */}
                  <div className="flex justify-center mb-6">
                    <label htmlFor="edit-group-photo" className={`cursor-pointer group relative ${!isAdmin ? 'pointer-events-none opacity-50' : ''}`}>
                      <div className="w-32 h-32 rounded-full overflow-hidden">
                        {groupPhoto.url ? (
                          <img
                            src={groupPhoto.url}
                            alt="Group"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <GroupAvatar 
                            name={groupData?.groupName || 'Group'} 
                            size="lg"
                          />
                        )}
                      </div>
                      {isAdmin && (
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PhotoIcon className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </label>
                    {isAdmin && (
                      <input
                        type="file"
                        id="edit-group-photo"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    )}
                  </div>

                  {/* Group Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={!isAdmin}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Group Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter group description (optional)"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      disabled={!isAdmin}
                      rows={4}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Group Info */}
                  <div className="space-y-3 pt-4 border-t border-neutral-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Members</span>
                      <span className="text-white">{groupData?.participants?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Created by</span>
                      <span className="text-white">{groupData?.createdBy === currentUser.id ? 'You' : 'Admin'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                {isAdmin && (
                  <div className="p-6 border-t border-neutral-800">
                    <button
                      onClick={handleUpdateGroup}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      {isUpdating ? 'Updating...' : 'Update Group Info'}
                    </button>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
