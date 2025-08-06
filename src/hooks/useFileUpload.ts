import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  storagePath: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, ticketId: string): Promise<UploadedFile | null> => {
    setUploading(true);
    
    try {
      // Create unique file path: ticketId/timestamp-filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${ticketId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Insert attachment record to database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get profile ID from user ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data: attachmentData, error: dbError } = await supabase
        .from('attachments')
        .insert({
          ticket_id: ticketId,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_path: uploadData.path, // Legacy field
          storage_path: uploadData.path, // New field for storage
          user_id: profile.id // Use profile ID, not auth user ID
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('ticket-attachments')
          .remove([uploadData.path]);
        throw dbError;
      }

      toast({
        title: "Arquivo enviado",
        description: `${file.name} foi enviado com sucesso.`,
      });

      return {
        id: attachmentData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        storagePath: uploadData.path
      };

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao enviar arquivo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (attachmentId: string, storagePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ticket-attachments')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

      toast({
        title: "Arquivo removido",
        description: "Arquivo foi removido com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: "Erro ao remover",
        description: error.message || "Falha ao remover arquivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getFileUrl = async (storagePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Get URL error:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Failed to get file URL:', error);
      return null;
    }
  };

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    uploading
  };
};