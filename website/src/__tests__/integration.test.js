import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContextProvider } from '../context/AuthContext';
import UserAuthentication from '../components/UserAuthentication';
import UserProfile from '../components/UserProfile';
import ProtectedRoute from '../components/ProtectedRoute';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth, db } from '../firebase';
import '../setupTests';

// Mock Firebase Authentication and Firestore modules including specific functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: undefined, // Initialize currentUser as undefined
    onAuthStateChanged: jest.fn(),
  })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  getDoc: jest.fn(() => ({
    data: () => ({ role: 'admin' }),
    exists: jest.fn(() => true),
  })),
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('UserAuthentication component integrates with Firebase authentication', async () => {
    render(
      <Router>
        <AuthContextProvider>
          <UserAuthentication />
        </AuthContextProvider>
      </Router>
    );

    // Actions for signing up
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Request'));

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'john@example.com', 'password123');

    // Reset mock calls for the login test
    jest.clearAllMocks();

    // Actions for logging in
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'john@example.com', 'password123');
  });

  it('UserProfile component retrieves user permissions and details from Firestore', async () => {
    // Update the mocked currentUser value
    const mockedAuth = getAuth();
    mockedAuth.currentUser = {
      uid: 'user123',
      email: 'john@example.com',
      displayName: 'John Doe',
      metadata: {
        creationTime: 'CreationTime',
        lastSignInTime: 'LastSignInTime',
      },
    };

    render(
      <Router>
        <AuthContextProvider>
          <UserProfile />
        </AuthContextProvider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Account type: admin')).toBeInTheDocument();
    });
  });

  it('ProtectedRoute component behavior', async () => {
    // Update the mocked currentUser value
    const mockedAuth = getAuth();
    mockedAuth.currentUser = {
      uid: 'user123',
      email: 'john@example.com',
      displayName: 'John Doe',
    };

    // Simulate unauthenticated user scenario
    render(
      <Router>
        <AuthContextProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContextProvider>
      </Router>
    );

    expect(screen.getByText('Please login or create an account.')).toBeInTheDocument();

  });
});