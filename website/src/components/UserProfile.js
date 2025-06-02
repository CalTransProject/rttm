import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { UserAuth } from '../context/AuthContext';
import "./subcomponents/sub-user-management/my-account.css";
import { useNavigate } from 'react-router-dom';
import PasswordChangeModal from './modals/PasswordChangeModal';
import EmailChangeModal from './modals/EmailChangeModal';
import VerifyUsersModal from './modals/VerifyUsersModal';
import { auth, db } from '../firebase';
import { deleteUser, getAuth } from 'firebase/auth';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import ReactEcharts from "echarts-for-react"; // Import ReactEcharts for charts

const UserProfile = () => {  
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openVerifyUsersModal, setOpenVerifyUsersModal] = useState(false);
  const [permission, setPermission] = useState(null); // Changed initial state to null
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(null); // Changed initial state to null
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [mlMemoryUsage, setMlMemoryUsage] = useState([]); // State for ML memory usage
  const { user, logout } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getPermission = async () => {  
      try {
        const QuerySnapshot = await getDoc(doc(db, "user_list", auth.currentUser.uid));      
        const userRole = QuerySnapshot.data()['role'];
        setPermission(userRole);
        if (userRole === "admin") {
          setIsAdmin(true);
          setUsername("Admin");
        } else {
          setIsAdmin(false);
          setUsername(auth.currentUser.displayName || "User");
        }
        setIsLoading(false); // Data is loaded
      } catch (e) {
        console.log(e.message);
        setIsLoading(false); // Even if there's an error, we stop loading
      }     
    };

    getPermission();
  }, []);

  const DeleteAccount = async () => {
    try {  
      var answer = window.confirm("This action cannot be undone. Are you sure you want to delete your account?");
      if (answer) {
        await deleteUser(auth.currentUser); // Remove user from Firebase auth
        await deleteDoc(doc(db, "user_list", auth.currentUser.uid)); // Remove user details from Firestore db
        console.log('Account deleted successfully.');
        navigate('/user-authentication');
      } else {
        console.log('Account is not deleted.');
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/user-authentication');
      console.log('Logged out.'); 
    } catch (e) {
      console.log(e.message);
    }
  };

  // Activity Monitor related code
  const updateMlMemoryUsage = useCallback(() => {
    // Placeholder for real data fetching
    const newMemoryData = {
      time: new Date().toLocaleTimeString(),
      peakMemory: Math.random() * 1000,
      averageMemory: Math.random() * 800,
      currentMemory: Math.random() * 600
    };

    setMlMemoryUsage(prevData => [...prevData, newMemoryData].slice(-60));
  }, []);

  useEffect(() => {
    const memoryUpdateInterval = setInterval(updateMlMemoryUsage, 1000);
    return () => clearInterval(memoryUpdateInterval);
  }, [updateMlMemoryUsage]);

  if (isLoading) {
    // You can return a loading spinner or null while data is loading
    return null;
  }

  // MemoryUsageChart component
  const MemoryUsageChart = ({ data }) => {
    const option = {
      title: {
        text: 'ML Model Memory Usage',
        textStyle: {
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
        },
        left: 'center',
        top: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltip = `Time: ${params[0].axisValue}<br/>`;
          params.forEach(param => {
            tooltip += `${param.seriesName}: ${param.value.toFixed(2)} MB<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Peak Memory', 'Average Memory', 'Current Memory'],
        textStyle: { color: 'white' },
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.time),
        axisLabel: { color: 'white', rotate: 45, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'Memory (MB)',
        nameTextStyle: { color: 'white' },
        axisLabel: { color: 'white' },
      },
      series: [
        {
          name: 'Peak Memory',
          data: data.map(item => item.peakMemory),
          type: 'line',
          smooth: true,
        },
        {
          name: 'Average Memory',
          data: data.map(item => item.averageMemory),
          type: 'line',
          smooth: true,
        },
        {
          name: 'Current Memory',
          data: data.map(item => item.currentMemory),
          type: 'line',
          smooth: true,
        }
      ],
      color: ['#FF6384', '#36A2EB', '#FFCE56'],
    };

    return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
  };

  // My Account Page Layout
  return (
    <section>
      <PasswordChangeModal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} />
      <EmailChangeModal open={openEmailModal} onClose={() => setOpenEmailModal(false)} />
      <VerifyUsersModal open={openVerifyUsersModal} onClose={() => setOpenVerifyUsersModal(false)} /> 

      <motion.div
        style={{
          display: "flex",
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: "center",
          marginTop: '25px',
          marginBottom: '0px',
          background: "transparent",
          padding: "10px",
          width: "auto"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ justifyContent: 'center', paddingTop: '5px' }}>
          <motion.label
            style={{ textAlign: 'center', fontSize: "20px" }}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome, {username}
          </motion.label>
        </div>       
      </motion.div>
      <br />
      <h5 className="font-title"></h5>  
      <motion.img
        style={{
          borderRadius: '100px',
          marginTop: '0px',
          width: '94px',
          height: '94px'
        }}
        src={require('../images/userlogo.png')}
        alt="User Logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <br />
      <motion.h1
        className="font-attributes"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {user && user.email}
      </motion.h1>
      <br />
      
      <motion.div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "10px",
          borderRadius: '10px'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >      
        {isAdmin && (       
          <Suspense fallback={<div>Loading...</div>}> 
            <motion.div
              style={{
                backgroundColor: "#43404F",
                margin: '10px',
                borderRadius: '10px',
                textAlign: "center",
                padding: "17px",
                color: "#eee"
              }}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <i className="fas fa-user-shield"></i> <p>Admin controls</p> 
              <hr style={{ margin: 'auto', marginTop: '10px', marginBottom: '15px', color: "#fff", width: '240px' }}></hr>
              <motion.button
                className="Btn"
                onClick={() => setOpenVerifyUsersModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div><i className="fas fa-user-friends" style={{ marginRight: '5px' }}></i> Pending users</div>
              </motion.button>
              <motion.button
                className="Btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div><i className="fas fa-user-slash" style={{ marginRight: '5px' }}></i> Delete a user</div>
              </motion.button>
              <motion.button
                className="Btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div><i className="fas fa-unlock" style={{ marginRight: '5px' }}></i> Reset password</div>
              </motion.button>
            </motion.div>
          </Suspense>   
        )}
     
        <motion.div
          style={{
            backgroundColor: "#43404F",
            margin: '10px',
            borderRadius: '10px',
            textAlign: "center",
            padding: "17px",
            color: "#eee"
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <i className="fas fa-list"></i> <p>Actions</p>
          <hr style={{ margin: 'auto', marginTop: '10px', marginBottom: '15px', color: "#fff", width: '240px' }}></hr>
              
          <motion.button
            className="Btn"
            onClick={() => setOpenPasswordModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div><i className="fas fa-key" style={{ marginRight: '5px' }}></i> Change my password</div>
          </motion.button>
          <motion.button
            className="Btn"
            onClick={() => setOpenEmailModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div><i className="fas fa-envelope" style={{ marginRight: '5px' }}></i> Change my email</div>
          </motion.button>
          <motion.button
            className="log-out-button"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div><i className="fas fa-sign-out-alt" style={{ marginRight: '5px' }}></i> Log out</div>
          </motion.button>
        </motion.div>

        <motion.div
          style={{
            backgroundColor: "#43404F",
            margin: '10px',
            borderRadius: '10px',
            textAlign: "center",
            padding: "17px",
            color: "#eee"
          }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <i className="fas fa-user"></i> <p>Information</p>
          <hr style={{ margin: 'auto', marginTop: '10px', marginBottom: '10px', color: "#fff", width: '240px' }}></hr>
            
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgb(195, 197, 198)' }}>
            Sign up date:<br />
            {getAuth().currentUser?.metadata.creationTime}        
            <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgb(195, 197, 198)' }}>
              <hr style={{ margin: 'auto', marginTop: '10px', marginBottom: '10px', color: "#fff", width: '240px' }}></hr>
              Last login:<br />
              {getAuth().currentUser?.metadata.lastSignInTime}
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgb(195, 197, 198)' }}>
                <hr style={{ margin: 'auto', marginTop: '10px', marginBottom: '10px', color: "#fff", width: '240px' }}></hr>
                Account type: <div style={{ fontWeight: "bold" }}>{permission}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>  

      {/* Activity Monitor Section */}
      <motion.div
        className="ActivityMonitorSection"
        style={{ marginTop: '20px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Activity Monitor
        </motion.h1>
        <div className="container-fluid d-flex flex-column align-items-center">
          <div className="row row-cols-1 g-3 w-100">
            <div className="col">
              <motion.div
                className="box"
                style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '15px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>ML Model Memory Usage</h2>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <MemoryUsageChart data={mlMemoryUsage} />
                </div>
                <p className="small-text" style={{ marginTop: '10px', fontSize: '12px' }}>
                  Shows the memory usage of the ML model over time.
                </p> 
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {!isAdmin && (
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            style={{ color: "#eee", background: "transparent", margin: "25px" }}
            onClick={DeleteAccount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className='fas fa-exclamation-triangle' style={{ marginRight: '6px' }}></i> Delete Account
          </motion.button>
        </motion.div>
      )}
    </section>
  );
};

export default UserProfile;
