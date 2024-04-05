import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import MainPage from '../MainPage';

describe('MainPage Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('MainPage component renders correctly', async () => {
        render(
            <Router>
                <MainPage />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Main Page')).toBeInTheDocument();
        });
    });
});