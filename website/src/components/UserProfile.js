import React from 'react';
import "./subcomponents/sub-user-management/my-account.css"

// 
const UserProfile = () => { 
    //Page Layout
    return (
        <section>
        <div className="box">
        <h1 className="font-title">Account Details:</h1>   
        <h4 className="font-attributes">Username: Test User</h4>  
        <h4 className="font-attributes">Email: test@yahoo.com</h4>
        <h4 className="font-attributes">Password: ********</h4><br></br><br></br>
        <input class="change-password-button"  type="button" value="Change password" onclick=""/>
        <input class="change-password-button" type="button" value="Change email" onclick=""/>
        <input class="log-out-button" type="button" value="Log out" onclick=""/>
        <br></br>
        <br></br>
        <br></br>
        </div>      
        </section>
    )
} 

export default UserProfile;