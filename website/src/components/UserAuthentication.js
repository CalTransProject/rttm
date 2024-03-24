import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import React, { useEffect, useState, createContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./subcomponents/sub-user-management/login-signup.css"
import { UserAuth } from '../context/AuthContext';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import { auth } from '../firebase';
import { collection, doc, getDoc , setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Alert } from 'bootstrap';

const UserAuthentication = () => { 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] =useState('');
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

  const { logout} = UserAuth();
  const { createUser } = UserAuth();
  const { signIn } = UserAuth();
  const navigate = useNavigate();

  // Sign up user and add fields to Firestore
  const SignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Firebase CreateUser and Add Fields to Firestore Document in (user_list) Collection
      await createUser(email, password); 
      await updateProfile(auth.currentUser, { displayName: name}).catch( 
        (error) => console.log(error)
      );
        
      await setDoc(doc(db, "user_list", auth.currentUser.uid), {
        role: "general",
        Active: "False",
        Email: auth.currentUser.email
      });

      await logout()
      alert("Sign up request submitted and awaiting admin approval. Please check your email for a verification link.")

    } catch (e) {
      setError(e.message);
      alert(error.toString());
      console.log(e.message);
    }
  };

  const SignIn = async (e) => {
    e.preventDefault();
    setError('');
    document.getElementById("login-btn").textContent = "loading..."
    
    await new Promise(r => setTimeout(r, 500));

    try {   
      await signIn(email, password);
      const QuerySnapshot = await getDoc(doc(db, "user_list", auth.currentUser.uid));
      
      if ((QuerySnapshot.data()['Active']) == "False") {
        alert("Your account is not active yet.")
        await logout();
        var loginBtn = '<div><i class="fas fa-sign-in-alt"></i> Login</div>'
        document.getElementById("login-btn").innerHTML = loginBtn     
      }
      
      else
      navigate('/my-account');
    } catch (e) {
      console.log(e.message);
      setError(e.message);
      alert(error);
      var loginBtn = '<div><i class="fas fa-sign-in-alt"></i> Login</div>'
      document.getElementById("login-btn").innerHTML = loginBtn     
    }
  };

  // Enables switcher effect
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
              <button id="login-btn" type="submit" class="btn-login"><div><i class="fas fa-sign-in-alt"></i> Login</div></button>
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
                  <label for="signup-name">Name</label>
                  <input id="signup-name" type="text" maxLength={25} onChange={(e) => setName(e.target.value)} required></input>
                </div>
                <div class="input-block">
                  <label for="signup-email">E-mail</label>
                  <input id="signup-email" type="email" onChange={(e) => setEmail(e.target.value)} required></input>
                </div>
                <div class="input-block">
                  <label for="signup-password">Password</label>
                  <input id="signup-password" placeholder='Minimum 8 characters' type="password" minLength={8} onChange={(e) => setPassword(e.target.value)} required></input>
                </div>
                <div class="input-block">
                  <label for="signup-password-confirm">Confirm password</label>
                  <input id="signup-password-confirm" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required></input>
                </div>
              </fieldset>
              <button type="submit" class="btn-signup">Request</button>
            </form>
          </div>
        </div>
      </section>
    )
  
} 

export default UserAuthentication;
