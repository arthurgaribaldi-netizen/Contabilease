import BackupCodeVerification from '@/components/auth/BackupCodeVerification';
import MFAVerification from '@/components/auth/MFAVerification';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

describe('MFA Components - Basic Tests', () => {
  describe('MFAVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onUseBackupCode: jest.fn(),
      onCancel: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render verification component', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    it('should have verify button', () => {
      render(<MFAVerification {...mockProps} />);
      expect(screen.getByText('Verify')).toBeInTheDocument();
    });

    it('should have backup code button', () => {
      render(<MFAVerification {...mockProps} />);
      expect(screen.getByText('Use backup code instead')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<MFAVerification {...mockProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<MFAVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onUseBackupCode when backup code button is clicked', () => {
      render(<MFAVerification {...mockProps} />);

      const backupButton = screen.getByText('Use backup code instead');
      fireEvent.click(backupButton);

      expect(mockProps.onUseBackupCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('BackupCodeVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onBack: jest.fn(),
      onCancel: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render backup code component', () => {
      render(<BackupCodeVerification {...mockProps} />);

      expect(screen.getByRole('heading', { name: 'Backup Code' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ABC-DEF-GHI')).toBeInTheDocument();
    });

    it('should have verify button', () => {
      render(<BackupCodeVerification {...mockProps} />);
      expect(screen.getByText('Verify Backup Code')).toBeInTheDocument();
    });

    it('should have back button', () => {
      render(<BackupCodeVerification {...mockProps} />);
      expect(screen.getByText('Back to authenticator code')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<BackupCodeVerification {...mockProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when back button is clicked', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const backButton = screen.getByText('Back to authenticator code');
      fireEvent.click(backButton);

      expect(mockProps.onBack).toHaveBeenCalledTimes(1);
    });
  });
});
