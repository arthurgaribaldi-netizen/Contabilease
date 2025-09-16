import BackupCodeVerification from '@/components/auth/BackupCodeVerification';
import MFAVerification from '@/components/auth/MFAVerification';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

describe('MFA Components - Basic Tests', () => {
  describe('MFAVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onUseBackupCode: jest.fn(),
      onCancel: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render verification component', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('Verificação em Duas Etapas')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    it('should have verify button', () => {
      render(<MFAVerification {...mockProps} />);
      expect(screen.getByText('Verificar')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<MFAVerification {...mockProps} />);
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<MFAVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('BackupCodeVerification', () => {
    const mockProps = {
      onVerify: jest.fn(),
      onBack: jest.fn(),
      onCancel: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render backup code component', () => {
      render(<BackupCodeVerification {...mockProps} />);

      expect(
        screen.getByRole('heading', { name: 'Verificação de Código de Backup' })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite o código de backup')).toBeInTheDocument();
    });

    it('should have verify button', () => {
      render(<BackupCodeVerification {...mockProps} />);
      expect(screen.getByText('Verificar')).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<BackupCodeVerification {...mockProps} />);
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<BackupCodeVerification {...mockProps} />);

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
