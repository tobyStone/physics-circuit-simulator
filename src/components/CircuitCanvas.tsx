import { CircuitComponent, CircuitModel } from "@/lib/simulation/types";
import { motion } from "framer-motion";

interface CircuitCanvasProps {
  circuit: CircuitModel;
  components: CircuitComponent[];
  onComponentClick?: (id: string) => void;
}

export default function CircuitCanvas({ circuit, components, onComponentClick }: CircuitCanvasProps) {
  // Grid settings
  const gridSize = 100;
  const offsetX = 100;
  const offsetY = 100;

  const formatCurrent = (current: number) => {
    if (current > 900) return 'SHORT';
    if (Math.abs(current) < 0.0001) return '0.000A';
    if (Math.abs(current) < 0.1) {
      const str4 = current.toFixed(4);
      if (str4.endsWith('0')) {
        return current.toFixed(3) + 'A';
      }
      return current.toFixed(4) + 'A';
    }
    return current.toFixed(3) + 'A';
  };

  return (
    <div className="relative min-w-[2000px] min-h-[1000px] w-full h-full z-0">
      <svg className="absolute inset-0 min-w-[2000px] min-h-[1000px] w-full h-full z-0 pointer-events-none">
        {circuit.wirePaths?.map((wire, idx) => {
          if (!wire.path || wire.path.length < 2) return null;
          
          // Generate SVG path string
          const pathD = wire.path.map((pt, i) => {
            const x = pt.x * gridSize + offsetX;
            const y = pt.y * gridSize + offsetY;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ');

          // Heuristic to force clockwise electron flow in rectangular circuits
          const startPt = wire.path[0];
          const endPt = wire.path[wire.path.length - 1];
          const dx = endPt.x - startPt.x;
          const dy = endPt.y - startPt.y;
          const midX = (startPt.x + endPt.x) / 2;
          const midY = (startPt.y + endPt.y) / 2;
          
          let isReversed = false;
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal wire
            if (midY < 10 && dx < 0) isReversed = true; // Top wire should flow right
            if (midY >= 10 && dx > 0) isReversed = true; // Bottom wire should flow left
          } else {
            // Vertical wire
            if (midX >= 10 && dy < 0) isReversed = true; // Right wire should flow down
            if (midX < 10 && dy > 0) isReversed = true; // Left wire should flow up
          }

          // Find current for animation speed
          const sourceComponent = components.find(c => c.id === wire.currentSourceId);
          const fromComponent = components.find(c => c.id === wire.from);
          const toComponent = components.find(c => c.id === wire.to);
          
          let current = sourceComponent ? Math.abs(sourceComponent.current) : 0;
          
          const isVoltmeterWire = fromComponent?.type === 'Voltmeter' || toComponent?.type === 'Voltmeter';
          if (isVoltmeterWire) {
              current = 0; // Ideal voltmeters have infinite resistance, no current
          } else if (current === 0 && components.length > 0) {
              // Fallback: If AI forgot to update the battery current, use the max current of any main component
              const mainCurrents = components.filter(c => c.type !== 'Voltmeter').map(c => Math.abs(c.current));
              if (mainCurrents.length > 0) {
                  current = Math.max(...mainCurrents);
              }
          }
          
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
                strokeWidth="2" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Flow Animation Overlay */}
              {current > 0 && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={activeColor} 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="10 15"
                  className="electron-flow"
                  style={{
                    animationDuration: `${Math.min(2, Math.max(0.2, 0.15 / Math.sqrt(current)))}s`,
                    animationDirection: isReversed ? 'reverse' : 'normal'
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Components Layer */}
      {components.map((c, index) => {
        const x = (c.metadata?.x || 0) * gridSize + offsetX;
        const y = (c.metadata?.y || 0) * gridSize + offsetY;
        const isVertical = c.metadata?.orientation === 'vertical';
        
        return (
          <motion.div
            key={circuit.id + '-' + c.id + '-' + index}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, x: "-50%", y: "-50%" }}
            className={`absolute z-10 flex flex-col items-center justify-center ${c.type === 'Switch' ? 'cursor-pointer pointer-events-auto hover:scale-[1.05] active:scale-95 transition-transform' : 'pointer-events-none'}`}
            style={{ 
              left: x, 
              top: y,
              width: 60,
              height: 60
            }}
            onClick={() => onComponentClick && onComponentClick(c.id)}
          >
            <div className={`absolute z-20 ${isVertical ? 'left-full top-0 ml-3' : 'bottom-full mb-3'} text-xs font-bold text-text bg-background/80 px-2 py-1 rounded border border-border/30 shadow-lg whitespace-nowrap`}>
              {c.name}
            </div>
            <ComponentRenderer component={c} />
            <div className={`absolute z-20 ${isVertical ? 'left-full bottom-0 ml-3' : 'top-full mt-3'} px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-text-muted font-mono whitespace-nowrap border border-border`}>
              {c.type === 'Battery' ? c.value.toFixed(2) : c.voltageDrop.toFixed(2)}V | {formatCurrent(c.current)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ComponentRenderer({ component }: { component: CircuitComponent }) {
  const isVertical = component.metadata?.orientation === 'vertical';
  const isActive = component.current > 0;
  let strokeColor = isActive ? "var(--color-accent)" : "rgba(255, 255, 255, 0.5)";
  let glow = isActive ? "drop-shadow(0 0 8px var(--color-accent-glow))" : "none";
  const bg = "var(--color-background)";

  let svgContent = null;

  switch (component.type) {
    case 'Battery':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="20" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="40" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="45" stroke={strokeColor} strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="40" stroke={strokeColor} strokeWidth="6" />
        </>
      );
      break;
    case 'Switch':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="15" cy="30" r="3" fill={bg} stroke={strokeColor} strokeWidth="2" />
          <circle cx="45" cy="30" r="3" fill={bg} stroke={strokeColor} strokeWidth="2" />
          {component.value === 1 ? (
             <line x1="15" y1="30" x2="45" y2="30" stroke={strokeColor} strokeWidth="2" />
          ) : (
             <line x1="15" y1="30" x2="40" y2="15" stroke={strokeColor} strokeWidth="2" />
          )}
        </>
      );
      break;
    case 'Resistor':
      const isVariable = component.metadata?.adjustable;
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <rect x="15" y="20" width="30" height="20" fill={bg} stroke={strokeColor} strokeWidth="2" />
          {isVariable && (
            <>
              <line x1="10" y1="45" x2="50" y2="15" stroke={strokeColor} strokeWidth="2" />
              <polygon points="50,15 45,15 48,20" fill={strokeColor} />
            </>
          )}
        </>
      );
      break;
    case 'LED':
      // Physical LED turn-on threshold (approx 1mA for visible light, full brightness at 20mA)
      let ledBrightness = 0;
      if (component.current > 0.001) {
         ledBrightness = Math.max(0.1, Math.min(1, (component.current - 0.001) / 0.019));
      }
      
      const ledColorStr = component.metadata?.color || 'red';
      const cssColor = ledColorStr === 'red' ? '#ff003c' : (ledColorStr === 'green' ? '#00ff66' : '#00f0ff');
      
      const ledStroke = ledBrightness > 0 ? cssColor : "rgba(255, 255, 255, 0.5)";
      
      // Override glow for LED specifically
      if (component.type === 'LED') {
        glow = ledBrightness > 0 ? `drop-shadow(0 0 ${10 + ledBrightness * 20}px ${cssColor})` : "none";
      }

      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          {/* Wire leads (standard color) */}
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          
          {/* LED Body (colored based on brightness) */}
          <g style={{ opacity: ledBrightness > 0 ? 0.3 + (ledBrightness * 0.7) : 1 }}>
            <circle cx="30" cy="30" r="15" fill={bg} stroke={ledStroke} strokeWidth="2" />
            <polygon points="23,20 23,40 37,30" fill="none" stroke={ledStroke} strokeWidth="2" />
            <line x1="37" y1="20" x2="37" y2="40" stroke={ledStroke} strokeWidth="2" />
            
            {/* Arrows */}
            <line x1="40" y1="15" x2="48" y2="7" stroke={ledStroke} strokeWidth="2" />
            <polygon points="48,7 44,7 46,11" fill={ledStroke} />
            <line x1="45" y1="20" x2="53" y2="12" stroke={ledStroke} strokeWidth="2" />
            <polygon points="53,12 49,12 51,16" fill={ledStroke} />
          </g>
        </>
      );
      break;
    case 'TransistorNPN':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="20" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="45" stroke={strokeColor} strokeWidth="3" />
          <line x1="20" y1="25" x2="40" y2="10" stroke={strokeColor} strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="0" stroke={strokeColor} strokeWidth="2" />
          <line x1="20" y1="35" x2="40" y2="50" stroke={strokeColor} strokeWidth="2" />
          <line x1="40" y1="50" x2="40" y2="60" stroke={strokeColor} strokeWidth="2" />
          <polygon points="38,48 30,44 35,39" fill={strokeColor} transform="rotate(20 35 45)" /> 
          <circle cx="30" cy="30" r="25" fill="none" stroke={strokeColor} strokeWidth="2" />
        </>
      );
      break;
    case 'Motor':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="30" cy="30" r="15" fill={bg} stroke={strokeColor} strokeWidth="2" />
          <text x="30" y="35" fontSize="16" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">M</text>
        </>
      );
      break;
    case 'Ammeter':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="30" cy="30" r="15" fill={bg} stroke={strokeColor} strokeWidth="2" />
          <text x="30" y="35" fontSize="16" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">A</text>
        </>
      );
      break;
    case 'Voltmeter':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="30" cy="30" r="15" fill={bg} stroke={strokeColor} strokeWidth="2" />
          <text x="30" y="35" fontSize="16" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">V</text>
        </>
      );
      break;
    default:
      svgContent = (
         <>
           <rect x="0" y="0" width="60" height="60" fill={bg} />
           <line x1="0" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
         </>
      );
  }

  return (
    <div 
      className={`relative flex items-center justify-center w-[60px] h-[60px] ${isVertical ? 'rotate-90' : ''}`}
      style={{ filter: glow }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        {svgContent}
      </svg>
    </div>
  );
}
