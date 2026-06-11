"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { CircuitModel } from "@/lib/simulation/types";

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (circuit: CircuitModel) => void;
}

export default function GenerateModal({ isOpen, onClose, onGenerated }: GenerateModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate circuit');
        }

        // We need to attach the actual executable JS function
        // WARNING: Using new Function is risky if this was a multi-user app.
        // For a teacher tool parsing AI json, it is acceptable.
        data.update = new Function('components', data.updateFunctionBody);

        onGenerated(data as CircuitModel);
        onClose();
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 max-w-lg w-full flex flex-col gap-4 relative border border-accent/40 shadow-[0_0_30px_rgba(0,255,255,0.15)] bg-background/95"
      >
        <button 
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 text-accent mb-2">
          <ImageIcon size={24} />
          <h2 className="text-xl font-bold">Generate from Diagram</h2>
        </div>

        <p className="text-sm text-text-muted">
          Upload a clear photo or screenshot of an SQA circuit diagram. Our AI will analyze the components and wiring to build an interactive simulation.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div 
          className={`mt-4 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${
            isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-surface-hover'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 text-accent">
              <Loader2 size={32} className="animate-spin" />
              <div className="text-sm font-medium">Analyzing schematic...</div>
            </div>
          ) : (
            <>
              <UploadCloud size={48} className="text-text-muted mb-4" />
              <p className="font-medium">Drag & Drop your diagram here</p>
              <p className="text-xs text-text-muted mt-2">or click to browse files</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </motion.div>
    </div>
  );
}
