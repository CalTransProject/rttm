import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import {collection, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import "./admin-controls.css"

const VerifyUsersModal = ({open, onClose}) => {
    
  const[data, setData] = useState([])
  const[search, setSearch] = useState('')
  
  // Retrieve UID and Email of all pending users from Firestore
  const getPendingUsers = async () => {
    const pendingUsers = query(collection(db, "user_list"), where("Active", "==", "False"));
    const querySnapshot = await getDocs(pendingUsers); 
    const data = querySnapshot.docs.map(doc => ({id: doc.id, Email: doc.data()["Email"]}))
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
    setData(data);
  }

  useEffect(() => {
    getPendingUsers()
  }, []);

  // Activate user based on user id, send email verification, and refresh the pending users list
  const activateUser = async (UID, email) => {
    await updateDoc(doc(db, "user_list", UID), {
      Active: "True"
    });
    getPendingUsers()
  }

    if(!open) return null
    return (
        <section className='overlay'>
            <div className="verifyUsersmodal">
                <p>Pending users</p>
                <div className="modalRight">
                    <p onClick={onClose} style={{position: 'fixed', top: 14 + 'px', right: 16 +'px', fontSize: 16 + 'px', color: '#ddd', cursor: 'pointer'}}>Done</p>
                </div>

                <div style={{display: 'flex', alignItems: "baseline", marginRight: 5 + 'px'}}>
                       <input type="search" autoFocus style={{backgroundColor: "#222", color: "#eee"}}
                       onChange={(e) => setSearch(e.target.value)} placeholder="Search..." id="example-search-input4" 
                       />
                </div>

                <table class='users-table'>   
                <thead>
                  <tr>
                    <th><div><i class="fas fa-envelope"></i> Email</div></th>   
                    <th>ID</th>           
                    <th >Actions:</th>
                  </tr>
                </thead>             
                <tbody>
                  {data.filter((data) => {
                    return search === ''
                    ? data
                    : data.id.includes(search);
                  })
                  .map((data, i) => (
                      <tr key={i}>
                        <td>{data.Email}</td>
                        <td>{data.id}</td>                 
                        <td>
                          <button className="btn btn-success" onClick={() => activateUser(data.id, data.Email)}>
                            <div><i class="far fa-check-circle"></i> Activate</div>
                          </button>
                          <button style={{margin:6+'px'}} className="btn btn-danger">
                            <div><i class="fas fa-user-alt-slash"></i> Remove</div>
                          </button>
                        </td>
                      </tr>
                  ))}                   
              </tbody>
              </table>
              </div>     

              </section>
    )
}

export default VerifyUsersModal; 