import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import "./subcomponents/sub-user-management/my-account.css"
import { useNavigate } from 'react-router-dom';
import PasswordChangeModal from './modals/PasswordChangeModal';
import EmailChangeModal from './modals/EmailChangeModal';
import { auth } from '../firebase';
import { getAuth } from 'firebase/auth';
import { red } from '@mui/material/colors';

const UserProfile = () => { 

    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openEmailModal, setOpenEmailModal] = useState(false);

    const {user, logout} = UserAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await logout();
        navigate('/user-authentication');
        console.log('Logged out.'); 
      } catch (e) {
        console.log(e.message);
      }
    };

    //Page Layout
    return (
        <section>
          <PasswordChangeModal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)}/>
          <EmailChangeModal open={openEmailModal} onClose={() => setOpenEmailModal(false)}/>
        <br></br><br></br>
        <h1 className="font-title">Account Details:</h1>  
        <br></br> <br></br><img style={{borderRadius: 100 + 'px', width: 114 + 'px', height: 114 + 'px'}} src={ require('../images/userlogo.png') } /><br></br>
        <h4 className="font-attributes">{user && user.email}</h4>
        <br></br>
        <input class="change_Btn"  type="button" value="Change password" onClick={() => setOpenPasswordModal(true)}/> 
        <input class="change_Btn" type="button" value="Change email"  onClick={() => setOpenEmailModal(true)}/>
        <button class="log-out-button" onClick={handleLogout}>Log Out</button>
        <br></br>
        <hr style={{margin: 'auto', marginTop: 0 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
        <div style={{top: 10 + 'px', textAlign: 'center', fontSize: 14 + 'px', color: 'rgb(195, 197, 198)'}}>
        Sign up date:<br></br>
        {getAuth().currentUser?.metadata.creationTime}
        <div style={{top: 10 + 'px', textAlign: 'center', fontSize: 14 + 'px', color: 'rgb(195, 197, 198)'}}>
        <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
        Last login:<br></br>
        {getAuth().currentUser?.metadata.lastSignInTime}
        </div>
        </div>
        </section>
    )
} 

export default UserProfile;