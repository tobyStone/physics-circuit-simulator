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

        if (!data || !Array.isArray(data.components)) {
          console.error('Invalid AI Output:', data);
          throw new Error('The AI generated an invalid circuit (missing components). Please try uploading the image again.');
        }

        // Deep sanitize the components to guarantee they render correctly
        data.components = data.components.map((c: any, index: number) => {
          let cx = Number(c.metadata?.x ?? c.x);
          let cy = Number(c.metadata?.y ?? c.y);
          let orientation = c.metadata?.orientation || c.orientation || 'horizontal';
          
          // If the AI hallucinates pixel coordinates (e.g. x: 150, y: 200) or strings,
          // override them with a default square loop layout so it's not a straight line
          if (isNaN(cx) || cx > 20 || cx < 0) cx = [1, 3, 5, 3][index % 4];
          if (isNaN(cy) || cy > 20 || cy < 0) cy = [3, 1, 3, 5][index % 4];

          let compValue = Number(c.value) || 0;
          let calculatedMax = c.type === 'Battery' ? compValue : Math.max(compValue * 2, 10);

          return {
            ...c,
            id: c.id || `gen-comp-${index}`,
            type: c.type || 'Resistor',
            name: c.name || `Component ${index}`,
            value: compValue,
            current: Number(c.current) || 0,
            voltageDrop: Number(c.voltageDrop) || 0,
            metadata: {
              ...c.metadata,
              x: cx,
              y: cy,
              orientation: orientation,
              adjustable: !!(c.metadata?.adjustable ?? c.adjustable),
              max: calculatedMax,
              min: 0,
              step: compValue > 1000 ? 100 : (compValue > 100 ? 10 : 1)
            }
          };
        });

        let processedWires = Array.isArray(data.wires) ? data.wires : (Array.isArray(data.wirePaths) ? data.wirePaths : []);

        // 1. Auto-close open loops (AI frequently forgets the return wire to the battery)
        const connections: Record<string, number> = {};
        data.components.forEach((c: any) => connections[c.id] = 0);
        processedWires.forEach((w: any) => {
            if (connections[w.from] !== undefined) connections[w.from]++;
            if (connections[w.to] !== undefined) connections[w.to]++;
        });
        
        // Find main components (ignore voltmeters as they are parallel) that only have 1 wire connected
        const endpoints = data.components.filter((c: any) => c.type !== 'Voltmeter' && connections[c.id] === 1);
        if (endpoints.length === 2) {
            processedWires.push({
                from: endpoints[0].id,
                to: endpoints[1].id,
                currentSourceId: data.components.find((c: any) => c.type === 'Battery')?.id || endpoints[0].id
            });
        }

        // 2. Smart Orientation-Aware Auto-Routing
        processedWires = processedWires.map((wire: any) => {
          // Fuzzy matcher to correct AI typos in from/to IDs
          const findComp = (id: string) => {
             if (!id) return null;
             let c = data.components.find((c: any) => c.id === id);
             if (c) return c;
             // Try fuzzy match
             const lowerId = id.toLowerCase();
             return data.components.find((c: any) => 
               c.id.toLowerCase() === lowerId || 
               (c.name && c.name.toLowerCase().includes(lowerId)) || 
               lowerId.includes(c.name?.toLowerCase() || '')
             );
          };

          const fromComp = findComp(wire.from);
          const toComp = findComp(wire.to);
          
          let path = [];
          if (fromComp && toComp) {
             const x1 = fromComp.metadata.x;
             const y1 = fromComp.metadata.y;
             const x2 = toComp.metadata.x;
             const y2 = toComp.metadata.y;
             
             // Check if AI provided a valid custom path
             let aiPath = Array.isArray(wire.path) ? wire.path.map((pt: any) => ({
                 x: Number(pt.x) || 0,
                 y: Number(pt.y) || 0
             })) : [];
             
             let isValidAiPath = aiPath.length >= 2 && aiPath.every((pt: any) => pt.x <= 20 && pt.y <= 20 && pt.x >= 0 && pt.y >= 0);

             // FAILSAFE: If a Voltmeter's wire spans more than 5 units horizontally, it's a hallucination.
             // We must intercept and force a U-shape.
             if (isValidAiPath && (fromComp.type === 'Voltmeter' || toComp.type === 'Voltmeter')) {
                 const minX = Math.min(...aiPath.map((p: any) => p.x));
                 const maxX = Math.max(...aiPath.map((p: any) => p.x));
                 if (maxX - minX > 5) {
                     isValidAiPath = false; // Force fallback router
                 }
             }

             if (isValidAiPath) {
                 // Trust AI's routing to allow tall loops and custom corners.
                 // We prepend/append the exact component centers to prevent visual gaps, 
                 // but we DO NOT overwrite the AI's custom nodes (which define the U-shape loop)!
                 if (Math.abs(aiPath[0].x - x1) > 0.01 || Math.abs(aiPath[0].y - y1) > 0.01) {
                     aiPath.unshift({ x: x1, y: y1 });
                 }
                 if (Math.abs(aiPath[aiPath.length - 1].x - x2) > 0.01 || Math.abs(aiPath[aiPath.length - 1].y - y2) > 0.01) {
                     aiPath.push({ x: x2, y: y2 });
                 }
                 
                 // Auto-Orthogonalizer: fix any diagonal lines generated by the AI
                 let orthogonalPath = [aiPath[0]];
                 for (let i = 1; i < aiPath.length; i++) {
                     let prev = orthogonalPath[orthogonalPath.length - 1];
                     let curr = aiPath[i];
                     
                     // If both x and y change, it's a diagonal line!
                     if (Math.abs(prev.x - curr.x) > 0.01 && Math.abs(prev.y - curr.y) > 0.01) {
                         let pPrev = orthogonalPath.length > 1 ? orthogonalPath[orthogonalPath.length - 2] : null;
                         
                         if (i === 1) {
                             // First move: use component orientation to decide direction
                             const fromHorizontal = fromComp.metadata.orientation !== 'vertical';
                             if (fromHorizontal) {
                                 orthogonalPath.push({ x: curr.x, y: prev.y });
                             } else {
                                 orthogonalPath.push({ x: prev.x, y: curr.y });
                             }
                         } else if (pPrev) {
                             // Continue alternating directions
                             if (Math.abs(pPrev.x - prev.x) < 0.01) {
                                 // Was moving vertically, now move horizontally
                                 orthogonalPath.push({ x: curr.x, y: prev.y });
                             } else {
                                 // Was moving horizontally, now move vertically
                                 orthogonalPath.push({ x: prev.x, y: curr.y });
                             }
                         } else {
                             orthogonalPath.push({ x: curr.x, y: prev.y });
                         }
                     }
                     orthogonalPath.push(curr);
                 }
                 
                 // Force final segment to match destination orientation if possible
                 const toHorizontal = toComp.metadata.orientation !== 'vertical';
                 let last = orthogonalPath[orthogonalPath.length - 1];
                 let pLast = orthogonalPath[orthogonalPath.length - 2];
                 
                 if (pLast) {
                     const isHorizontalEntry = Math.abs(pLast.y - last.y) < 0.01;
                     const isVerticalEntry = Math.abs(pLast.x - last.x) < 0.01;
                     
                     if (toHorizontal && isVerticalEntry && Math.abs(pLast.y - last.y) > 0.01) {
                          // Needs to enter horizontally, but is entering vertically
                          orthogonalPath.splice(orthogonalPath.length - 1, 0, { x: pLast.x, y: last.y });
                     } else if (!toHorizontal && isHorizontalEntry && Math.abs(pLast.x - last.x) > 0.01) {
                          // Needs to enter vertically, but is entering horizontally!
                          // This happens when the AI is lazy and draws a straight line from Voltmeter to Resistor.
                          // We MUST inject a U-shape detour to enter from the bottom!
                          let offset = 1; // Default to looping underneath
                          orthogonalPath.splice(orthogonalPath.length - 1, 0, 
                              { x: pLast.x, y: last.y + offset }, 
                              { x: last.x, y: last.y + offset }
                          );
                     }
                 }
                 
                 // Force first segment to match source orientation too
                 const fromHorizontal = fromComp.metadata.orientation !== 'vertical';
                 let first = orthogonalPath[0];
                 let next = orthogonalPath[1];
                 if (next) {
                     const isHorizontalExit = Math.abs(first.y - next.y) < 0.01;
                     const isVerticalExit = Math.abs(first.x - next.x) < 0.01;
                     
                     if (fromHorizontal && isVerticalExit && Math.abs(first.y - next.y) > 0.01) {
                         orthogonalPath.splice(1, 0, { x: next.x, y: first.y });
                     } else if (!fromHorizontal && isHorizontalExit && Math.abs(first.x - next.x) > 0.01) {
                         let offset = 1; 
                         orthogonalPath.splice(1, 0, 
                             { x: first.x, y: first.y + offset },
                             { x: next.x, y: first.y + offset }
                         );
                     }
                 }

                 path = orthogonalPath;
             } else {
                 // Fallback: Smart Midpoint Auto-Routing if AI hallucinates or forgets path
                 const fromHorizontal = fromComp.metadata.orientation !== 'vertical';
                 const toHorizontal = toComp.metadata.orientation !== 'vertical';

                 // Orientation-aware routing: ensure wires leave and enter components along their primary axis
                 if (fromHorizontal && toHorizontal) {
                    path = [{x: x1, y: y1}, {x: (x1 + x2) / 2, y: y1}, {x: (x1 + x2) / 2, y: y2}, {x: x2, y: y2}];
                 } else if (!fromHorizontal && !toHorizontal) {
                    path = [{x: x1, y: y1}, {x: x1, y: (y1 + y2) / 2}, {x: x2, y: (y1 + y2) / 2}, {x: x2, y: y2}];
                 } else if (fromHorizontal && !toHorizontal) {
                    path = [{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}];
                 } else {
                    path = [{x: x1, y: y1}, {x: x1, y: y2}, {x: x2, y: y2}];
                 }
             }
          } else if (Array.isArray(wire.path)) {
             // Fallback
             path = wire.path.map((pt: any) => ({
               x: Number(pt.x) || 0,
               y: Number(pt.y) || 0
             }));
          }

          return { ...wire, path };
        });

        const newCircuit: CircuitModel = {
          id: `generated-${Date.now()}`,
          name: "Generated Circuit",
          description: "A circuit generated from your uploaded diagram.",
          components: data.components,
          wirePaths: processedWires,
          updateFunctionBody: data.updateFunctionBody,
          update: new Function('components', (data.updateFunctionBody || '') + '\nreturn components;') as any,
        };

        onGenerated(newCircuit);
        onClose();
      } catch (err: any) {
        let msg = err.message || 'An unexpected error occurred.';
        if (msg.includes('429 Too Many Requests') || msg.includes('Quota exceeded')) {
           msg = "The AI service is currently receiving too many requests. Please wait 60 seconds and try again.";
        } else if (msg.length > 200) {
           msg = "The AI encountered an error processing your image. Please try a different diagram.";
        }
        setError(msg);
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
