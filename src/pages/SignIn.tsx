import { Link } from "react-router-dom"
import { useSignin } from "../hooks/useSignin";

export const SignIn = () => {

  const { handleSignin, isLoading } = useSignin();

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

