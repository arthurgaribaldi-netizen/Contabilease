-- Contract modifications table
CREATE TABLE IF NOT EXISTS contract_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- Basic modification information
  modification_date DATE NOT NULL,
  modification_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  effective_date DATE NOT NULL,
  
  -- Term modifications
  new_term_months INTEGER,
  term_change_months INTEGER,
  
  -- Payment modifications
  new_monthly_payment DECIMAL(15,2),
  payment_change_amount DECIMAL(15,2),
  payment_change_percentage DECIMAL(8,4),
  
  -- Rate modifications
  new_discount_rate_annual DECIMAL(8,4),
  rate_change_amount DECIMAL(8,4),
  rate_change_percentage DECIMAL(8,4),
  
  -- Asset modifications
  new_asset_fair_value DECIMAL(15,2),
  asset_change_amount DECIMAL(15,2),
  
  -- Termination details
  termination_date DATE,
  termination_fee DECIMAL(15,2),
  termination_reason TEXT,
  
  -- Renewal details
  renewal_term_months INTEGER,
  renewal_monthly_payment DECIMAL(15,2),
  renewal_discount_rate DECIMAL(8,4),
  
  -- Financial impact
  modification_fee DECIMAL(15,2),
  additional_costs DECIMAL(15,2),
  incentives_received DECIMAL(15,2),
  
  -- Approval and documentation
  approved_by VARCHAR(255),
  approval_date DATE,
  supporting_documents TEXT[], -- Array of document URLs/paths
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract modification calculations table (for audit trail)
CREATE TABLE IF NOT EXISTS contract_modification_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modification_id UUID NOT NULL REFERENCES contract_modifications(id) ON DELETE CASCADE,
  calculation_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Before modification values
  before_lease_liability DECIMAL(15,2) NOT NULL,
  before_right_of_use_asset DECIMAL(15,2) NOT NULL,
  before_remaining_term_months INTEGER NOT NULL,
  before_monthly_payment DECIMAL(15,2) NOT NULL,
  before_discount_rate_annual DECIMAL(8,4) NOT NULL,
  
  -- After modification values
  after_lease_liability DECIMAL(15,2) NOT NULL,
  after_right_of_use_asset DECIMAL(15,2) NOT NULL,
  after_remaining_term_months INTEGER NOT NULL,
  after_monthly_payment DECIMAL(15,2) NOT NULL,
  after_discount_rate_annual DECIMAL(8,4) NOT NULL,
  
  -- Impact analysis
  liability_change DECIMAL(15,2) NOT NULL,
  asset_change DECIMAL(15,2) NOT NULL,
  payment_change DECIMAL(15,2) NOT NULL,
  rate_change DECIMAL(8,4) NOT NULL,
  term_change INTEGER NOT NULL,
  net_impact DECIMAL(15,2) NOT NULL,
  
  -- New amortization schedule (stored as JSON)
  new_amortization_schedule JSONB NOT NULL,
  
  -- Summary
  modification_type VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  total_impact DECIMAL(15,2) NOT NULL,
  new_total_payments DECIMAL(15,2) NOT NULL,
  new_total_interest DECIMAL(15,2) NOT NULL,
  new_effective_rate DECIMAL(8,4) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract modification schedule details table
CREATE TABLE IF NOT EXISTS contract_modification_schedule_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL REFERENCES contract_modification_calculations(id) ON DELETE CASCADE,
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

-- Add constraints
ALTER TABLE contract_modifications ADD CONSTRAINT check_modification_type 
  CHECK (modification_type IN (
    'term_extension', 'term_reduction', 'payment_change', 'rate_change', 
    'asset_change', 'termination', 'renewal', 'other'
  ));

ALTER TABLE contract_modifications ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'approved', 'rejected', 'effective', 'cancelled'));

ALTER TABLE contract_modifications ADD CONSTRAINT check_payment_change_percentage 
  CHECK (payment_change_percentage >= -100 AND payment_change_percentage <= 100);

ALTER TABLE contract_modifications ADD CONSTRAINT check_rate_change_percentage 
  CHECK (rate_change_percentage >= -100 AND rate_change_percentage <= 100);

-- Add triggers for updated_at
CREATE TRIGGER trg_contract_modifications_updated_at
  BEFORE UPDATE ON contract_modifications
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable RLS
ALTER TABLE contract_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_modification_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_modification_schedule_details ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "contract_modifications_is_contract_owner" ON contract_modifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_modifications.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "contract_modification_calculations_is_contract_owner" ON contract_modification_calculations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contract_modifications 
      JOIN contracts ON contracts.id = contract_modifications.contract_id
      WHERE contract_modifications.id = contract_modification_calculations.modification_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "contract_modification_schedule_details_is_contract_owner" ON contract_modification_schedule_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contract_modification_calculations
      JOIN contract_modifications ON contract_modifications.id = contract_modification_calculations.modification_id
      JOIN contracts ON contracts.id = contract_modifications.contract_id
      WHERE contract_modification_calculations.id = contract_modification_schedule_details.calculation_id 
      AND contracts.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_modifications_contract_id ON contract_modifications(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_modifications_effective_date ON contract_modifications(effective_date);
CREATE INDEX IF NOT EXISTS idx_contract_modifications_status ON contract_modifications(status);
CREATE INDEX IF NOT EXISTS idx_contract_modifications_type ON contract_modifications(modification_type);

CREATE INDEX IF NOT EXISTS idx_contract_modification_calculations_modification_id ON contract_modification_calculations(modification_id);
CREATE INDEX IF NOT EXISTS idx_contract_modification_calculations_date ON contract_modification_calculations(calculation_date);

CREATE INDEX IF NOT EXISTS idx_contract_modification_schedule_details_calculation_id ON contract_modification_schedule_details(calculation_id);
CREATE INDEX IF NOT EXISTS idx_contract_modification_schedule_details_period ON contract_modification_schedule_details(calculation_id, period);

-- Add comments for documentation
COMMENT ON TABLE contract_modifications IS 'Contract modifications for IFRS 16 lease contracts';
COMMENT ON TABLE contract_modification_calculations IS 'Calculation results for contract modifications';
COMMENT ON TABLE contract_modification_schedule_details IS 'Detailed amortization schedule for modified contracts';
