import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";

export const SignUp = () => {

	const { signUp, selectAvatar, avatar, isLoading } = useSignup();

	return (
		<div>
			<h2>Create an Account</h2>
			<form onSubmit={signUp}>
				<label htmlFor="profile-picture" className="flex gap-4 items-center cursor-pointer underline text-neutral-100">
					<img src={avatar.url || '/img/avatar-placeholder.png'} alt="Profile Picture" className="w-12 h-12 rounded-full object-cover opacity-" />
					Upload Profile Picture
				</label>
				<input type="file" id="profile-picture" placeholder="Profile Picture" className="hidden" onChange={selectAvatar} />
				<input type="text" placeholder="Username" name="username" required />
				<input type="email" placeholder="Email" name="email" required />
				<input type="password" placeholder="Password" name="password" required />
				<button disabled={isLoading}>{isLoading ? 'Loading...' :'Sign Up'}</button>
				<div className="auth-form__secondary-cta">
					<span>Already have an account yet ?</span>
					<Link to="/auth/sign-in">Login</Link>
				</div>
			</form>
		</div>
	)
}
