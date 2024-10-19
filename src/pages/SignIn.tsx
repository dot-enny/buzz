import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";

export const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
		const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email as string, password as string);
      navigate('/')
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Welcome Back,</h2>
      <form onSubmit={handleSignin}>
        <input type="email" placeholder="Email" name="email" required />
        <input type="password" placeholder="Password" name="password" required />
        <Link to="" className="w-fit">Forgot Password ?</Link>
        <button disabled={isLoading}>{ isLoading ? 'Loading...' : 'Sign In' }</button>
        <div className="auth-form__secondary-cta">
          <span>Don't have an account yet ?</span>
          <Link to="/auth/sign-up">Register</Link>
        </div>
      </form>
    </div>
  )
}

