import React, { useEffect, useState, useContext } from 'react';
import "./subcomponents/sub-user-management/login-signup.css"
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from "./UserPool";
import {AccountContext} from "./Account";
// 

const UserAuthentication = () => { 

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmpassword, setConfirmPassword] = useState("")

  const onSignUp = (event) => {
     event.preventDefault();
    
     // If password and cofirmpassword do not match, then log mismatch error and return
      if (password !== confirmpassword){
        console.log('Passwords do not match.')
        return
      } 

      // Else, perform signUp with Cognito UserPool
      else {
        console.log('Passwords match.')
        UserPool.signUp(email, password, [], null, (err, data) => {
          if(err) {
            console.error(err);
          }
            console.log(data);
        });
      }
  };

  const { authenticate } = useContext(AccountContext);

  const onLogin = (event) => {
      event.preventDefault();

      authenticate(email, password)
      .then(data => {
        console.log("Logged in Successfully.", data);
      })
      .catch(err => {
        console.error("Failed to login.", err);
      });
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
        <h1 class="section-title"><br></br>Please login or create an account.</h1>
        <div class="forms">
          <div class="form-wrapper is-active">
            <button type="button" class="switcher switcher-login">
              Login
              <span class="underline"></span>
            </button>
            <form class="form form-login" onSubmit={onLogin}>
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
              <button type="" class="btn-forgotPassword">forgot password</button>
              <button type="submit" class="btn-login">Login</button>
            </form>
          </div>
          <div class="form-wrapper">
            <button type="button" class="switcher switcher-signup">
              Sign Up
              <span class="underline"></span>
            </button>
            <form class="form form-signup" onSubmit={onSignUp}>
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
      </section>
    )
  
} 

export default UserAuthentication;