import React, { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { UserAuth } from '../../context/AuthContext';
import { Alert } from 'bootstrap';

const PasswordChangeModal = ({open, onClose}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { user } = UserAuth();

    const updatePasswordForCurrentUser = async () => {
        if (newPassword == confirmPassword && reauthenticateWithCredential(getAuth().currentUser.email, currentPassword)) {
            console.log("Password Changed.");
            return await updatePassword(user, newPassword);   // Update current user's password
        } else {
            Alert("Inputs do not match.");
            console.log("Inputs do not match.");
        }        
    }

    if(!open) return null

    return (
        <div className='overlay'>
            <div className="modalContainer">
           <p>Change password</p>
                <div className="modalRight">
                    <p onClick={onClose} style={{position: 'fixed', top: 14 + 'px', right: 16 +'px', fontSize: 16 + 'px', color: 'rgb(255, 69, 1)', cursor: 'pointer'}}>Cancel</p>
                </div>
                
                    <form style={{width: 100 + '%', alignItems: 'center'}}>  
                            <div style={{width: 75 + '%', fontSize: 14 + 'px'}}>
                                <label for="current-password">Current password</label>
                                <input class="modalFields" id="current-password" type="password" onChange={(e) => setCurrentPassword(e.target.value)} required autoFocus></input>
                            </div>
                            <div style={{width: 75 + '%', fontSize: 14 + 'px'}}>
                                <label for="new-password">New password</label>
                                <input class="modalFields" id="new-password" type="password" onChange={(e) => setNewPassword(e.target.value)} required></input>
                            </div>
                            <div style={{width: 75 + '%', fontSize: 14 + 'px'}}>
                                <label for="confirm-password">Confirm new password</label>
                                <input class="modalFields" id="confirm-password" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required></input>
                            </div>
                            <button class="modalBtn" type="submit" style={{top: 5 + 'px', marginBottom: 19 + 'px'}} onClick={updatePasswordForCurrentUser}>Submit</button>
                            <div style={{textAlign: 'center', width: 70 + '%', color: '#aaa', fontSize: 12 + 'px' }}>This may require Sign In.</div>
                    </form>
            </div>
        </div>
    )
}

export default PasswordChangeModal; 
