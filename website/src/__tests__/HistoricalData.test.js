import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import HistoricalData from '../components/HistoricalData';

describe('HistoricalData Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('HistoricalData component renders correctly', async () => {
        render(
            <Router>
                <HistoricalData />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Historical Data')).toBeInTheDocument();
        });
    });
});