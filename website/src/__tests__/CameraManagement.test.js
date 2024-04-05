import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import CameraManagement from '../components/CameraManagement';

describe('CameraManagement Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('CameraManagement component renders correctly', async () => {
    render(
      <Router>
        <CameraManagement />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera Management')).toBeInTheDocument();
    });
  });
});