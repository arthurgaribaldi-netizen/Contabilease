-- Security tables for production monitoring and audit
-- This migration creates tables for security logging, rate limiting, and audit trails

-- Create security_logs table for tracking security events
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_id, resource_type, permission)
);

-- Create rate_limits table for persistent rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    ip_address INET,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, endpoint, window_start)
);

-- Create audit_trail table for tracking data changes
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_logs table for tracking user sessions
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start, window_end);

CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);

CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_session_id ON session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_active ON session_logs(is_active);

-- Enable RLS on all security tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_logs
CREATE POLICY "Users can view their own security logs" ON security_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all security logs" ON security_logs
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all permissions" ON user_permissions
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for rate_limits
CREATE POLICY "Service role can manage rate limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for audit_trail
CREATE POLICY "Users can view their own audit trail" ON audit_trail
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all audit trails" ON audit_trail
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for session_logs
CREATE POLICY "Users can view their own session logs" ON session_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all session logs" ON session_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for security operations
-- CORRIGIDO: Reordenando parâmetros para que os obrigatórios venham primeiro
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR(100),
    p_severity VARCHAR(20),
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO security_logs (
        user_id, event_type, severity, details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_event_type, p_severity, p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old security logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete logs older than 90 days
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    PERFORM log_security_event(
        'security_logs_cleanup',
        'low',
        NULL,
        jsonb_build_object('deleted_count', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limits
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete rate limits older than 24 hours
    DELETE FROM rate_limits 
    WHERE window_end < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete inactive sessions older than 30 days
    DELETE FROM session_logs 
    WHERE is_active = false AND logout_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_logs_updated_at
    BEFORE UPDATE ON security_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_logs_updated_at
    BEFORE UPDATE ON session_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    'security_events' as metric_type,
    event_type as metric_name,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type, DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
    'security_severity' as metric_type,
    severity as metric_name,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY severity, DATE_TRUNC('day', created_at)

UNION ALL

SELECT 
    'active_sessions' as metric_type,
    'active' as metric_name,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM session_logs
WHERE is_active = true AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON security_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_security_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_sessions TO service_role;

-- Comments
COMMENT ON TABLE security_logs IS 'Logs security events and incidents for audit and monitoring';
COMMENT ON TABLE user_permissions IS 'Fine-grained permissions for users on specific resources';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API endpoints and user actions';
COMMENT ON TABLE audit_trail IS 'Audit trail for data changes in the system';
COMMENT ON TABLE session_logs IS 'User session tracking for security monitoring';
