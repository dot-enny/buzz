import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react'

const PasswordInput = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <div className="relative">
            <input type={isPasswordVisible ? 'text' : 'password'} placeholder="Password" name="password" required className="w-full" />
            <button type="button" className="password-toggle absolute inset-y-0 right-3 text-blue-500" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                {
                    isPasswordVisible ?
                        <EyeIcon className="size-5" /> :
                        <EyeSlashIcon className="size-5" />
                }
            </button>
        </div>
    )
}

export default PasswordInput