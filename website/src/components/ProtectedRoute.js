import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [permission, setPermission] = useState('');
  const { user } = UserAuth();

  const getPermission = async () => {
    const userDocRef = doc(db, "user_list", auth.currentUser.uid);

    try {
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot) {
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setPermission(userData.role);
        } else {
          console.log("User document does not exist");
        }
      } else {
        console.log("Error retrieving user document");
      }
    } catch (error) {
      console.error("Error retrieving user document:", error);
      // You can also handle the error in a more user-friendly way, such as displaying an error message to the user.
    }
  }

  useEffect(() => {
    if (user) {
      getPermission();
    }
  }, [user]);

  if (!user) {
    if (/my-account/.test(window.location.href) === false) {
      alert("You must be logged in to access this page.");
    }
    return <Navigate to='/user-authentication' />
  }

  return children;
};

export default ProtectedRoute;