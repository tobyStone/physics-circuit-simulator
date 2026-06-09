"use client";

import { useState, useEffect } from "react";
import { getCircuitList } from "@/lib/simulation/circuits";
import { CircuitModel, CircuitComponent } from "@/lib/simulation/types";
import { motion } from "framer-motion";
import { Settings, Zap, RotateCcw } from "lucide-react";
import CircuitCanvas from "./CircuitCanvas";

export default function Simulator() {
  const circuits = getCircuitList();
  const [activeCircuit, setActiveCircuit] = useState<CircuitModel>(circuits[0]);
  const [components, setComponents] = useState<CircuitComponent[]>(circuits[0].components);

  // Initialize and run simulation on mount or circuit change
  useEffect(() => {
    // Run initial update
    const updated = activeCircuit.update(activeCircuit.components);
    setComponents(updated);
  }, [activeCircuit]);

  const handleComponentChange = (id: string, newValue: number) => {
    const newComponents = components.map(c => 
      c.id === id ? { ...c, value: newValue } : c
    );
    // Run simulation
    setComponents(activeCircuit.update(newComponents));
  };

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
                setComponents(selected.components);
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
        </div>

        <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2 mt-4">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} /> Controls
          </label>
          
          {components.filter(c => c.metadata?.adjustable || c.type === 'Switch').map(c => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={c.id} 
              className="glass-panel p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-accent">
                  {c.type === 'Switch' ? (c.value === 1 ? 'ON' : 'OFF') : `${c.value} ${c.metadata?.unit || ''}`}
                </span>
              </div>
              
              {c.type === 'Switch' ? (
                <button 
                  onClick={() => handleComponentChange(c.id, c.value === 1 ? 0 : 1)}
                  className={`w-full py-2 rounded-md transition-all font-medium text-sm ${
                    c.value === 1 
                      ? 'bg-success/20 text-success border border-success/50 shadow-[0_0_10px_rgba(0,255,102,0.2)]' 
                      : 'bg-surface-hover text-text border border-border'
                  }`}
                >
                  {c.value === 1 ? 'Close Switch (ON)' : 'Open Switch (OFF)'}
                </button>
              ) : (
                <input 
                  type="range" 
                  min={c.metadata?.min || 0} 
                  max={c.metadata?.max || 100} 
                  step={c.metadata?.step || 1}
                  value={c.value}
                  onChange={(e) => handleComponentChange(c.id, parseFloat(e.target.value))}
                />
              )}
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => {
            const initial = circuits.find(c => c.id === activeCircuit.id)!;
            setComponents(initial.components);
            setComponents(activeCircuit.update(initial.components));
          }}
          className="flex items-center justify-center gap-2 w-full py-3 mt-auto bg-surface-hover hover:bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-text transition-all"
        >
          <RotateCcw size={16} /> Reset Circuit
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--color-surface)_0%,_var(--color-background)_100%)]">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        
        {/* Readings Overlay */}
        <div className="absolute top-6 right-6 flex gap-4 z-10">
           {/* Total Circuit Info or specific node info can go here */}
           <div className="glass-panel p-4 px-6 flex flex-col items-center min-w-[120px]">
              <span className="text-xs text-text-muted uppercase tracking-wider mb-1">Max Current</span>
              <span className="text-2xl font-mono text-accent font-bold">
                {Math.max(...components.map(c => c.current)).toFixed(3)}
                <span className="text-sm text-accent/70 ml-1">A</span>
              </span>
           </div>
        </div>

        {/* The Visual Circuit */}
        <CircuitCanvas circuit={activeCircuit} components={components} />
      </div>

    </div>
  );
}
