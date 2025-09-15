-- Storage configuration - Basic setup (sem políticas RLS)
-- Execute este script se não tiver permissão para criar políticas

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('user-documents', 'user-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('contract-attachments', 'contract-attachments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
    ('system-backups', 'system-backups', false, 1073741824, ARRAY['application/zip', 'application/x-tar', 'application/gzip'])
ON CONFLICT (id) DO NOTHING;

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
COMMENT ON FUNCTION get_storage_statistics IS 'Returns overall storage statistics for monitoring';
COMMENT ON VIEW storage_monitoring IS 'Daily storage usage statistics for monitoring and analytics';
