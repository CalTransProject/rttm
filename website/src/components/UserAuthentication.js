import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import React, { useEffect, useState, createContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./subcomponents/sub-user-management/login-signup.css"
import { UserAuth } from '../context/AuthContext';
import ForgotPasswordModal from './modals/ForgotPasswordModal';

const UserAuthentication = () => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] =useState('');
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

  const { createUser } = UserAuth();
  const { signIn } = UserAuth();
  const navigate = useNavigate();

  const SignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUser(email, password);
      navigate('/my-account');
    } catch (e) {
      setError(e.message);
      alert(error.toString());
      console.log(e.message);
    }
  };

  const SignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/my-account');
    } catch (e) {
      setError(e.message);
      alert(error.toString());
      console.log(e.message);
    }
  };

  useEffect(() => {
        const switchers = [...document.querySelectorAll('.switcher')]

        switchers.forEach(item => {
	      item.addEventListener('click', function() {
		    switchers.forEach(item => item.parentElement.classList.remove('is-active'))
		    this.parentElement.classList.add('is-active')
	    })
    }) 
  });

  return (
      <section class="forms-section">
        <div><ForgotPasswordModal open={openForgotPasswordModal} onClose={() => setOpenForgotPasswordModal(false)}/></div>
        <h1 class="section-title"><br></br>Please login or create an account.</h1>
        <div class="forms">
          <div class="form-wrapper is-active">
            <button type="button" class="switcher switcher-login">
              Login
              <span class="underline"></span>
            </button>
            <form class="form form-login" onSubmit={SignIn}>
              <fieldset>
                <legend>Please, enter your email and password for login.</legend>
                <div class="input-block">
                  <label for="login-email">E-mail</label>
                  <input id="login-email" type="email" onChange={(e) => setEmail(e.target.value)} required autoFocus></input>
                </div>
                <div class="input-block">
                  <label for="login-password">Password</label>
                  <input id="login-password" type="password" onChange={(e) => setPassword(e.target.value)} required></input>
                </div>
              </fieldset>
              <button type="button" class="btn-forgotPassword" onClick={() => setOpenForgotPasswordModal(true)}>forgot password</button>
              <button type="submit" class="btn-login">Login</button>
            </form>
          </div>
          <div class="form-wrapper">
            <button type="button" class="switcher switcher-signup">
              Sign Up
              <span class="underline"></span>
            </button>
            <form class="form form-signup" onSubmit={SignUp}>
              <fieldset>
                <legend>Please, enter your email, password and password confirmation for sign up.</legend>
                <div class="input-block">
                  <label for="signup-email">E-mail</label>
                  <input id="signup-email" type="email" onChange={(e) => setEmail(e.target.value)} required></input>
                </div>
                <div class="input-block">
                  <label for="signup-password">Password</label>
                  <input id="signup-password" placeholder='Minimum 8 characters' type="password" onChange={(e) => setPassword(e.target.value)} required></input>
                </div>
                <div class="input-block">
                  <label for="signup-password-confirm">Confirm password</label>
                  <input id="signup-password-confirm" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required></input>
                </div>
              </fieldset>
              <button type="submit" class="btn-signup">Continue</button>
            </form>
          </div>
        </div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
      </section>
    )
  
} 

export default UserAuthentication;