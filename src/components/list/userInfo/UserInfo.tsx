import { IconCamera } from "../../icons/IconCamera"
import { IconEdit } from "../../icons/IconEdit"
import { IconMore } from "../../icons/IconMore"

export const UserInfo = () => {
  return (
    <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
            <img src="./img/avatar-placeholder.png" alt="user" className="w-12 h-12 rounded-full object-cover" />
            <h2>John Doe</h2>
        </div>
        <div className="flex gap-5">
            <IconMore />
            <IconCamera />
            <IconEdit />
        </div>
    </div>
  )
}
