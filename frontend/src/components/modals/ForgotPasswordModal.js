import React, { useState, useEffect, state } from 'react';
import { getAuth, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

const ForgotPasswordModal = ({open, onClose}) => {
    const [error, setError] =useState('');
    const [showEmailSent, setShowEmailSent] = useState('hidden');
    const [description, setDescription] = useState('Please enter your account\'s email address to receive a password reset link.');
    const [email, setEmail] = useState('');

    // Close the modal and reset values
    const closeModal = () => {
        onClose();
        setShowEmailSent('hidden');
        setEmail('');
    };

    // Update email const and hide 'Link sent' message if visible
    const emailFieldUpdate = (e) => {
        setShowEmailSent('hidden');
        setDescription('Please enter the email address associated with your account.');
        setEmail(e.target.value);
    };

    // Send reset email and if successful, then show 'Link sent' message
    const sendResetEmail = async (e) => {
        e.preventDefault(); 
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setShowEmailSent('visible');
            setDescription('Please check your email for password reset instructions.');
            console.log("Password reset link sent.");
        } catch (e) {
            setError(e.message);
            console.log(e.message);
        }  
    }

    if(!open) return null
    return (
        <div className='overlay'>
            <div className="modalContainer">
                <p>Forgot Password</p>
                <div className="modalRight">
                    <p onClick={closeModal} className="modalcloseBtn" style={{position: 'fixed', top: 14 + 'px', right: 16 +'px', fontSize: 16 + 'px', color: 'rgb(255, 69, 1)', cursor: 'pointer'}}>Go back</p>
                </div>
                    <form style={{width: 100 + '%', height: 100 + '%', alignItems: 'center'}} onSubmit={sendResetEmail}>  
                            <div style={{width: 75 + '%'}}>
                                <label for="current-email">Email address</label>
                                <input class="modalFields" id="current-email" type="email" required autoFocus onChange={emailFieldUpdate}></input>
                            </div>
                            <div style={{textAlign: 'center', width: 250 + 'px', color: 'orange', color: '#aaa', fontSize: 13 + 'px'}}>{description}</div>
                            <div style={{display: 'inline-flex', paddingTop: 17 + 'px', paddingBottom: 0 + 'px', visibility: showEmailSent}}><img style={{borderRadius: 100 + 'px', width: 28 + 'px', height: 28 + 'px', marginBottom: 12 + 'px'}} src={ require('../../images/check_mark.png') }></img><div style={{paddingTop: 3 + 'px', paddingLeft: 11 + 'px', fontSize: 14 +  'px'}}>Link sent</div></div>
                            
                            <button class="modalBtn" type="submit" style={{top: 8 + 'px', marginBottom: 12 + 'px'}}>Send Link</button>
                    </form>
            </div>
        </div>
    )
}

export default ForgotPasswordModal; 