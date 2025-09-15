import ContractForm from '@/components/contracts/ContractForm';
import { Contract } from '@/lib/contracts';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock do ContractForm
const mockContract: Contract = {
  id: '1',
  user_id: 'user-1',
  title: 'Test Contract',
  status: 'draft',
  currency_code: 'BRL',
  contract_value: null,
  contract_term_months: null,
  implicit_interest_rate: null,
  guaranteed_residual_value: null,
  purchase_option_price: null,
  purchase_option_exercise_date: null,
  lease_start_date: null,
  lease_end_date: null,
  payment_frequency: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('ContractForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    expect(screen.getByLabelText(/título do contrato/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/moeda/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('populates form with contract data when editing', () => {
    render(
      <ContractForm contract={mockContract} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByDisplayValue('Test Contract')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BRL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();

    // Check that the status select has the correct value
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe('draft');
  });

  it('validates required fields', async () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates title length', async () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    const titleInput = screen.getByLabelText(/título do contrato/i);
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });

    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título deve ter no máximo 200 caracteres/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    const titleInput = screen.getByLabelText(/título do contrato/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const currencyInput = screen.getByLabelText(/moeda/i);

    fireEvent.change(titleInput, { target: { value: 'New Contract' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    fireEvent.change(currencyInput, { target: { value: 'USD' } });

    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Contract',
        status: 'active',
        currency_code: 'USD',
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form when loading', () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} useWizard={false} />);

    expect(screen.getByLabelText(/título do contrato/i)).toBeDisabled();
    expect(screen.getByLabelText(/status/i)).toBeDisabled();
    expect(screen.getByLabelText(/moeda/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
  });

  it('converts currency code to uppercase', async () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    const currencyInput = screen.getByLabelText(/moeda/i);
    fireEvent.change(currencyInput, { target: { value: 'brl' } });

    expect(currencyInput).toHaveValue('BRL');
  });

  it('clears errors when user starts typing', async () => {
    render(<ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} useWizard={false} />);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    // Start typing to clear error
    const titleInput = screen.getByLabelText(/título do contrato/i);
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.queryByText(/título é obrigatório/i)).not.toBeInTheDocument();
    });
  });
});
