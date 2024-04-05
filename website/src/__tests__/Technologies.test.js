import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import Technologies from '../components/Technologies';

describe('Technologies Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Technologies component renders correctly', async () => {
        render(
            <Router>
                <Technologies />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Technologies')).toBeInTheDocument();
        });
    });
});