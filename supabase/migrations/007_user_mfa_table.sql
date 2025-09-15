-- Create user_mfa table for Multi-Factor Authentication
CREATE TABLE IF NOT EXISTS user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  backup_codes TEXT[] NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one MFA record per user
  UNIQUE(user_id)
);

-- Add trigger for updated_at
CREATE TRIGGER trg_user_mfa_updated_at
  BEFORE UPDATE ON user_mfa
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable RLS
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own MFA data
CREATE POLICY "user_mfa_is_owner" ON user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa(is_enabled);

-- Add comment for documentation
COMMENT ON TABLE user_mfa IS 'Stores Multi-Factor Authentication secrets and backup codes for users';
COMMENT ON COLUMN user_mfa.secret IS 'Base32 encoded TOTP secret';
COMMENT ON COLUMN user_mfa.backup_codes IS 'Array of backup codes for account recovery';
