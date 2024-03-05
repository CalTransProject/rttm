import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import "./subcomponents/sub-user-management/my-account.css"
import { useNavigate } from 'react-router-dom';
import PasswordChangeModal from './modals/PasswordChangeModal';
import EmailChangeModal from './modals/EmailChangeModal';
import { auth, db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { red } from '@mui/material/colors';
import { collection, doc, getDoc } from 'firebase/firestore';


const UserProfile = () => {  

    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [permission, setPermission] = useState('');
    var isAdmin = false

    const {user, logout} = UserAuth();
    const navigate = useNavigate();

    const getPermission = async () => {
      const QuerySnapshot = await getDoc(doc(db, "user_list", auth.currentUser.uid));
      setPermission(QuerySnapshot.data()['role']);
    }

    getPermission()
    if (permission == "admin")
      isAdmin = true

    const showUserManagement = async () => {
      //navigate('/user-management');
    }

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
          {isAdmin ? (           
            <div style={{display: "flex", overflow: 'hidden', alignItems: 'center', justifyContent: "center", marginTop: 0 + 'px', background: "linear-gradient(45deg, rgb(63, 64, 112, 0.5),rgb(63, 64, 112, 0.9), rgb(53, 54, 102, 1) 100%)", padding: 10 + "px", width: 100 + "%"}} >
               <div style={{color: "#eee", paddingRight: 25 +'px'}}>User Management:</div>
              <div style={{paddingRight: 5 +'px'}}>
                <button class="Btn" onClick={showUserManagement}>Create a user</button>
              </div>
              <div style={{paddingRight: 5 +'px'}}>
                <button class="Btn">Delete a user</button>
              </div>   
              <div>
                <button class="Btn">Reset Password</button>
              </div>        
            </div>
          ) : (
            <div></div>
          )}  
          
        <br></br>
        <h5 className="font-title"></h5>  
        <br></br><img style={{borderRadius: 100 + 'px', marginTop: 4 + 'px', width: 106 + 'px', height: 106 + 'px'}} src={ require('../images/userlogo.png') } /><br></br>
        <h4 className="font-attributes">{user && user.displayName}</h4>
        <h1 className="font-attributes">{user && user.email}</h1>
        <br></br>
        
        <button class="change_Btn" onClick={() => setOpenPasswordModal(true)}>Change my password</button>
        <button class="change_Btn"  onClick={() => setOpenEmailModal(true)}>Change my email</button>
        <button class="log-out-button" onClick={handleLogout}>Log Out</button>
        <br></br>
          <hr style={{margin: 'auto', marginTop: 0 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
          <div style={{textAlign: 'center', fontSize: 14 + 'px', color: 'rgb(195, 197, 198)'}}>
          Sign up date:<br></br>
          {getAuth().currentUser?.metadata.creationTime}        
        <div style={{textAlign: 'center', fontSize: 14 + 'px', color: 'rgb(195, 197, 198)'}}>
          <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
          Last login:<br></br>
          {getAuth().currentUser?.metadata.lastSignInTime}
        <div style={{textAlign: 'center', fontSize: 14 + 'px', color: 'rgb(195, 197, 198)'}}>
          <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
          Account type: <div style={{fontWeight: "bold"}}>{permission.toString()}</div>
        </div>
        </div>
        </div>
        </section>
    )
} 

export default UserProfile;
