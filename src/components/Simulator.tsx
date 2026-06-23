"use client";

import { useState, useEffect } from "react";
import { getCircuitList } from "@/lib/simulation/circuits";
import { CircuitModel, CircuitComponent } from "@/lib/simulation/types";
import { motion } from "framer-motion";
import { Settings, Zap, RotateCcw, BookOpen, X, Camera } from "lucide-react";
import CircuitCanvas from "./CircuitCanvas";
import GenerateModal from "./GenerateModal";

export default function Simulator() {
  const [circuits, setCircuits] = useState<CircuitModel[]>(getCircuitList());
  const [activeCircuit, setActiveCircuit] = useState<CircuitModel>(circuits[0]);
  const [components, setComponents] = useState<CircuitComponent[]>(circuits[0].components);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Load custom circuits from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voltlab_custom_circuits');
      if (saved) {
        const parsed = JSON.parse(saved) as CircuitModel[];
        const rehydrated = parsed.map(c => ({
          ...c,
          update: new Function('components', (c.updateFunctionBody || '') + '\nreturn components;') as any
        }));
        setCircuits(prev => {
          const defaults = prev.filter(p => !p.id.startsWith('generated-'));
          return [...defaults, ...rehydrated];
        });
      }
    } catch (e) {
      console.error("Failed to load custom circuits", e);
    }
  }, []);

  // Initialize and run simulation on mount or circuit change
  useEffect(() => {
    // Run initial update
    try {
      const updated = activeCircuit.update(activeCircuit.components);
      setComponents(updated || activeCircuit.components || []);
    } catch (e) {
      console.error("AI Update function failed:", e);
      setComponents(activeCircuit.components || []);
    }
  }, [activeCircuit]);

  const handleComponentChange = (id: string, newValue: number) => {
    const newComponents = (components || []).map(c => 
      c.id === id ? { ...c, value: newValue } : c
    );
    // Run simulation
    try {
      const updated = activeCircuit.update(newComponents);
      setComponents(updated || newComponents);
    } catch (e) {
      console.error("AI Update function failed:", e);
      setComponents(newComponents);
    }
  };

  const safeComponents = components || [];

  return (
    <div className="flex h-screen w-full bg-background text-text overflow-hidden font-sans">
      
      {/* Left Sidebar - Circuit Selector & Controls */}
      <div className="w-80 h-full p-6 flex flex-col gap-6 z-10 border-r border-border bg-[rgba(10,10,15,0.8)] backdrop-blur-md">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg text-accent shadow-[0_0_15px_var(--color-accent-glow)]">
            <Zap size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">VoltLab</h1>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Circuit</label>
          <select 
            className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
            value={activeCircuit.id}
            onChange={(e) => {
              const selected = circuits.find(c => c.id === e.target.value);
              if (selected) {
                setActiveCircuit(selected);
                setComponents(selected.components || []);
              }
            }}
          >
            {circuits.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            {activeCircuit.description}
          </p>
          {activeCircuit.sqaNotes && (
            <button 
              onClick={() => setIsNotesOpen(true)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm text-accent transition-all"
            >
              <BookOpen size={16} /> SQA Study Notes
            </button>
          )}

          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-[#ff00e5]/10 hover:bg-[#ff00e5]/20 border border-[#ff00e5]/30 rounded-lg text-sm text-[#ff00e5] transition-all shadow-[0_0_10px_rgba(255,0,229,0.1)]"
          >
            <Camera size={16} /> Generate from Image
          </button>
        </div>

        <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2 mt-4 custom-scrollbar">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} /> Controls
          </label>
          
          {safeComponents.filter(c => c.metadata?.adjustable && c.type !== 'Switch').map(c => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={c.id} 
              className="glass-panel p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-accent">
                  {`${c.value} ${c.metadata?.unit || ''}`}
                </span>
              </div>
              
              <input 
                type="range" 
                min={c.metadata?.min || 0} 
                max={c.metadata?.max || 100} 
                step={c.metadata?.step || 1}
                value={c.value}
                onChange={(e) => handleComponentChange(c.id, parseFloat(e.target.value))}
              />
            </motion.div>
          ))}
        </div>


      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 min-w-0 min-h-0 relative flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--color-surface)_0%,_var(--color-background)_100%)]">
        
        {/* Readings Overlay (Fixed) */}
        <div className="absolute top-6 right-6 flex gap-4 z-20 pointer-events-none">
           <div className="glass-panel p-4 px-6 flex flex-col items-center min-w-[120px] pointer-events-auto">
              <span className="text-xs text-text-muted uppercase tracking-wider mb-1">Max Current</span>
              <span className="text-2xl font-mono text-accent font-bold">
                {safeComponents.length > 0 ? (
                   Math.max(...safeComponents.map(c => c.current)) > 900 
                     ? <span className="text-[16px] text-red-500">SHORT CIRCUIT</span> 
                     : <>{Math.max(...safeComponents.map(c => c.current)).toFixed(3)}<span className="text-sm text-accent/70 ml-1">A</span></>
                ) : "0.000A"}
              </span>
           </div>
        </div>

        {/* Scrollable Canvas Container */}
        <div className="flex-1 overflow-auto relative">
          {/* Grid Background that scrolls with content */}
          <div 
            className="absolute inset-0 min-w-[2000px] min-h-[1000px] opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <CircuitCanvas 
            circuit={activeCircuit} 
            components={safeComponents} 
            onComponentClick={(id) => {
              const c = safeComponents.find(comp => comp.id === id);
              if (c?.type === 'Switch') {
                handleComponentChange(id, c.value === 1 ? 0 : 1);
              }
            }}
          />
        </div>
      </div>

      {/* SQA Notes Modal */}
      {isNotesOpen && activeCircuit.sqaNotes && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 max-w-lg w-full flex flex-col gap-4 relative border border-accent/40 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
          >
            <button 
              onClick={() => setIsNotesOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 text-accent mb-2">
              <BookOpen size={24} />
              <h2 className="text-xl font-bold">SQA National 5 Notes</h2>
            </div>
            <div className="text-sm leading-relaxed text-text/90 whitespace-pre-wrap">
              {activeCircuit.sqaNotes}
            </div>
            <button 
              onClick={() => setIsNotesOpen(false)}
              className="mt-4 py-2 w-full bg-surface-hover border border-border rounded-lg text-sm hover:bg-surface transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Generate Modal */}
      <GenerateModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        onGenerated={(generatedCircuit) => {
          setCircuits(prev => {
            const customCircuits = prev.filter(c => c.id.startsWith('generated-'));
            const defaults = prev.filter(c => !c.id.startsWith('generated-'));
            
            generatedCircuit.name = `Custom Circuit ${customCircuits.length + 1}`;
            
            let newCustoms = [...customCircuits, generatedCircuit];
            if (newCustoms.length > 3) {
              newCustoms.shift(); // Keep only last 3
              // Rename sequentially
              newCustoms.forEach((c, i) => c.name = `Custom Circuit ${i + 1}`);
            }
            
            // Save to local storage
            try {
               const toSave = newCustoms.map(c => {
                 const { update, ...rest } = c; // exclude function
                 return rest;
               });
               localStorage.setItem('voltlab_custom_circuits', JSON.stringify(toSave));
            } catch (e) {
               console.error("Failed to save to localStorage", e);
            }
            
            return [...defaults, ...newCustoms];
          });

          setActiveCircuit(generatedCircuit);
          setComponents(generatedCircuit.components || []);
          try {
            setComponents(generatedCircuit.update(generatedCircuit.components) || generatedCircuit.components || []);
          } catch (e) {
            console.error("AI Update function failed:", e);
          }
        }} 
      />

    </div>
  );
}
