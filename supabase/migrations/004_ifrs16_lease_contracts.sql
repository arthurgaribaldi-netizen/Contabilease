-- Add IFRS 16 lease contract fields to existing contracts table
-- This migration extends the contracts table with all necessary fields for IFRS 16 calculations

-- Add IFRS 16 specific columns to contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lease_start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lease_end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lease_term_months INTEGER;

-- Financial terms
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS initial_payment DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS annual_payment DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_frequency VARCHAR(20) DEFAULT 'monthly';

-- Discount rate and calculations
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS discount_rate_annual DECIMAL(8,4);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS discount_rate_monthly DECIMAL(8,4);

-- Asset information
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS asset_fair_value DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS asset_residual_value DECIMAL(15,2);

-- Additional costs and fees
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS initial_direct_costs DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lease_incentives DECIMAL(15,2);

-- Payment timing
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_timing VARCHAR(10) DEFAULT 'end';

-- Lease classification
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS lease_classification VARCHAR(20);

-- Optional fields for complex scenarios
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS escalation_rate DECIMAL(8,4);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS guaranteed_residual_value DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS purchase_option_price DECIMAL(15,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS purchase_option_exercisable BOOLEAN DEFAULT FALSE;

-- Add constraints
ALTER TABLE contracts ADD CONSTRAINT check_lease_term_months CHECK (lease_term_months > 0);
ALTER TABLE contracts ADD CONSTRAINT check_monthly_payment CHECK (monthly_payment >= 0);
ALTER TABLE contracts ADD CONSTRAINT check_discount_rate_annual CHECK (discount_rate_annual >= 0 AND discount_rate_annual <= 100);
ALTER TABLE contracts ADD CONSTRAINT check_payment_frequency CHECK (payment_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual'));
ALTER TABLE contracts ADD CONSTRAINT check_payment_timing CHECK (payment_timing IN ('beginning', 'end'));
ALTER TABLE contracts ADD CONSTRAINT check_lease_classification CHECK (lease_classification IN ('operating', 'finance'));

-- Create table for variable payments (one-to-many relationship)
CREATE TABLE IF NOT EXISTS contract_variable_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for renewal options (one-to-many relationship)
CREATE TABLE IF NOT EXISTS contract_renewal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  probability DECIMAL(5,2), -- Probability percentage (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for IFRS 16 calculation results (for caching and audit trail)
CREATE TABLE IF NOT EXISTS ifrs16_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  calculation_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Initial calculations
  lease_liability_initial DECIMAL(15,2) NOT NULL,
  right_of_use_asset_initial DECIMAL(15,2) NOT NULL,
  
  -- Current period calculations
  lease_liability_current DECIMAL(15,2) NOT NULL,
  right_of_use_asset_current DECIMAL(15,2) NOT NULL,
  monthly_interest_expense DECIMAL(15,2) NOT NULL,
  monthly_principal_payment DECIMAL(15,2) NOT NULL,
  monthly_amortization DECIMAL(15,2) NOT NULL,
  
  -- Totals
  total_interest_expense DECIMAL(15,2) NOT NULL,
  total_principal_payments DECIMAL(15,2) NOT NULL,
  total_lease_payments DECIMAL(15,2) NOT NULL,
  
  -- Effective rates
  effective_interest_rate_annual DECIMAL(8,4) NOT NULL,
  effective_interest_rate_monthly DECIMAL(8,4) NOT NULL,
  
  -- Amortization schedule (stored as JSON)
  amortization_schedule JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for amortization schedule details (for detailed reporting)
CREATE TABLE IF NOT EXISTS amortization_schedule_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL REFERENCES ifrs16_calculations(id) ON DELETE CASCADE,
  period INTEGER NOT NULL,
  period_date DATE NOT NULL,
  beginning_liability DECIMAL(15,2) NOT NULL,
  interest_expense DECIMAL(15,2) NOT NULL,
  principal_payment DECIMAL(15,2) NOT NULL,
  ending_liability DECIMAL(15,2) NOT NULL,
  beginning_asset DECIMAL(15,2) NOT NULL,
  amortization DECIMAL(15,2) NOT NULL,
  ending_asset DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER trg_contract_variable_payments_updated_at
  BEFORE UPDATE ON contract_variable_payments
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_contract_renewal_options_updated_at
  BEFORE UPDATE ON contract_renewal_options
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable RLS on new tables
ALTER TABLE contract_variable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_renewal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifrs16_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE amortization_schedule_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "contract_variable_payments_is_contract_owner" ON contract_variable_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_variable_payments.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "contract_renewal_options_is_contract_owner" ON contract_renewal_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_renewal_options.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "ifrs16_calculations_is_contract_owner" ON ifrs16_calculations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = ifrs16_calculations.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "amortization_schedule_details_is_contract_owner" ON amortization_schedule_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ifrs16_calculations 
      JOIN contracts ON contracts.id = ifrs16_calculations.contract_id
      WHERE ifrs16_calculations.id = amortization_schedule_details.calculation_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_variable_payments_contract_id ON contract_variable_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_renewal_options_contract_id ON contract_renewal_options(contract_id);
CREATE INDEX IF NOT EXISTS idx_ifrs16_calculations_contract_id ON ifrs16_calculations(contract_id);
CREATE INDEX IF NOT EXISTS idx_ifrs16_calculations_date ON ifrs16_calculations(calculation_date);
CREATE INDEX IF NOT EXISTS idx_amortization_schedule_details_calculation_id ON amortization_schedule_details(calculation_id);
CREATE INDEX IF NOT EXISTS idx_amortization_schedule_details_period ON amortization_schedule_details(calculation_id, period);

-- Add comments for documentation
COMMENT ON TABLE contract_variable_payments IS 'Variable payments for IFRS 16 lease contracts';
COMMENT ON TABLE contract_renewal_options IS 'Renewal options for IFRS 16 lease contracts';
COMMENT ON TABLE ifrs16_calculations IS 'Cached IFRS 16 calculation results for audit and performance';
COMMENT ON TABLE amortization_schedule_details IS 'Detailed amortization schedule for IFRS 16 calculations';
