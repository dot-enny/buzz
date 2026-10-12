import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";
import { Spinner } from "../components/ui/Spinner";
import PasswordInput from "../components/ui/PasswordInput";
import { CameraIcon } from "@heroicons/react/24/solid";

export const SignUp = () => {

	const { signUp, selectAvatar, avatar, isLoading } = useSignup();

	return (
		<div>
			<h2>Create an Account</h2>
			<form onSubmit={signUp}>
				<div className="flex flex-col gap-3">
					<span className="text-sm font-medium text-neutral-200">Profile picture <span className="font-normal text-neutral-500">(optional)</span></span>
					<label htmlFor="profile-picture" className="group flex items-center gap-4 cursor-pointer rounded-lg border border-dashed border-neutral-700 bg-neutral-900/60 p-3 transition-colors hover:border-blue-500 hover:bg-neutral-900">
						<span className="relative shrink-0">
							<img src={avatar.url || '/img/avatar-placeholder.png'} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-800" />
							<span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-neutral-900">
								<CameraIcon className="h-3.5 w-3.5" aria-hidden="true" />
							</span>
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-medium text-neutral-100">{avatar.url ? 'Change photo' : 'Choose a photo'}</span>
							<span className="mt-1 block text-xs text-neutral-500">JPG, PNG or GIF</span>
						</span>
					</label>
				</div>
				<input type="file" id="profile-picture" accept="image/*" className="hidden" onChange={selectAvatar} />
				<input type="text" placeholder="Username" name="username" required />
				<input type="email" placeholder="Email" name="email" required />
				<PasswordInput />
				<button disabled={isLoading}>
					<span className={`${isLoading && 'invisible'}`}>Sign Up</span>
					<Spinner className={`${!isLoading && 'invisible'} m-auto absolute inset-0`} />
				</button>
				<div className="auth-form__secondary-cta">
					<span>Already have an account yet ?</span>
					<Link to="/auth/sign-in">Login</Link>
				</div>
			</form>
		</div>
	)
}
