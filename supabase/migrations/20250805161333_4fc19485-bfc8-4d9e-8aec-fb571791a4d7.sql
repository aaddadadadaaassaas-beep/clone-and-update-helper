-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false);

-- Create policies for ticket attachments storage
CREATE POLICY "Users can upload attachments to accessible tickets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT t.id::text
    FROM tickets t
    WHERE (
      t.submitter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      t.assignee_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'owner', 'employee')
      )
    )
  )
);

CREATE POLICY "Users can view attachments from accessible tickets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT t.id::text
    FROM tickets t
    WHERE (
      t.submitter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      t.assignee_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'owner', 'employee')
      )
    )
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ticket-attachments' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT t.id::text
    FROM tickets t
    WHERE (
      t.submitter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'owner', 'employee')
      )
    )
  )
);

-- Update attachments table to include storage path
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS storage_path text;

-- Create function to get attachment URL
CREATE OR REPLACE FUNCTION get_attachment_url(attachment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attachment_record attachments%ROWTYPE;
  signed_url text;
BEGIN
  SELECT * INTO attachment_record FROM attachments WHERE id = attachment_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has access to this attachment's ticket
  IF NOT EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = attachment_record.ticket_id 
    AND (
      t.submitter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      t.assignee_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role IN ('admin', 'owner', 'employee')
      )
    )
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Return the storage path for the frontend to generate signed URL
  RETURN attachment_record.storage_path;
END;
$$;