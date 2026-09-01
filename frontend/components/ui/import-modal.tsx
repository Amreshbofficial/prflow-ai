"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const importMutation = useMutation({
    mutationFn: (formData: FormData) => leadsApi.importLeads(formData),
    onSuccess: () => {
      setIsUploading(false);
      setUploadSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
        // Reset state
        setTimeout(() => {
          setFile(null);
          setUploadSuccess(false);
        }, 300);
      }, 1500);
    },
    onError: () => {
      setIsUploading(false);
      // Handle error gracefully if needed
    }
  });

  const handleUpload = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    importMutation.mutate(formData);
  };

  const resetForm = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Leads"
      description="Upload a CSV or Excel file to bulk import leads."
      maxWidth="md"
      footer={
        <>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            disabled={isUploading || uploadSuccess}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || uploadSuccess}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary-hover h-9 px-4 shadow-sm"
          >
            {isUploading ? 'Uploading...' : uploadSuccess ? 'Done' : 'Import File'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {!uploadSuccess ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-primary/50 bg-primary-soft/10' : 'border-border hover:bg-surface-secondary/50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-text-muted" />
                  </div>
                  <div>
                    <label htmlFor="file-upload" className="cursor-pointer font-medium text-primary hover:text-primary-hover">
                      <span>Click to upload</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1 inline text-sm text-text-secondary">or drag and drop</p>
                  </div>
                  <p className="text-xs text-text-muted">CSV or Excel up to 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{file.name}</p>
                    <p className="text-xs text-text-muted mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {!isUploading && (
                    <button onClick={() => setFile(null)} className="text-xs text-error hover:text-error/80 font-medium">
                      Remove file
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary font-medium">
                  <span>Uploading and processing...</span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-1.5 overflow-hidden flex">
                  <div className="bg-primary h-1.5 rounded-full w-full animate-pulse" />
                </div>
              </div>
            )}
            
            <div className="bg-info-soft/30 rounded-lg p-3 flex items-start gap-3 border border-info/20">
              <AlertCircle className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
              <div className="text-xs text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Required Columns:</p>
                <p>Company Name, Contact Name. Optional: Email, Website, Industry.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-success-soft rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">Import Successful</h3>
              <p className="text-sm text-text-secondary mt-1">
                Your leads are being processed in the background.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
