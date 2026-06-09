export type ComponentType = 'Battery' | 'Resistor' | 'Switch' | 'LED' | 'Wire' | 'TransistorNPN' | 'Motor' | 'Ammeter' | 'Voltmeter';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  name: string;
  value: number; // e.g., Volts for Battery, Ohms for Resistor, 1/0 for Switch
  current: number; // Calculated Amps flowing through
  voltageDrop: number; // Calculated Volts dropped across
  metadata?: Record<string, any>; // For UI specific things like coordinates, color, etc.
}

export interface CircuitModel {
  id: string;
  name: string;
  description: string;
  components: CircuitComponent[];
  wirePaths: { from: string; to: string; currentSourceId: string; path?: {x: number, y: number}[] }[];
  // The update function takes the current state of components (like if a switch was toggled or slider moved)
  // and recalculates current and voltage drops.
  update: (components: CircuitComponent[]) => CircuitComponent[];
}
