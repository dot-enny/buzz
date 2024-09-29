import { IconChevronDown } from "../icons/IconChevronDown"
import { IconChevronUp } from "../icons/IconChevronUp"
import { IconDownload } from "../icons/IconDownload"

export const Detail = () => {
  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* CONTACT PROFILE */}
      <div className="user py-7 px-5 flex flex-col items-center gap-5 border-b border-neutral-800">
        <img src="./img/avatar-placeholder.png" alt="user" className="w-24 h-24 rounded-full object-cover" />
        <h2>Jane Doe</h2>
        <p className="text-neutral-500">Lorem ipsum dolor, sit amet.</p>
      </div>
      {/* CHAT MENU */}
      <div className="info p-5 flex-1 flex flex-col gap-7 overflow-auto">
        <Options />
        <button className="mt-1 text-red-500 w-fit mx-auto">Block User</button>
      </div>
    </div>
  )
}

const Options = () => {
  return (
    <>
      <Option title="Chat Settings" open={false} />
      <Option title="Chat Settings" open={false} />
      <Option title="Privacy & help" open={false} />
      <div>
        <Option title="Shared Photos" open />
        <div className="photos flex flex-col gap-5 mt-4">
          <PhotoItem />
          <PhotoItem />
          <PhotoItem />
          <PhotoItem />
        </div>
      </div>
      <Option title="Shared Files" open={false} />
    </>
  )
}

const Option = ({ title, open }: { title: string, open: boolean }) => {
  return (
    <div className="option">
      <div className="title flex items-center justify-between">
        <span>{title}</span>
        {open ? <IconChevronDown /> : <IconChevronUp />}
      </div>
    </div>
  )
}

const PhotoItem = () => {
  return (
    <div className="photo-item flex justify-between items-center gap-5">
      <div className="photo-detail flex items-center gap-5">
        <img src="./img/photo-placeholder.png" alt="photo" className="w-10 h-10 object-cover" />
        <span className="text-sm text-gray-300 font-light">photo_2024_2.png</span>
      </div>
      <IconDownload />
    </div>
  )
}