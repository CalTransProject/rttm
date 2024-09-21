import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from 'firebase/auth';
import { UserAuth } from '../../context/AuthContext';
import { orange } from '@mui/material/colors';
import { auth } from '../../firebase';

const EmailChangeModal = ({open, onClose}) => {
    
    const [Password, setPassword] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const { user } = UserAuth();

    const updateEmailForCurrentUser = async () => {
        try {
            return await updateEmail(user, newEmail);
          } catch (e) {
            alert("Error.");
            console.log(e.message);
          }
    }

    if(!open) return null
    return (
        <div className='overlay'>
            <div className="modalContainer">
                <p>Change email address</p>
                <div className="modalRight">
                    <p onClick={onClose} style={{position: 'fixed', top: 14 + 'px', right: 16 +'px', fontSize: 16 + 'px', color: 'rgb(255, 69, 1)', cursor: 'pointer'}}>Cancel</p>
                </div>

                    <form style={{width: 100 + '%', height: 100 + '%', alignItems: 'center'}} onSubmit={updateEmailForCurrentUser}>  
                            <div style={{width: 75 + '%'}}>
                                <label for="current-email">Current email</label>
                                <input class="modalFields" id="current-email" type="email" onChange={(e) => setCurrentEmail(e.target.value)} required autoFocus></input>
                            </div>
                            <div style={{width: 75 + '%', fontSize: 14 + 'px'}}>
                                <label for="password">password</label>
                                <input class="modalFields" id="password" type="password" onChange={(e) => setPassword(e.target.value)} required></input>
                            </div>
                            <div style={{width: 75 + '%'}}>
                                <label for="new-email">New email</label>
                                <input class="modalFields" id="new-password" type="email" onChange={(e) => setNewEmail(e.target.value)} required></input>
                            </div>
                            <button class="modalBtn" type="submit" style={{top: 3 + 'px', marginBottom: 18 + 'px'}}>Submit</button>
                            <div style={{textAlign: 'center', width: 70 + '%', color: '#aaa', fontSize: 12 + 'px' }}>This may require Sign In.</div>
                    </form>
            </div>
        </div>
    )
}

export default EmailChangeModal; 