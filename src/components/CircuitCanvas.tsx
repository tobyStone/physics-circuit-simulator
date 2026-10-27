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

  const isWater = circuit.metadata?.isWater;

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
          const isWater = circuit.metadata?.isWater;
          const baseColor = isWater ? "#0d2847" : "rgba(255, 255, 255, 0.2)";
          const activeColor = isWater ? "#00f0ff" : "var(--color-accent)";
          
          return (
            <g key={`wire-${idx}`}>
              {/* Background Pipe Casing in Water mode */}
              {isWater && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#16385c" 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Background Wire / Pipe Channel */}
              <path 
                d={pathD} 
                fill="none" 
                stroke={isWater ? (current > 0 ? "#06223d" : "#051624") : baseColor} 
                strokeWidth={isWater ? "6" : "2"} 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Flow Animation Overlay */}
              {current > 0 && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={activeColor} 
                  strokeWidth={isWater ? "4" : "2"} 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isWater ? "10 14" : "10 15"}
                  className="electron-flow"
                  style={{
                    animationDuration: `${Math.min(2, Math.max(0.2, 0.15 / Math.sqrt(current)))}s`,
                    animationDirection: isReversed ? 'reverse' : 'normal',
                    filter: isWater ? 'drop-shadow(0 0 6px #00f0ff)' : undefined
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
            <div className={`absolute z-20 ${
              c.metadata?.labelPos === 'left' ? 'right-full top-0 mr-3' :
              c.metadata?.labelPos === 'bottom' ? 'top-full mt-3' :
              isVertical ? 'left-full top-0 ml-3' : 'bottom-full mb-3'
            } text-xs font-bold text-text bg-background/80 px-2 py-1 rounded border border-border/30 shadow-lg whitespace-nowrap`}>
              {c.name}
            </div>
            <ComponentRenderer component={c} isWater={isWater} />
            <div className={`absolute z-20 ${
              c.metadata?.labelPos === 'left' ? 'right-full bottom-0 mr-3' :
              c.metadata?.labelPos === 'top' ? 'bottom-full mb-3' :
              isVertical ? 'left-full bottom-0 ml-3' : 'top-full mt-3'
            } px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] text-text-muted font-mono whitespace-nowrap border border-border`}>
              {isWater ? (
                c.metadata?.waterRole === 'pump' || c.type === 'Battery' ? (
                  `${c.value.toFixed(1)} bar (${c.value.toFixed(1)}V) | ${c.current.toFixed(2)} L/s`
                ) : c.metadata?.waterRole === 'valve' || c.type === 'Switch' ? (
                  c.value === 1 ? 'VALVE OPEN (FLOWING)' : 'VALVE SHUT (BLOCKED)'
                ) : c.metadata?.waterRole === 'constriction' || c.type === 'Resistor' ? (
                  `Restriction: ${c.value.toFixed(1)} Ω | Flow: ${c.current.toFixed(2)} L/s`
                ) : c.metadata?.waterRole === 'flowmeter' || c.type === 'Ammeter' ? (
                  `Flow Rate: ${c.current.toFixed(2)} L/s (= ${c.current.toFixed(2)} A)`
                ) : c.metadata?.waterRole === 'manometer' || c.type === 'Voltmeter' ? (
                  `Pressure Drop: ${c.voltageDrop.toFixed(1)} bar (= ${c.voltageDrop.toFixed(1)} V)`
                ) : (
                  `${c.value} | ${formatCurrent(c.current)}`
                )
              ) : c.type === 'Battery' ? (
                `${c.value.toFixed(2)}V | ${formatCurrent(c.current)}`
              ) : c.type === 'Switch' ? (
                c.value === 1 ? 'CLOSED' : 'OPEN'
              ) : c.type === 'Lamp' ? (
                c.current > 0 ? (
                  <span className="text-amber-400 font-bold">LIT ({formatCurrent(c.current)})</span>
                ) : (
                  <span className="text-text-muted">UNLIT</span>
                )
              ) : circuit.metadata?.resistanceOnly || c.metadata?.resistanceOnly ? (
                `${c.value} Ω | ${formatCurrent(c.current)}`
              ) : (
                `${c.voltageDrop.toFixed(2)}V | ${formatCurrent(c.current)}`
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ComponentRenderer({ component, isWater }: { component: CircuitComponent; isWater?: boolean }) {
  const isVertical = component.metadata?.orientation === 'vertical';
  const isActive = component.current > 0 || component.type === 'Ohmmeter';
  let strokeColor = isWater
    ? (isActive ? "#00f0ff" : "rgba(100, 180, 255, 0.5)")
    : (isActive ? "var(--color-accent)" : "rgba(255, 255, 255, 0.5)");
  let glow = isActive
    ? (isWater ? "drop-shadow(0 0 10px rgba(0, 240, 255, 0.7))" : "drop-shadow(0 0 8px var(--color-accent-glow))")
    : "none";
  const bg = "var(--color-background)";

  let svgContent = null;

  // Custom Water Analogy Components
  if (isWater && component.metadata?.waterRole) {
    switch (component.metadata.waterRole) {
      case 'pump':
        svgContent = (
          <>
            <rect x="0" y="0" width="60" height="60" fill={bg} />
            <line x1="0" y1="30" x2="12" y2="30" stroke="#133654" strokeWidth="8" />
            <line x1="48" y1="30" x2="60" y2="30" stroke="#133654" strokeWidth="8" />
            <line x1="0" y1="30" x2="12" y2="30" stroke={isActive ? "#00f0ff" : "#051a2e"} strokeWidth="4" />
            <line x1="48" y1="30" x2="60" y2="30" stroke={isActive ? "#00f0ff" : "#051a2e"} strokeWidth="4" />
            <circle cx="30" cy="30" r="18" fill="#082035" stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="30" cy="30" r="5" fill={strokeColor} />
            <path d="M 30,25 Q 35,20 40,24 Q 35,27 30,25 Z" fill={strokeColor} opacity={isActive ? 0.9 : 0.4} />
            <path d="M 35,30 Q 40,35 36,40 Q 33,35 35,30 Z" fill={strokeColor} opacity={isActive ? 0.9 : 0.4} />
            <path d="M 30,35 Q 25,40 20,36 Q 25,33 30,35 Z" fill={strokeColor} opacity={isActive ? 0.9 : 0.4} />
            <path d="M 25,30 Q 20,25 24,20 Q 27,25 25,30 Z" fill={strokeColor} opacity={isActive ? 0.9 : 0.4} />
            <text x="30" y="44" fontSize="7" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">PUMP</text>
          </>
        );
        break;
      case 'valve':
        const isOpen = component.value === 1;
        svgContent = (
          <>
            <rect x="0" y="0" width="60" height="60" fill={bg} />
            <line x1="0" y1="30" x2="60" y2="30" stroke="#133654" strokeWidth="8" />
            <line x1="0" y1="30" x2="60" y2="30" stroke={isOpen ? "#00f0ff" : "#051a2e"} strokeWidth="4" />
            <polygon points="18,18 42,42 18,42 42,18" fill="#082035" stroke={strokeColor} strokeWidth="2" />
            <line x1="30" y1="18" x2="30" y2="6" stroke={strokeColor} strokeWidth="3" />
            <ellipse cx="30" cy="6" rx="10" ry="3" fill="#082035" stroke={strokeColor} strokeWidth="2" />
            {!isOpen && (
              <line x1="30" y1="20" x2="30" y2="40" stroke="#ff003c" strokeWidth="4" strokeLinecap="round" />
            )}
          </>
        );
        break;
      case 'constriction':
        svgContent = (
          <>
            <rect x="0" y="0" width="60" height="60" fill={bg} />
            <path 
              d="M 0,18 L 15,18 L 25,26 L 35,26 L 45,18 L 60,18 L 60,42 L 45,42 L 35,34 L 25,34 L 15,42 L 0,42 Z" 
              fill="#082035" 
              stroke={strokeColor} 
              strokeWidth="2" 
            />
            <path 
              d="M 0,30 L 60,30" 
              stroke={isActive ? "#00f0ff" : "#051a2e"} 
              strokeWidth={isActive ? 3 : 1} 
            />
            <line x1="30" y1="16" x2="30" y2="24" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="30,24 28,21 32,21" fill={strokeColor} />
            <line x1="30" y1="44" x2="30" y2="36" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="30,36 28,39 32,39" fill={strokeColor} />
          </>
        );
        break;
      case 'flowmeter':
        svgContent = (
          <>
            <rect x="0" y="0" width="60" height="60" fill={bg} />
            <line x1="0" y1="30" x2="14" y2="30" stroke="#133654" strokeWidth="8" />
            <line x1="46" y1="30" x2="60" y2="30" stroke="#133654" strokeWidth="8" />
            <line x1="0" y1="30" x2="14" y2="30" stroke={isActive ? "#00f0ff" : "#051a2e"} strokeWidth="4" />
            <line x1="46" y1="30" x2="60" y2="30" stroke={isActive ? "#00f0ff" : "#051a2e"} strokeWidth="4" />
            <circle cx="30" cy="30" r="16" fill="#082035" stroke={strokeColor} strokeWidth="2" />
            <circle cx="30" cy="30" r="4" fill={strokeColor} />
            <line x1="30" y1="18" x2="30" y2="42" stroke={strokeColor} strokeWidth="2" />
            <line x1="18" y1="30" x2="42" y2="30" stroke={strokeColor} strokeWidth="2" />
            <text x="30" y="44" fontSize="7" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">L/s</text>
          </>
        );
        break;
      case 'manometer':
        svgContent = (
          <>
            <rect x="0" y="0" width="60" height="60" fill={bg} />
            <line x1="0" y1="30" x2="14" y2="30" stroke="#133654" strokeWidth="4" />
            <line x1="46" y1="30" x2="60" y2="30" stroke="#133654" strokeWidth="4" />
            <circle cx="30" cy="30" r="16" fill="#082035" stroke={strokeColor} strokeWidth="2" />
            <path d="M 20,34 A 12 12 0 1 1 40,34" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="2 3" />
            <line x1="30" y1="30" x2="38" y2="22" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="30" cy="30" r="3" fill="#00f0ff" />
            <text x="30" y="43" fontSize="7" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">bar</text>
          </>
        );
        break;
      default:
        break;
    }
  }

  if (!svgContent) {
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
    case 'Ohmmeter':
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="30" cy="30" r="15" fill={bg} stroke={strokeColor} strokeWidth="2" />
          <text x="30" y="36" fontSize="16" fontFamily="sans-serif" fontWeight="bold" fill={strokeColor} textAnchor="middle">Ω</text>
        </>
      );
      break;
    case 'Lamp':
      const isLit = component.current > 0;
      const lampColor = isLit ? "#ffbb00" : "rgba(255, 255, 255, 0.5)";
      if (isLit) {
        glow = `drop-shadow(0 0 16px rgba(255, 187, 0, 0.8))`;
      }
      svgContent = (
        <>
          <rect x="0" y="0" width="60" height="60" fill={bg} />
          {/* Wire leads */}
          <line x1="0" y1="30" x2="15" y2="30" stroke={strokeColor} strokeWidth="2" />
          <line x1="45" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="2" />
          {/* Bulb Circle */}
          <circle 
            cx="30" 
            cy="30" 
            r="15" 
            fill={isLit ? "rgba(255, 187, 0, 0.2)" : bg} 
            stroke={lampColor} 
            strokeWidth="2" 
          />
          {/* Filament cross lines */}
          <line x1="19.4" y1="19.4" x2="40.6" y2="40.6" stroke={lampColor} strokeWidth="2" />
          <line x1="19.4" y1="40.6" x2="40.6" y2="19.4" stroke={lampColor} strokeWidth="2" />
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
