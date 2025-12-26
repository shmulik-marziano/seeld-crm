import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

interface FileUploadZoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesSelected?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUploadZone = ({
  accept = ".xlsx,.xls,.csv",
  multiple = true,
  maxFiles = 10,
  maxSize = 10, // 10MB default
  onFilesSelected,
  onFileRemove,
  className,
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return `סוג קובץ לא נתמך: ${fileExtension}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `גודל קובץ מעל ${maxSize}MB`;
    }

    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`ניתן להעלות מקסימום ${maxFiles} קבצים`);
      return;
    }

    const newFiles: UploadedFile[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      const uploadedFile: UploadedFile = {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: error ? "error" : "pending",
        error: error || undefined,
      };
      newFiles.push(uploadedFile);

      if (!error) {
        validFiles.push(file);
      }
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    if (validFiles.length > 0 && onFilesSelected) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [uploadedFiles.length, maxFiles, maxSize, accept, onFilesSelected]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    onFileRemove?.(fileId);
  };

  const getFileIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-crm-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-crm-error" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-crm-primary" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "upload-zone border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
          isDragging
            ? "border-crm-primary bg-crm-primary-light border-solid"
            : "border-crm-border hover:border-crm-primary hover:bg-crm-bg-hover"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="upload-zone-icon mx-auto mb-4">
          <Upload
            className={cn(
              "h-16 w-16 mx-auto",
              isDragging ? "text-crm-primary" : "text-crm-text-muted"
            )}
          />
        </div>

        <p className="upload-zone-title text-lg font-semibold text-crm-text-primary mb-2">
          {isDragging ? "שחרר את הקבצים כאן" : "גרור קבצים לכאן או לחץ לבחירה"}
        </p>

        <p className="upload-zone-subtitle text-sm text-crm-text-secondary mb-4">
          תומך בקבצי Excel ו-CSV מהר הביטוח ומסלקה
        </p>

        <div className="upload-zone-formats flex justify-center gap-2">
          <Badge className="bg-green-100 text-green-700">.xlsx</Badge>
          <Badge className="bg-green-100 text-green-700">.xls</Badge>
          <Badge className="bg-blue-100 text-blue-700">.csv</Badge>
        </div>

        <p className="text-xs text-crm-text-muted mt-4">
          גודל מקסימלי: {maxSize}MB | מקסימום {maxFiles} קבצים
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-crm-text-secondary">
            קבצים שנבחרו ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  uploadedFile.status === "error"
                    ? "bg-crm-error-light border-crm-error/30"
                    : uploadedFile.status === "success"
                    ? "bg-crm-success-light border-crm-success/30"
                    : "bg-crm-bg-secondary border-crm-border-light"
                )}
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile.status)}
                  <div>
                    <p className="text-sm font-medium text-crm-text-primary">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-crm-text-muted">
                      {formatFileSize(uploadedFile.file.size)}
                      {uploadedFile.error && (
                        <span className="text-crm-error mr-2">
                          • {uploadedFile.error}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadedFile.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
