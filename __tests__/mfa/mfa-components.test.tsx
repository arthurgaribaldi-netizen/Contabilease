import BackupCodeVerification from '@/components/auth/BackupCodeVerification';
import MFASetup from '@/components/auth/MFASetup';
import MFAVerification from '@/components/auth/MFAVerification';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code'))
}));

describe('MFA Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('MFASetup', () => {
    const mockProps = {
      onSetupComplete: jest.fn(),
      onCancel: jest.fn()
    };

    it('should render setup component', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            secret: 'test-secret',
            qrCodeUrl: 'data:image/png;base64,mock-qr-code',
            backupCodes: ['ABC-DEF', 'GHI-JKL', 'MNO-PQR']
          }
        })
      });

      render(<MFASetup {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Setup Two-Factor Authentication')).toBeInTheDocument();
      });
    });

    it('should handle setup error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Setup failed'));

      render(<MFASetup {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Setup failed/)).toBeInTheDocument();
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            secret: 'test-secret',
            qrCodeUrl: 'data:image/png;base64,mock-qr-code',
            backupCodes: ['ABC-DEF', 'GHI-JKL', 'MNO-PQR']
          }
        })
      });

      render(<MFASetup {...mockProps} />);

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel Setup');
        fireEvent.click(cancelButton);
      });

      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('MFAVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onUseBackupCode: jest.fn(),
      onCancel: jest.fn()
    };

    it('should render verification component', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Enter the 6-digit code from your authenticator app')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    it('should call onVerify with valid code', async () => {
      mockProps.onVerify.mockResolvedValue(true);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByText('Verify');

      fireEvent.change(input, { target: { value: '123456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onVerify).toHaveBeenCalledWith('123456');
      });
    });

    it('should not submit with invalid code length', () => {
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByText('Verify');

      fireEvent.change(input, { target: { value: '12345' } });
      expect(submitButton).toBeDisabled();
    });

    it('should call onUseBackupCode when backup code button is clicked', () => {
      render(<MFAVerification {...mockProps} />);

      const backupButton = screen.getByText('Use backup code instead');
      fireEvent.click(backupButton);

      expect(mockProps.onUseBackupCode).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<MFAVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should display error message', () => {
      render(<MFAVerification {...mockProps} error="Invalid code" />);

      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<MFAVerification {...mockProps} loading={true} />);

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });
  });

  describe('BackupCodeVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onBack: jest.fn(),
      onCancel: jest.fn()
    };

    it('should render backup code component', () => {
      render(<BackupCodeVerification {...mockProps} />);

      expect(screen.getByText('Backup Code')).toBeInTheDocument();
      expect(screen.getByText('Enter one of your backup codes to access your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ABC-DEF-GHI')).toBeInTheDocument();
    });

    it('should call onVerify with valid backup code', async () => {
      mockProps.onVerify.mockResolvedValue(true);

      render(<BackupCodeVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('ABC-DEF-GHI');
      const submitButton = screen.getByText('Verify Backup Code');

      fireEvent.change(input, { target: { value: 'ABC-DEF-GHI' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onVerify).toHaveBeenCalledWith('ABC-DEF-GHI');
      });
    });

    it('should format backup code input', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('ABC-DEF-GHI') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'abc def ghi' } });
      expect(input.value).toBe('ABC-DEF-GHI');

      fireEvent.change(input, { target: { value: '123-456-789' } });
      expect(input.value).toBe('123-456-789');
    });

    it('should call onBack when back button is clicked', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const backButton = screen.getByText('Back to authenticator code');
      fireEvent.click(backButton);

      expect(mockProps.onBack).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should display error message', () => {
      render(<BackupCodeVerification {...mockProps} error="Invalid backup code" />);

      expect(screen.getByText('Invalid backup code')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<BackupCodeVerification {...mockProps} loading={true} />);

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    it('should not submit with empty backup code', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const submitButton = screen.getByText('Verify Backup Code');
      expect(submitButton).toBeDisabled();
    });
  });
});
