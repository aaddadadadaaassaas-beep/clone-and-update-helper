-- Fix storage policies for attachments
-- Add policy for authenticated users to upload to ticket-attachments bucket
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ticket-attachments' AND 
  auth.uid() IS NOT NULL
);

-- Add policy to view attachments (for download)
CREATE POLICY "Users can view attachments on accessible tickets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'ticket-attachments' AND
  EXISTS (
    SELECT 1 FROM attachments a
    JOIN tickets t ON a.ticket_id = t.id
    WHERE a.storage_path = storage.objects.name
    AND (
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