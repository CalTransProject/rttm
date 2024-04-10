import React from 'react';
import axios from 'axios';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import AboutUs from '../components/AboutUs';

jest.mock('axios');

describe('AboutUs component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('AboutUs component renders correctly', async () => {
        render(
            <Router>
                <AboutUs />
            </Router>
        );
        const button = screen.getByText('verify Usersmodal');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('About Us')).toBeInTheDocument();
        });
    });
});