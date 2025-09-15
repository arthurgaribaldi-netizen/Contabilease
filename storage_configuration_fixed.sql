-- Storage configuration and security policies for Contabilease
-- This migration sets up secure file storage with proper access controls
-- FIXED: Corrected function signature and dependency issues

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('user-documents', 'user-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('contract-attachments', 'contract-attachments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
    ('system-backups', 'system-backups', false, 1073741824, ARRAY['application/zip', 'application/x-tar', 'application/gzip'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-documents bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload their own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for user-avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        name ~ '^[a-f0-9-]{36}/avatar\.(jpg|jpeg|png|webp)$'
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        name ~ '^[a-f0-9-]{36}/avatar\.(jpg|jpeg|png|webp)$'
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for contract-attachments bucket
CREATE POLICY "Users can view contract attachments they have access to" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'contract-attachments' AND 
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id::text = (storage.foldername(name))[1]
            AND (
                contracts.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_permissions 
                    WHERE user_permissions.user_id = auth.uid()
                    AND user_permissions.resource_id = contracts.id
                    AND user_permissions.resource_type = 'contract'
                    AND user_permissions.permission = 'read'
                    AND user_permissions.is_active = true
                )
            )
        )
    );

CREATE POLICY "Users can upload contract attachments for their contracts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'contract-attachments' AND 
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id::text = (storage.foldername(name))[1]
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update contract attachments they own" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'contract-attachments' AND 
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id::text = (storage.foldername(name))[1]
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete contract attachments they own" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'contract-attachments' AND 
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id::text = (storage.foldername(name))[1]
            AND contracts.user_id = auth.uid()
        )
    );

-- Storage policies for system-backups bucket (admin only)
CREATE POLICY "Service role can manage system backups" ON storage.objects
    FOR ALL USING (
        bucket_id = 'system-backups' AND 
        auth.role() = 'service_role'
    );

-- Function to get user's storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS TABLE (
    bucket_name TEXT,
    file_count BIGINT,
    total_size BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.name as bucket_name,
        COUNT(o.id) as file_count,
        COALESCE(SUM(o.metadata->>'size')::BIGINT, 0) as total_size
    FROM storage.buckets b
    LEFT JOIN storage.objects o ON b.id = o.bucket_id 
        AND o.name LIKE user_uuid::text || '/%'
    WHERE b.id IN ('user-documents', 'user-avatars', 'contract-attachments')
    GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can upload file
CREATE OR REPLACE FUNCTION can_upload_file(
    user_uuid UUID,
    bucket_name TEXT,
    file_size BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    current_usage BIGINT;
    limit_size BIGINT;
BEGIN
    -- Get current storage usage
    SELECT COALESCE(SUM(metadata->>'size')::BIGINT, 0) INTO current_usage
    FROM storage.objects 
    WHERE bucket_id = bucket_name 
    AND name LIKE user_uuid::text || '/%';
    
    -- Get bucket file size limit
    SELECT file_size_limit INTO limit_size
    FROM storage.buckets 
    WHERE id = bucket_name;
    
    -- Check if adding this file would exceed the limit
    RETURN (current_usage + file_size) <= limit_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Find files that don't have corresponding user records
    FOR file_record IN 
        SELECT o.id, o.name, o.bucket_id
        FROM storage.objects o
        WHERE o.bucket_id IN ('user-documents', 'user-avatars', 'contract-attachments')
        AND NOT EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id::text = (storage.foldername(o.name))[1]
        )
        AND o.created_at < NOW() - INTERVAL '7 days'
    LOOP
        DELETE FROM storage.objects WHERE id = file_record.id;
        deleted_count := deleted_count + 1;
    END LOOP;
    
    -- Log cleanup operation - FIXED: Corrected function signature
    PERFORM log_security_event(
        'orphaned_files_cleanup',
        'low',
        NULL,
        jsonb_build_object('deleted_count', deleted_count)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage statistics
CREATE OR REPLACE FUNCTION get_storage_statistics()
RETURNS TABLE (
    bucket_name TEXT,
    total_files BIGINT,
    total_size BIGINT,
    avg_file_size NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.name as bucket_name,
        COUNT(o.id) as total_files,
        COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) as total_size,
        COALESCE(AVG((o.metadata->>'size')::BIGINT), 0) as avg_file_size
    FROM storage.buckets b
    LEFT JOIN storage.objects o ON b.id = o.bucket_id
    WHERE b.id IN ('user-documents', 'user-avatars', 'contract-attachments')
    GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_storage_usage TO authenticated;
GRANT EXECUTE ON FUNCTION can_upload_file TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_files TO service_role;
GRANT EXECUTE ON FUNCTION get_storage_statistics TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects USING gin((storage.foldername(name)));
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at);

-- Create a view for storage monitoring
CREATE OR REPLACE VIEW storage_monitoring AS
SELECT 
    b.name as bucket_name,
    COUNT(o.id) as file_count,
    COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) as total_size_bytes,
    COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) / 1024 / 1024 as total_size_mb,
    COUNT(DISTINCT (storage.foldername(o.name))[1]) as unique_users,
    DATE_TRUNC('day', o.created_at) as upload_date
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id IN ('user-documents', 'user-avatars', 'contract-attachments')
GROUP BY b.name, DATE_TRUNC('day', o.created_at)
ORDER BY upload_date DESC;

GRANT SELECT ON storage_monitoring TO authenticated;

-- Comments
COMMENT ON FUNCTION get_user_storage_usage IS 'Returns storage usage statistics for a specific user';
COMMENT ON FUNCTION can_upload_file IS 'Checks if a user can upload a file based on size limits';
COMMENT ON FUNCTION cleanup_orphaned_files IS 'Removes files that belong to deleted users';
COMMENT ON FUNCTION get_storage_statistics IS 'Returns overall storage statistics for monitoring';
COMMENT ON VIEW storage_monitoring IS 'Daily storage usage statistics for monitoring and analytics';
