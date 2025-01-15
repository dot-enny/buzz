import { createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { upload } from "../lib/upload";

export const SignUp = () => {

	const [avatar, setAvatar] = useState<{
		file: File | null,
		url: string
	}>({
		file: null,
		url: "/img/avatar-placeholder.png"
	});

	useEffect(() => {
		if (!avatar.file) {
			fetch(avatar.url)
				.then(res => res.blob())
				.then(blob => {
					const file = new File([blob], "avatar-placeholder.png", { type: "image/png" });
					setAvatar(prev => ({ ...prev, file }));
				});
		}
	}, []);

	const [isLoading, setIsLoading] = useState(false);

	const handleAvatar = (e: any) => {
		if (e.target.files[0])
			setAvatar({
				file: e.target.files[0],
				url: URL.createObjectURL(e.target.files[0])
			});
	};

	const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		const formData = new FormData(e.target as HTMLFormElement);
		const { username, email, password } = Object.fromEntries(formData);

		try {
			const res = await createUserWithEmailAndPassword(auth, email as string, password as string);
			const imgUrl = await upload(avatar.file as unknown as File);

			await setDoc(doc(db, "users", res.user.uid), {
				username,
				email,
				id: res.user.uid,
				avatar: imgUrl,
				blocked: []
			});
			await setDoc(doc(db, "userchats", res.user.uid), {
				chats: []
			});

			toast.success("Account created successfully! You can now login!");
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div>
			<h2>Create an Account</h2>
			<form onSubmit={handleSignUp}>
				<label htmlFor="profile-picture" className="flex gap-4 items-center cursor-pointer underline text-neutral-100">
					<img src={avatar.url || '/img/avatar-placeholder.png'} alt="Profile Picture" className="w-12 h-12 rounded-full object-cover opacity-" />
					Upload Profile Picture
				</label>
				<input type="file" id="profile-picture" placeholder="Profile Picture" className="hidden" onChange={handleAvatar} />
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
