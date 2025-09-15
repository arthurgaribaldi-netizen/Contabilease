-- Add IFRS 16 financial fields to contracts table
-- This migration expands the contracts table with fields needed for IFRS 16 lease accounting

-- Add financial fields to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS contract_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS contract_term_months INTEGER,
ADD COLUMN IF NOT EXISTS implicit_interest_rate DECIMAL(5,4), -- Up to 4 decimal places for precision
ADD COLUMN IF NOT EXISTS guaranteed_residual_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS purchase_option_price DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS purchase_option_exercise_date DATE,
ADD COLUMN IF NOT EXISTS lease_start_date DATE,
ADD COLUMN IF NOT EXISTS lease_end_date DATE,
ADD COLUMN IF NOT EXISTS payment_frequency VARCHAR(20);

-- Add constraints for data integrity
ALTER TABLE contracts 
ADD CONSTRAINT IF NOT EXISTS chk_contract_value_positive 
  CHECK (contract_value IS NULL OR contract_value >= 0),
ADD CONSTRAINT IF NOT EXISTS chk_contract_term_positive 
  CHECK (contract_term_months IS NULL OR (contract_term_months >= 1 AND contract_term_months <= 600)),
ADD CONSTRAINT IF NOT EXISTS chk_interest_rate_valid 
  CHECK (implicit_interest_rate IS NULL OR (implicit_interest_rate >= 0 AND implicit_interest_rate <= 1)),
ADD CONSTRAINT IF NOT EXISTS chk_residual_value_positive 
  CHECK (guaranteed_residual_value IS NULL OR guaranteed_residual_value >= 0),
ADD CONSTRAINT IF NOT EXISTS chk_purchase_option_positive 
  CHECK (purchase_option_price IS NULL OR purchase_option_price >= 0),
ADD CONSTRAINT IF NOT EXISTS chk_payment_frequency_valid 
  CHECK (payment_frequency IS NULL OR payment_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual'));

-- Add comments for documentation
COMMENT ON COLUMN contracts.contract_value IS 'Total contract value in the specified currency';
COMMENT ON COLUMN contracts.contract_term_months IS 'Contract term in months (1-600 months = 50 years)';
COMMENT ON COLUMN contracts.implicit_interest_rate IS 'Implicit interest rate as decimal (e.g., 0.05 for 5%)';
COMMENT ON COLUMN contracts.guaranteed_residual_value IS 'Guaranteed residual value at end of lease term';
COMMENT ON COLUMN contracts.purchase_option_price IS 'Price for purchase option if available';
COMMENT ON COLUMN contracts.purchase_option_exercise_date IS 'Date when purchase option can be exercised';
COMMENT ON COLUMN contracts.lease_start_date IS 'Start date of the lease term';
COMMENT ON COLUMN contracts.lease_end_date IS 'End date of the lease term';
COMMENT ON COLUMN contracts.payment_frequency IS 'Frequency of lease payments: monthly, quarterly, semi-annual, or annual';

-- Create indexes for better query performance on financial fields
CREATE INDEX IF NOT EXISTS idx_contracts_contract_value ON contracts(contract_value);
CREATE INDEX IF NOT EXISTS idx_contracts_lease_dates ON contracts(lease_start_date, lease_end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_payment_frequency ON contracts(payment_frequency);
