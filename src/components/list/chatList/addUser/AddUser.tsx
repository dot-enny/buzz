export const AddUser = () => {
    return (
        <div className="absolute inset-0 w-max h-max m-auto p-7 bg-neutral-900 rounded-lg">
            <form className="flex gap-5">
                <input type="text" placeholder="Username" name="username" className="bg-neutral-800 p-3 rounded-lg border-none outline-none" />
                <button className="bg-blue-900 py-3 px-4 rounded-lg">Search</button>
            </form>
            <div className="mt-12 flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <img src="/img/avatar-placeholder.png" alt="" className="w-14 h-14 rounded-full object-cover" />
                    <span>Jane Doe</span>
                </div>
                <button className="bg-blue-900 py-2 px-3 rounded-lg">Add User</button>
            </div>
        </div>
    )
}

