import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload, UploadedFile } from '@/hooks/useFileUpload';

interface FileUploadProps {
  ticketId?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  ticketId,
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  disabled = false,
  existingFiles = []
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { uploadFile, deleteFile, getFileUrl, uploading } = useFileUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!ticketId) {
      console.warn('No ticket ID provided for file upload');
      return;
    }

    for (const file of acceptedFiles) {
      if (files.length >= maxFiles) {
        break;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [tempId]: Math.min((prev[tempId] || 0) + 10, 90)
        }));
      }, 200);

      try {
        const uploadedFile = await uploadFile(file, ticketId);
        
        if (uploadedFile) {
          const newFiles = [...files, uploadedFile];
          setFiles(newFiles);
          onFilesChange?.(newFiles);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        clearInterval(progressInterval);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[tempId];
          return newProgress;
        });
      }
    }
  }, [files, maxFiles, ticketId, uploadFile, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || uploading || files.length >= maxFiles
  });

  const handleRemoveFile = async (file: UploadedFile) => {
    const success = await deleteFile(file.id, file.storagePath);
    if (success) {
      const newFiles = files.filter(f => f.id !== file.id);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    try {
      const url = await getFileUrl(file.storagePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Solte os arquivos aqui...'
              : 'Arraste arquivos aqui ou clique para selecionar'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo {maxFiles} arquivos, até {formatFileSize(maxSize)} cada
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([id, progress]) => (
        <div key={id} className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Enviando...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      ))}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos anexados ({files.length})</h4>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(file)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;