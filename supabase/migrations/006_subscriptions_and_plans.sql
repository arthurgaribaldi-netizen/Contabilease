-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  currency_code VARCHAR(3) DEFAULT 'BRL',
  max_contracts INTEGER NOT NULL DEFAULT 0,
  max_users INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}',
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, unpaid
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contracts_count INTEGER DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_contracts, max_users, features) VALUES
('Gratuito', 'Plano gratuito para teste', 0.00, 0.00, 3, 1, '{"contracts": 3, "users": 1, "support": "email", "features": ["basic_calculations", "export_pdf"]}'),
('Básico', 'Ideal para contadores individuais', 29.00, 290.00, 25, 1, '{"contracts": 25, "users": 1, "support": "email", "features": ["advanced_calculations", "export_pdf", "export_excel", "modifications"]}'),
('Profissional', 'Para escritórios pequenos', 79.00, 790.00, 100, 5, '{"contracts": 100, "users": 5, "support": "priority", "features": ["advanced_calculations", "export_pdf", "export_excel", "modifications", "api_access", "custom_reports"]}'),
('Escritório', 'Para escritórios grandes', 199.00, 1990.00, 500, 20, '{"contracts": 500, "users": 20, "support": "dedicated", "features": ["advanced_calculations", "export_pdf", "export_excel", "modifications", "api_access", "custom_reports", "white_label", "priority_support"]}');

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "subscription_plans_public_read" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "user_subscriptions_own_data" ON user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for subscription_usage
CREATE POLICY "subscription_usage_own_data" ON subscription_usage
  FOR ALL USING (auth.uid() = user_id);

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name VARCHAR(100),
  plan_description TEXT,
  price_monthly DECIMAL(10,2),
  max_contracts INTEGER,
  max_users INTEGER,
  features JSONB,
  status VARCHAR(50),
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.name,
    sp.description,
    sp.price_monthly,
    sp.max_contracts,
    sp.max_users,
    sp.features,
    us.status,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'past_due')
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create more contracts
CREATE OR REPLACE FUNCTION can_create_contract(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan_max INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get current plan limits
  SELECT sp.max_contracts INTO current_plan_max
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'past_due')
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, use free plan limits
  IF current_plan_max IS NULL THEN
    SELECT max_contracts INTO current_plan_max
    FROM subscription_plans
    WHERE name = 'Gratuito';
  END IF;
  
  -- Get current usage
  SELECT COALESCE(contracts_count, 0) INTO current_usage
  FROM subscription_usage
  WHERE user_id = user_uuid;
  
  -- Return true if under limit
  RETURN current_usage < current_plan_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update subscription usage
CREATE OR REPLACE FUNCTION update_subscription_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO subscription_usage (user_id, contracts_count, users_count, last_updated)
  VALUES (
    user_uuid,
    (SELECT COUNT(*) FROM contracts WHERE user_id = user_uuid),
    1, -- For now, always 1 user per subscription
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    contracts_count = (SELECT COUNT(*) FROM contracts WHERE user_id = user_uuid),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update usage when contracts are created/deleted
CREATE OR REPLACE FUNCTION trigger_update_subscription_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_subscription_usage(NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_subscription_usage(OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_usage_trigger
  AFTER INSERT OR DELETE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_subscription_usage();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
