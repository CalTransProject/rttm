import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const ProtectLogin = ({children}) => {
    const { user } = UserAuth();

    if (user) {
        return <Navigate to='/my-account' />;
    }
    return children;
};

export default ProtectLogin;