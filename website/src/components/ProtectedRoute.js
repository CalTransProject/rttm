import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Header from './page-components/Header';
import Mainpage from './Mainpage';

const ProtectedRoute = ({children}) => {

    const navigate = useNavigate();
    const [permission, setPermission] = useState('');
    const { user } = UserAuth();

    const getPermission = async () => {
        const QuerySnapshot = await getDoc(doc(db, "user_list", auth.currentUser.uid));
        setPermission(QuerySnapshot.data()['role']);
    }
    
    getPermission()

    if (!user) {
        if (/my-account/.test(window.location.href) == false)
        {
            alert("You must be logged in to access this page.")           
        }     
        return <Navigate to='/user-authentication' />
    }

    return children;
};

export default ProtectedRoute;
