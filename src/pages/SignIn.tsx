import { Link, useNavigate } from "react-router-dom"

export const SignIn = () => {

  const navigate = useNavigate();
  
  const login = () => {
    navigate("/")
  }

  return (
    <div>
      <h2>Welcome Back,</h2>
      <form>
        <input type="text" placeholder="Email" name="email" />
        <input type="text" placeholder="Password" name="password" />
        <Link to="">Forgot Password ?</Link>
        <button type="button" onClick={login}>Sign In</button>
        <div className="auth-form__secondary-cta">
          <span>Don't have an account yet ?</span>
          <Link to="/auth/sign-up">Register</Link>
        </div>
      </form>
    </div>
  )
}

