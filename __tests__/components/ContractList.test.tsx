import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractList from '@/components/contracts/ContractList';
import { Contract } from '@/lib/contracts';

const mockContracts: Contract[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: 'Contract 1',
    status: 'active',
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
  },
  {
    id: '2',
    user_id: 'user-1',
    title: 'Contract 2',
    status: 'draft',
    currency_code: 'USD',
    contract_value: null,
    contract_term_months: null,
    implicit_interest_rate: null,
    guaranteed_residual_value: null,
    purchase_option_price: null,
    purchase_option_exercise_date: null,
    lease_start_date: null,
    lease_end_date: null,
    payment_frequency: null,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
];

describe('ContractList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contracts list correctly', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('Meus Contratos')).toBeInTheDocument();
    expect(screen.getByText('2 contrato(s) encontrado(s)')).toBeInTheDocument();
    expect(screen.getByText('Contract 1')).toBeInTheDocument();
    expect(screen.getByText('Contract 2')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
  });

  it('displays currency codes correctly', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('BRL')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('shows N/A for contracts without currency', () => {
    const contractsWithoutCurrency = [
      {
        ...mockContracts[0],
        currency_code: null,
      },
    ];

    render(
      <ContractList
        contracts={contractsWithoutCurrency}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    const viewButtons = screen.getAllByText('Ver');
    fireEvent.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalledWith(mockContracts[0]);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockContracts[0]);
  });

  it('shows delete confirmation modal when delete button is clicked', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.'
      )
    ).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    // Find the confirm button in the modal (should be the last one)
    const allDeleteButtons = screen.getAllByText('Excluir');
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1];
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockContracts[0]);
  });

  it('cancels delete when cancel button is clicked', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('Confirmar exclusão')).not.toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(
      <ContractList
        contracts={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
        isLoading={true}
      />
    );

    // Check for loading skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when no contracts', () => {
    render(
      <ContractList
        contracts={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    expect(screen.getByText('Nenhum contrato encontrado')).toBeInTheDocument();
    expect(
      screen.getByText('Crie seu primeiro contrato de leasing para começar')
    ).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <ContractList
        contracts={mockContracts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onView={mockOnView}
      />
    );

    // Check if dates are formatted (Brazilian format)
    expect(screen.getByText('01/01/2025')).toBeInTheDocument();
    expect(screen.getByText('02/01/2025')).toBeInTheDocument();
  });
});
