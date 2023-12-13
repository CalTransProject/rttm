import React, { useState, useEffect } from 'react';
import notificationService from './NotificationService'; 

const NotificationUI = () => {
  const [notification, setNotification] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const dismissNotification = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const handleNotification = (message) => {
      setNotification(message);
      setIsVisible(true);
    };

    notificationService.subscribe(handleNotification);

    return () => notificationService.unsubscribe(handleNotification);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
      zIndex: 1000,
    }}>
      {notification}
      <button onClick={dismissNotification} style={{
        marginLeft: '10px',
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
      }}>X</button>
    </div>
  );
};

export default NotificationUI;
