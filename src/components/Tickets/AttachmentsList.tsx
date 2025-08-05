import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { File, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';

interface Attachment {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  file_path: string; // Using file_path as fallback for storage_path
  created_at: string;
  user_id: string;
}

interface AttachmentsListProps {
  ticketId: string;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({ ticketId }) => {
  const { getFileUrl } = useFileUpload();

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Attachment[];
    },
    enabled: !!ticketId
  });

  const handleDownload = async (attachment: Attachment) => {
    try {
      // Use storage_path if available, fallback to file_path
      const storagePath = (attachment as any).storage_path || attachment.file_path;
      const url = await getFileUrl(storagePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleView = async (attachment: Attachment) => {
    try {
      // Use storage_path if available, fallback to file_path
      const storagePath = (attachment as any).storage_path || attachment.file_path;
      const url = await getFileUrl(storagePath);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('View failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando anexos...</div>;
  }

  if (!attachments || attachments.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum anexo encontrado.</div>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Anexos ({attachments.length})</h4>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.file_size)} • {' '}
                {new Date(attachment.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {isImageFile(attachment.mime_type) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(attachment)}
                className="h-8 w-8 p-0"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment)}
              className="h-8 w-8 p-0"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentsList;