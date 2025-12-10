"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAuthenticating, setIsAuthenicating] = useState(false);

  const { login, signup, resetPassword } = useAuth();
  const router = useRouter();

  const cantAuth = !email.includes("@") || password.length < 6;

  async function handleAuthUser() {
    // check if email is legit and password is acceptable
    if (cantAuth) {
      return;
    }
    setIsAuthenicating(true);
    try {
      if (isRegister) {
        // then we need to register a user
        await signup(email, password);
      } else {
        // otherwise they are wanting to login
        await login(email, password);
      }
      // after authenticating push the user to notes page
      router.push("/notes");
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsAuthenicating(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.includes("@")) {
      {
        alert("please enter a valid email first");
        return;
      }
    }
    try {
      await resetPassword(email);
      alert("the password reset link has been sent to your email");
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <>
      <div className="login-container">
        <h1 className="text-gradient">MYNOTES</h1>
        <h3>Turning scattered thoughts into neat, effortless maps.</h3>
        <h3>
          Create a personal vault where every idea is neatly indexed and
          effortlessly discoverable.
        </h3>
        <div className="full-line"></div>
        <h6 className="text-gradient">
          {isRegister ? "Create an account" : "Log in"}
        </h6>
        <div>
          <p>Email</p>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="text"
            placeholder="Enter your email Address"
          />
        </div>
        <div>
          <p>Password</p>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            placeholder="*******"
          />
        </div>
        <button
          onClick={handleAuthUser}
          disabled={cantAuth || isAuthenticating}
          className="submit-btn"
        >
          <h6>{isAuthenticating ? "Submitting..." : "Submit"}</h6>
        </button>
        <div className="secondary-btns-container">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            className="card-button-secondary"
          >
            <small>{isRegister ? "Log in" : "Sign up"}</small>
          </button>
          <button
            onClick={handleForgotPassword}
            className="card-button-secondary"
          >
            <small>Forgot password?</small>
          </button>
        </div>
        <div className="full-line"></div>
        <footer>
          <a target="_blank" href="https://github.com/krishangmmenon/notesapp">
            <img
              alt="pfp"
              src="https://avatars.githubusercontent.com/u/120028307?v=4"
            />
            <h6>@krishangmmenon</h6>
            <i className="fa-brands fa-github"></i>
          </a>
        </footer>
      </div>
    </>
  );
}
