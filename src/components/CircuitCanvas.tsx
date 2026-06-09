import { CircuitComponent, CircuitModel } from "@/lib/simulation/types";
import { motion } from "framer-motion";
import { Battery, Power, CircleDot, Activity, Cpu } from "lucide-react";

interface CircuitCanvasProps {
  circuit: CircuitModel;
  components: CircuitComponent[];
}

export default function CircuitCanvas({ circuit, components }: CircuitCanvasProps) {
  // Grid settings
  const gridSize = 150;
  const offsetX = 200;
  const offsetY = 150;

  return (
    <div className="absolute inset-0 z-0">
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {circuit.wirePaths?.map((wire, idx) => {
          if (!wire.path || wire.path.length < 2) return null;
          
          // Generate SVG path string
          const pathD = wire.path.map((pt, i) => {
            const x = pt.x * gridSize + offsetX;
            const y = pt.y * gridSize + offsetY;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ');

          // Find current for animation speed
          const sourceComponent = components.find(c => c.id === wire.currentSourceId);
          const current = sourceComponent ? Math.abs(sourceComponent.current) : 0;
          
          // Base wire color
          const baseColor = "rgba(255, 255, 255, 0.2)";
          const activeColor = "var(--color-accent)";
          
          return (
            <g key={`wire-${idx}`}>
              {/* Background Wire */}
              <path 
                d={pathD} 
                fill="none" 
                stroke={baseColor} 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Flow Animation Overlay */}
              {current > 0.001 && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={activeColor} 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="10 15"
                  className="electron-flow"
                  style={{
                    animationDuration: `${Math.max(0.2, 2 / current)}s`
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Components Layer */}
      {components.map(c => {
        const x = (c.metadata?.x || 0) * gridSize + offsetX;
        const y = (c.metadata?.y || 0) * gridSize + offsetY;
        
        return (
          <motion.div
            key={c.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
            style={{ 
              left: x, 
              top: y, 
              transform: 'translate(-50%, -50%)'
            }}
          >
            <ComponentRenderer component={c} />
            <div className="mt-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-text-muted font-mono whitespace-nowrap border border-border">
              {c.voltageDrop.toFixed(2)}V | {c.current.toFixed(3)}A
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ComponentRenderer({ component }: { component: CircuitComponent }) {
  const isVertical = component.metadata?.orientation === 'vertical';
  
  // Dynamic glow based on current or voltage
  const glowIntensity = Math.min(1, component.current * 10); // scale arbitrary
  const glowSize = 10 + (glowIntensity * 20);
  
  let icon = <Activity />;
  let color = 'text-text-muted';
  let glowColor = 'rgba(255,255,255,0)';

  switch (component.type) {
    case 'Battery':
      icon = <Battery size={32} />;
      color = 'text-danger'; // Red for battery
      break;
    case 'Switch':
      icon = <Power size={32} />;
      color = component.value === 1 ? 'text-success' : 'text-text-muted';
      glowColor = component.value === 1 ? 'rgba(0,255,102,0.3)' : 'rgba(0,0,0,0)';
      break;
    case 'Resistor':
      icon = <Activity size={32} />;
      color = 'text-accent';
      break;
    case 'LED':
      icon = <CircleDot size={32} />;
      color = component.current > 0 ? (component.metadata?.color === 'green' ? 'text-success' : 'text-danger') : 'text-text-muted';
      glowColor = component.current > 0 
        ? (component.metadata?.color === 'green' ? 'rgba(0,255,102,0.6)' : 'rgba(255,0,60,0.6)') 
        : 'rgba(0,0,0,0)';
      break;
    case 'TransistorNPN':
      icon = <Cpu size={32} />;
      color = 'text-white';
      break;
  }

  return (
    <div 
      className={`relative flex items-center justify-center w-16 h-16 rounded-xl glass-panel ${color} ${isVertical ? '' : 'rotate-90'}`}
      style={{
        boxShadow: `0 0 ${glowSize}px ${glowColor}, inset 0 0 ${glowSize/2}px ${glowColor}`
      }}
    >
      {icon}
    </div>
  );
}
