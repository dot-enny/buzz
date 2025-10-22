'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAppStateStore } from '../../lib/appStateStore'
import { Detail } from './Detail'
import { useDragDetailPanel } from '../../hooks/useDragDetailPanel'

export default function MobileDetail() {
  const { isChatDetailOpen, setIsChatDetailOpen } = useAppStateStore()
  
  const { dragOffset, isDragging, handlers } = useDragDetailPanel({
    onClose: () => setIsChatDetailOpen(false),
    isOpen: isChatDetailOpen,
    threshold: 100,
  })

  return (
    <Dialog open={isChatDetailOpen} onClose={() => setIsChatDetailOpen(false)} className="relative z-10 xl:hidden h-[100svh]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              style={
                isDragging && isChatDetailOpen
                  ? {
                      transform: `translateX(${dragOffset}px)`,
                      transition: 'none',
                    }
                  : undefined
              }
              {...handlers}
            >
              <div className="flex h-full flex-col overflow-y-scrol bg-neutral-900 shadow-xl relative">
                <button
                  type="button"
                  onClick={() => setIsChatDetailOpen(false)}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus:ring-indigo-500 focus:ring-offset-2 absolute right-0 m-6 z-10"
                >
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
                <div className="relative flex-1 px-4 sm:px-6"><Detail /></div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
