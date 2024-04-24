import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import "./subcomponents/sub-user-management/my-account.css"
import { useNavigate } from 'react-router-dom';
import PasswordChangeModal from './modals/PasswordChangeModal';
import EmailChangeModal from './modals/EmailChangeModal';
import VerifyUsersModal from './modals/VerifyUsersModal';
import { auth, db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { red } from '@mui/material/colors';
import { collection, doc, getDoc } from 'firebase/firestore';

const UserProfile = () => {  
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [openVerifyUsersModal, setOpenVerifyUsersModal] = useState(false);
    const [permission, setPermission] = useState('');
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const {user, logout} = UserAuth();
    const navigate = useNavigate();

    const getPermission = async () => {  
      const QuerySnapshot = await getDoc(doc(db, "user_list", auth.currentUser.uid));      
      setPermission(QuerySnapshot.data()['role']);
      if (permission == "admin")
      {
        setIsAdmin(true)
      }   
      else 
      {
        setIsAdmin(false)
      }
      setUsername(auth.currentUser.displayName);
    }

    getPermission()

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
          <VerifyUsersModal open={openVerifyUsersModal} onClose={() => setOpenVerifyUsersModal(false)}/> 

           <div style={{display: "flex", overflow: 'hidden', alignItems: 'center', justifyContent: "center", marginTop: 25 + 'px', marginBottom: 0 + 'px', background: "transparent", padding: 10 + "px", width: "auto"}} >
              <div style={{justifyContent:'center', paddingTop: 5 +'px'}}>
                <label style={{textAlign:'center', fontSize: 20 + "px"}}>Welcome, {username}</label>
              </div>       
            </div>
            <br></br>
            <h5 className="font-title"></h5>  
            <img style={{borderRadius: 100 + 'px', marginTop: 0 + 'px', width: 94 + 'px', height: 94 + 'px'}} src={ require('../images/userlogo.png') } /><br></br>
            <h1 className="font-attributes">{user && user.email}</h1>
            <br></br>
            
        <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", padding: 10 + "px", borderRadius: 10 + 'px'}}>      
        
        {isAdmin ? (       
          <Suspense fallback={<div>Wait</div>}> 
              <div style={{backgroundColor: "#43404F", margin: 10 + 'px', borderRadius: 10 + 'px', textAlign: "center", padding: 17 + "px", color: "#eee"}}>
                <i class="fas fa-user-shield"></i> <p>Admin controls</p> 
                <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 15 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
                <button class="Btn" onClick={() => setOpenVerifyUsersModal(true)}><div><i class="fas fa-user-friends"style={{marginRight: 5 +'px'}}></i> Pending users</div></button>
                <button class="Btn"><div><i class="fas fa-user-slash" style={{marginRight: 5 +'px'}}></i> Delete a user</div></button>
                <button class="Btn"><div><i class="fas fa-unlock" style={{marginRight: 5 +'px'}}></i> Reset password</div></button>
              </div>
          </Suspense>   
  
          ) : (
            <div></div>
          )}
     
          <div style={{backgroundColor: "#43404F",  margin: 10 + 'px', borderRadius: 10 + 'px', textAlign: "center", padding: 17 + "px", color: "#eee"}}>
              <i class="fas fa-list"></i> <p>Actions</p>
              <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 15 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
                  
              <button class="Btn" onClick={() => setOpenPasswordModal(true)}><div><i class="fas fa-key" style={{marginRight: 5 +'px'}}></i> Change my password</div></button>
              <button class="Btn"  onClick={() => setOpenEmailModal(true)}><div><i class="fas fa-envelope" style={{marginRight: 5 +'px'}}></i> Change my email</div></button>
              <button class="log-out-button" onClick={handleLogout}><div><i class="fas fa-sign-out-alt" style={{marginRight: 5 +'px'}}></i> Log out</div></button>
          </div>

          <div style={{backgroundColor: "#43404F",  margin: 10 + 'px', borderRadius: 10 + 'px', textAlign: "center", padding: 17 + "px", color: "#eee"}}>
              <i class="fas fa-user"></i> <p>Information</p>
              <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
                
              <div style={{textAlign: 'center', fontSize: 13 + 'px', color: 'rgb(195, 197, 198)'}}>
                  Sign up date:<br></br>
                  {getAuth().currentUser?.metadata.creationTime}        
              <div style={{textAlign: 'center', fontSize: 13 + 'px', color: 'rgb(195, 197, 198)'}}>
                  <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
                  Last login:<br></br>
                  {getAuth().currentUser?.metadata.lastSignInTime}
              <div style={{textAlign: 'center', fontSize: 13+ 'px', color: 'rgb(195, 197, 198)'}}>
                  <hr style={{margin: 'auto', marginTop: 10 + 'px', marginBottom: 10 + 'px', color: "#fff", width: 240 + 'px'}}></hr>
                  Account type: <div style={{fontWeight: "bold"}}>{permission.toString()}</div>
              </div>
            </div>
          </div>

         </div>
       </div>  
          

        </section>
    )
} 

export default UserProfile;
