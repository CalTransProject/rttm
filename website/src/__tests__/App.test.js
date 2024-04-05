import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import App from '../App';

describe('End-to-End Tests', () => {
    const history = createMemoryHistory();

    it('Navigates to the website and verifies the landing page is displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        expect(screen.getByText('Your Website Title')).toBeInTheDocument(); // Replace with your website title
    });

    it('Signs up, logs in, and verifies the main page is displayed correctly', () => {
        history.push('/signup');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'testuser@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'TestUser123!' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'TestUser123!' } });
        fireEvent.click(screen.getByText('Request'));

        history.push('/login');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'testuser@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'TestUser123!' } });
        fireEvent.click(screen.getByText('Login'));

        expect(screen.getByText('Your Main Page Title')).toBeInTheDocument(); // Replace with your main page title
    });

    it('Verifies the About Us page is displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.click(screen.getByText('About Us'));
        expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('Verifies the Camera Management page is displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.click(screen.getByText('Camera Management'));
        expect(screen.getByText('Camera Management')).toBeInTheDocument();
    });

    it('Verifies the Historical Data pageis displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.click(screen.getByText('Historical Data'));
        expect(screen.getByText('Historical Data')).toBeInTheDocument();
    });

    it('Verifies the Technologies page is displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.click(screen.getByText('Technologies'));
        expect(screen.getByText('Technologies')).toBeInTheDocument();
    });

    it('Logs out and verifies the login page is displayed correctly', () => {
        history.push('/');
        render(<Router location={history.location} navigator={history}>
            <App />
        </Router>);

        fireEvent.click(screen.getByText('Logout'));
        expect(screen.getByText('Your Login Page Title')).toBeInTheDocument(); // Replace with your login page title
    });
});