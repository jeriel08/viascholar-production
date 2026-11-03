"use client";

import { CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrollmentDropzoneProps {
  title: string;
  subtitle: string;
  fileTypeLabel: string;
  isUploading: boolean;
  uploadedFile: { name: string; size?: string; url?: string } | null;
  onFileUpload: (file: File) => void;
  onClearFile?: () => void;
  disabled?: boolean;
}

export function EnrollmentDropzone({
  title,
  subtitle,
  fileTypeLabel,
  isUploading,
  uploadedFile,
  onFileUpload,
  onClearFile,
  disabled,
}: EnrollmentDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
      e.target.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <Card className="shadow-xs border-border/80 flex flex-col justify-between h-full">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="size-4 text-emerald-700" />
            {title}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border-emerald-200"
          >
            {fileTypeLabel}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">{subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-center">
        {uploadedFile ? (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-foreground truncate">{uploadedFile.name}</p>
                {uploadedFile.size && (
                  <p className="text-[10px] text-muted-foreground font-medium">{uploadedFile.size}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {uploadedFile.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 px-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <a href={uploadedFile.url} target="_blank" rel="noreferrer">
                    View
                  </a>
                </Button>
              )}
              {onClearFile && !disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClearFile}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Remove document"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || isUploading}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-35 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 ${
              isDragOver
                ? "border-emerald-600 bg-emerald-50/50"
                : "border-border hover:border-emerald-600/50 hover:bg-muted/40"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-7 text-emerald-700 animate-spin" />
                <p className="text-xs font-semibold text-foreground">Reading your document...</p>
                <p className="text-[11px] text-muted-foreground">Gathering your courses, units, and fee details</p>
              </div>
            ) : (
              <>
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
                  <UploadCloud className="size-5 text-emerald-700" />
                </div>
                <p className="text-xs font-semibold text-foreground">Click to upload or drag & drop</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">PDF, PNG, JPG, or WEBP (up to 15 MB)</p>
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
