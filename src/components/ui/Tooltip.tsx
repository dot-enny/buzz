import { useState } from 'react'

export default function Tooltip({ children, tip, className }: { children: React.ReactNode, tip: string, className?: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="relative inline-block text-left min-w-max"
        >
            {children}
            <div className={`min-w-max text-xs absolute transition-all duration-300 bg-gray-900 p-2 rounded ${isOpen ? 'opacity-100 delay-700' : 'opacity-0 delay-0'} ${className}`}>
                {tip}
            </div>
        </div>
    )
}
