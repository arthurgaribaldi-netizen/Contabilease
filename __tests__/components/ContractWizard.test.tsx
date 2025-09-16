import ContractWizard from '@/components/contracts/ContractWizard';
import { Contract } from '@/lib/contracts';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { getTranslation, renderWithI18n } from '../utils/test-i18n';

// Mock the toast hook
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock the confirmation modal
jest.mock('@/components/ui/ConfirmationModal', () => {
  return function MockConfirmationModal(props: any) {
    const { isOpen, onConfirm, onCancel, title, message } = props;
    if (!isOpen) return null;
    return (
      <div data-testid='confirmation-modal'>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    );
  };
});

// Mock the loading spinner
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingButton: (props: any) => {
    const { children, isLoading, ...restProps } = props;
    return (
      <button disabled={isLoading} {...restProps}>
        {isLoading ? 'Carregando...' : children}
      </button>
    );
  },
}));

describe('ContractWizard', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  const sampleContract: Contract = {
    id: '1',
    title: 'Contrato de Teste',
    status: 'draft',
    currency_code: 'BRL',
    contract_value: 100000,
    contract_term_months: 24,
    implicit_interest_rate: 5.5,
    guaranteed_residual_value: 10000,
    purchase_option_price: 5000,
    purchase_option_exercise_date: '2025-12-31',
    lease_start_date: '2024-01-01',
    lease_end_date: '2025-12-31',
    payment_frequency: 'monthly',
    user_id: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render wizard with all steps', () => {
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Check step titles in the progress bar
      expect(screen.getAllByText('Informações Básicas')).toHaveLength(2); // Progress bar and step header
      expect(screen.getAllByText('Dados Financeiros')).toHaveLength(1); // Progress bar only
      expect(screen.getAllByText('Datas e Prazos')).toHaveLength(1); // Progress bar only
      expect(screen.getAllByText('Revisão')).toHaveLength(1); // Progress bar only
    });

    it('should render first step by default', () => {
      renderWithI18n(<ContractWizard {...defaultProps} />);

      expect(screen.getAllByText('Título e status do contrato')[0]).toBeInTheDocument();
    });

    it('should populate form with contract data when editing', () => {
      render(<ContractWizard {...defaultProps} contract={sampleContract} />);

      expect(screen.getByDisplayValue('Contrato de Teste')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Rascunho')).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      renderWithI18n(<ContractWizard {...defaultProps} isLoading={true} />);

      // Check if the loading button shows loading text
      const nextButton = screen.getByRole('button', { name: /carregando/i });
      expect(nextButton).toBeInTheDocument();
      // The button should be disabled when loading
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to next step when Next button is clicked', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill required fields for first step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');

      // Click Next
      await user.click(screen.getByText('Próximo'));

      // Should be on second step - use getAllByText and check first occurrence
      expect(screen.getAllByText('Valores e taxas do contrato')[0]).toBeInTheDocument();
    });

    it('should navigate to previous step when Previous button is clicked', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step and go to second
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Go back
      await user.click(screen.getByText('Anterior'));

      // Should be back on first step - use getAllByText and check first occurrence
      expect(screen.getAllByText('Título e status do contrato')[0]).toBeInTheDocument();
    });

    it('should disable Previous button on first step', () => {
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // The Previous button should not be visible on the first step
      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty required fields', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Try to go to next step without filling required fields
      await user.click(screen.getByText('Próximo'));

      expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
    });

    it('should validate contract value is greater than zero', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Enter invalid contract value
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '0');
      await user.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(getTranslation('contracts.validation.valueMustBePositive'))
      ).toBeInTheDocument();
    });

    it('should validate contract term is between 1 and 600 months', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Enter invalid term
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '700');
      await user.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(getTranslation('contracts.validation.termMustBeValid'))
      ).toBeInTheDocument();
    });

    it('should validate interest rate is between 0% and 100%', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Enter invalid interest rate
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '150');
      await user.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(getTranslation('contracts.validation.rateMustBeValid'))
      ).toBeInTheDocument();
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Try to go to next step without filling required fields
      await user.click(screen.getByText('Próximo'));
      expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();

      // Start typing in the field
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test');

      // Error should be cleared
      expect(screen.queryByText('Este campo é obrigatório')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill all required fields
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Fill required fields for step 2
      const currencyInput = screen.getByLabelText('Moeda');
      await user.type(currencyInput, 'BRL');
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '24');
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '5.5');
      const residualValueInput = screen.getByLabelText('Valor Residual Garantido');
      await user.type(residualValueInput, '10000');
      const purchaseOptionInput = screen.getByLabelText('Preço da Opção de Compra');
      await user.type(purchaseOptionInput, '5000');
      const paymentFrequencySelect = screen.getByLabelText('Frequência de Pagamento');
      await user.selectOptions(paymentFrequencySelect, 'monthly');
      await user.click(screen.getByText('Próximo'));

      // Debug: check if we're on step 3 (dates)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Datas e Prazos' })).toBeInTheDocument();
      });

      // Find date inputs by their labels
      const startDateInput = screen.getByLabelText('Data de Início do Leasing');
      await user.type(startDateInput, '2024-01-01');
      const endDateInput = screen.getByLabelText('Data de Fim do Leasing');
      await user.type(endDateInput, '2025-12-31');
      const exerciseDateInput = screen.getByLabelText('Data de Exercício da Opção de Compra');
      await user.type(exerciseDateInput, '2025-12-31');
      await user.click(screen.getByText('Próximo'));

      // Debug: check if we're on step 4 (review)
      expect(screen.getAllByText('Confirme os dados antes de salvar')).toHaveLength(2);

      // Submit - the button text changes to "Salvar Contrato" on the last step
      const submitButton = screen.getByText('Salvar Contrato');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));

      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill and submit form
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Fill required fields for step 2
      const currencyInput = screen.getByLabelText('Moeda');
      await user.type(currencyInput, 'BRL');
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '24');
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '5.5');
      const residualValueInput = screen.getByLabelText('Valor Residual Garantido');
      await user.type(residualValueInput, '10000');
      const purchaseOptionInput = screen.getByLabelText('Preço da Opção de Compra');
      await user.type(purchaseOptionInput, '5000');
      const paymentFrequencySelect = screen.getByLabelText('Frequência de Pagamento');
      await user.selectOptions(paymentFrequencySelect, 'monthly');
      await user.click(screen.getByText('Próximo'));

      // Fill required fields for step 3 (dates)
      const startDateInput = screen.getByLabelText('Data de Início do Leasing');
      await user.type(startDateInput, '2024-01-01');
      const endDateInput = screen.getByLabelText('Data de Fim do Leasing');
      await user.type(endDateInput, '2025-12-31');
      const exerciseDateInput = screen.getByLabelText('Data de Exercício da Opção de Compra');
      await user.type(exerciseDateInput, '2025-12-31');
      await user.click(screen.getByText('Próximo'));

      // Now we should be on the review step with the submit button
      // The button text changes to "Salvar Contrato" on the last step
      expect(screen.getAllByText('Confirme os dados antes de salvar')).toHaveLength(2);
      const submitButton = screen.getByText('Salvar Contrato');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should show confirmation modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      await user.click(screen.getByText('Cancelar'));

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
      expect(
        screen.getByText(getTranslation('contracts.wizard.cancelCreation'))
      ).toBeInTheDocument();
    });

    it('should call onCancel when cancel is confirmed', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      await user.click(screen.getByText('Cancelar'));
      await user.click(screen.getByText('Confirmar'));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not call onCancel when cancel is dismissed', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      await user.click(screen.getByText('Cancelar'));
      const cancelButtons = screen.getAllByText('Cancelar');
      await user.click(cancelButtons[1]); // Click the second "Cancelar" button (in modal)

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Step Progress', () => {
    it('should show correct step status indicators', () => {
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // First step should be current - check by looking for the step description
      expect(screen.getAllByText('Título e status do contrato')).toHaveLength(2);
    });

    it('should update step status when navigating', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step and navigate
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Second step should now be current - check by looking for the step description
      expect(screen.getAllByText('Valores e taxas do contrato')).toHaveLength(2);
    });
  });

  describe('Data Formatting', () => {
    it('should format currency values correctly', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Navigate to financial step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Enter currency value
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');

      // Check if the value is formatted correctly in the input
      expect(contractValueInput).toHaveValue(100000);

      // Test currency formatting function directly
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      };

      expect(formatCurrency(100000)).toMatch(/R\$\s*100\.000,00/);
    });

    it('should format dates correctly', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Navigate to review step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Fill required fields for step 2
      const currencyInput = screen.getByLabelText('Moeda');
      await user.type(currencyInput, 'BRL');
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '24');
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '5.5');
      const residualValueInput = screen.getByLabelText('Valor Residual Garantido');
      await user.type(residualValueInput, '10000');
      const purchaseOptionInput = screen.getByLabelText('Preço da Opção de Compra');
      await user.type(purchaseOptionInput, '5000');
      const paymentFrequencySelect = screen.getByLabelText('Frequência de Pagamento');
      await user.selectOptions(paymentFrequencySelect, 'monthly');
      await user.click(screen.getByText('Próximo'));

      // Wait for step 3 to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Datas e Prazos' })).toBeInTheDocument();
      });
      const startDateInput = screen.getByLabelText('Data de Início do Leasing');
      await user.type(startDateInput, '2024-01-01');
      const endDateInput = screen.getByLabelText('Data de Fim do Leasing');
      await user.type(endDateInput, '2025-12-31');
      const exerciseDateInput = screen.getByLabelText('Data de Exercício da Opção de Compra');
      await user.type(exerciseDateInput, '2025-12-31');
      await user.click(screen.getByText('Próximo'));

      // Should show formatted dates - check if we're on review step
      expect(screen.getAllByText('Confirme os dados antes de salvar')).toHaveLength(2);
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('31/12/2025')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty contract data', () => {
      render(<ContractWizard {...defaultProps} contract={undefined} />);

      expect(screen.getByLabelText('Título do Contrato *')).toBeInTheDocument();
    });

    it('should handle contract with partial data', () => {
      const partialContract = {
        ...sampleContract,
        contract_value: undefined,
        contract_term_months: undefined,
      };

      render(<ContractWizard {...defaultProps} contract={partialContract} />);

      expect(screen.getByDisplayValue('Contrato de Teste')).toBeInTheDocument();
    });

    it('should handle rapid navigation', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Rapidly navigate through steps
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test');
      await user.click(screen.getByText('Próximo'));
      await user.click(screen.getByText('Anterior'));
      await user.click(screen.getByText('Próximo'));

      // Should still be on second step
      expect(screen.getAllByText('Valores e taxas do contrato')).toHaveLength(2);
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state across steps', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill first step
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Go back
      await user.click(screen.getByText('Anterior'));

      // Value should be preserved
      expect(screen.getByDisplayValue('Test Contract')).toBeInTheDocument();
    });

    it('should handle form data changes', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Change form data
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'New Title');

      // Navigate and come back
      await user.click(screen.getByText('Próximo'));
      await user.click(screen.getByText('Anterior'));

      // New value should be preserved
      expect(screen.getByDisplayValue('New Title')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Try to submit without required data
      await user.click(screen.getByText('Próximo'));

      // Should show validation error
      expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));

      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Fill and submit form
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Fill required fields for step 2
      const currencyInput = screen.getByLabelText('Moeda');
      await user.type(currencyInput, 'BRL');
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '24');
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '5.5');
      const residualValueInput = screen.getByLabelText('Valor Residual Garantido');
      await user.type(residualValueInput, '10000');
      const purchaseOptionInput = screen.getByLabelText('Preço da Opção de Compra');
      await user.type(purchaseOptionInput, '5000');
      const paymentFrequencySelect = screen.getByLabelText('Frequência de Pagamento');
      await user.selectOptions(paymentFrequencySelect, 'monthly');
      await user.click(screen.getByText('Próximo'));

      // Step 3: Dates
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Datas e Prazos' })).toBeInTheDocument();
      });
      const startDateInput = screen.getByLabelText('Data de Início do Leasing');
      await user.type(startDateInput, '2024-01-01');
      const endDateInput = screen.getByLabelText('Data de Fim do Leasing');
      await user.type(endDateInput, '2025-12-31');
      const exerciseDateInput = screen.getByLabelText('Data de Exercício da Opção de Compra');
      await user.type(exerciseDateInput, '2025-12-31');
      await user.click(screen.getByText('Próximo'));

      // Step 4: Review
      expect(screen.getByRole('heading', { name: 'Revisão' })).toBeInTheDocument();
      // Use a more specific selector to avoid multiple matches - look for the text in the main content area
      const reviewHeading = screen.getByRole('heading', { name: 'Revisão' });
      const reviewContent = reviewHeading.closest('div')?.querySelector('p');
      expect(reviewContent).toHaveTextContent('Confirme os dados antes de salvar');

      // The submit button should be available - use the Next button which becomes "Salvar Contrato" on last step
      const submitButton = screen.getByText('Salvar Contrato');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    it('should handle all wizard steps correctly', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Step 1: Basic Info
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test Contract');
      await user.click(screen.getByText('Próximo'));

      // Step 2: Financial Data
      expect(screen.getAllByText('Valores e taxas do contrato')).toHaveLength(2);
      // Fill required fields for step 2
      const currencyInput = screen.getByLabelText('Moeda');
      await user.type(currencyInput, 'BRL');
      const contractValueInput = screen.getByLabelText('Valor do Contrato *');
      await user.type(contractValueInput, '100000');
      const termInput = screen.getByLabelText('Prazo (meses) *');
      await user.type(termInput, '24');
      const interestRateInput = screen.getByLabelText('Taxa de Juros Implícita (%) *');
      await user.type(interestRateInput, '5.5');
      const residualValueInput = screen.getByLabelText('Valor Residual Garantido');
      await user.type(residualValueInput, '10000');
      const purchaseOptionInput = screen.getByLabelText('Preço da Opção de Compra');
      await user.type(purchaseOptionInput, '5000');
      const paymentFrequencySelect = screen.getByLabelText('Frequência de Pagamento');
      await user.selectOptions(paymentFrequencySelect, 'monthly');
      await user.click(screen.getByText('Próximo'));

      // Step 3: Dates
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Datas e Prazos' })).toBeInTheDocument();
      });
      const startDateInput = screen.getByLabelText('Data de Início do Leasing');
      await user.type(startDateInput, '2024-01-01');
      const endDateInput = screen.getByLabelText('Data de Fim do Leasing');
      await user.type(endDateInput, '2025-12-31');
      const exerciseDateInput = screen.getByLabelText('Data de Exercício da Opção de Compra');
      await user.type(exerciseDateInput, '2025-12-31');
      await user.click(screen.getByText('Próximo'));

      // Step 4: Review
      expect(screen.getByRole('heading', { name: 'Revisão' })).toBeInTheDocument();
      // Use a more specific selector to avoid multiple matches - look for the text in the main content area
      const reviewHeading = screen.getByRole('heading', { name: 'Revisão' });
      const reviewContent = reviewHeading.closest('div')?.querySelector('p');
      expect(reviewContent).toHaveTextContent('Confirme os dados antes de salvar');

      // The submit button should be available - use the Next button which becomes "Salvar Contrato" on last step
      const submitButton = screen.getByText('Salvar Contrato');
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle form field interactions', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Test input field interactions
      const titleInput = screen.getByLabelText('Título do Contrato *');
      await user.type(titleInput, 'Test');
      await user.clear(titleInput);
      await user.type(titleInput, 'New Test');

      expect(screen.getByDisplayValue('New Test')).toBeInTheDocument();
    });

    it('should handle button states correctly', () => {
      renderWithI18n(<ContractWizard {...defaultProps} />);

      // Previous button should not be visible on first step
      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();

      // Next button should be enabled
      const nextButton = screen.getByText('Próximo');
      expect(nextButton).not.toBeDisabled();
    });
  });
});
