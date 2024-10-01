import { useState } from "react"
import { Link } from "react-router-dom";

export const SignUp = () => {

	const [avatar, setAvatar] = useState({
		file: null,
		url: ""
	});

	const handleAvatar = (e: any) => {
		if (e.target.files[0])
			setAvatar({
				file: e.target.files[0],
				url: URL.createObjectURL(e.target.files[0])
			});
	};

	return (
		<div className="w-[80%]">
			<h2>Create an Account</h2>
			<form>
				<label htmlFor="profile-picture" className="flex gap-4 items-center cursor-pointer underline text-neutral-100">
					<img src={avatar.url || '/img/avatar-placeholder.png'} alt="Profile Picture" className="w-12 h-12 rounded-full object-cover opacity-" />
					Upload Profile Picture
				</label>
				<input type="file" id="profile-picture" placeholder="Profile Picture" name="profile-picture" className="hidden" onChange={handleAvatar} />
				<input type="text" placeholder="Username" name="username" />
				<input type="text" placeholder="Email" name="email" />
				<input type="text" placeholder="Password" name="password" />
				<button>Sign Up</button>
				<div className="auth-form__secondary-cta">
					<span>Already have an account yet ?</span>
					<Link to="/auth/sign-in">Login</Link>
				</div>
			</form>
		</div>
	)
}
