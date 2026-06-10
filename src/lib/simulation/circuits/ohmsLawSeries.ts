import { CircuitModel } from '../types';

export const ohmsLawSeriesCircuit: CircuitModel = {
  id: 'ohms-law-series',
  name: "Ohm's Law Series Circuit",
  description: "The purest form of a series circuit with only a resistor. Use this to directly verify V = IR without any other voltage drops.",
  sqaNotes: "In this simple circuit, there is only one component (the resistor) connected across the power source. Because there are no other components to share the voltage, the voltage across the resistor is exactly equal to the supply voltage. This makes it perfect for directly verifying Ohm's Law: V = I × R.",
  components: [
    {
      id: 'bat1',
      type: 'Battery',
      name: 'Power Source',
      value: 12,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 1, y: 2, orientation: 'vertical', adjustable: true, min: 0, max: 24, step: 1, unit: 'V' }
    },
    {
      id: 'sw1',
      type: 'Switch',
      name: 'Main Switch',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 2, y: 1, orientation: 'horizontal' }
    },
    {
      id: 'res1',
      type: 'Resistor',
      name: 'Variable Resistor',
      value: 1000,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 3, y: 2, orientation: 'vertical', adjustable: true, min: 10, max: 2000, step: 10, unit: 'Ω' }
    },
    {
      id: 'am1',
      type: 'Ammeter',
      name: 'Ammeter',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 2, y: 3, orientation: 'horizontal' }
    }
  ],
  wirePaths: [
    { from: 'bat1_top', to: 'sw1_left', currentSourceId: 'bat1', path: [{x: 1, y: 2}, {x: 1, y: 1}, {x: 2, y: 1}] },
    { from: 'sw1_right', to: 'res1_top', currentSourceId: 'bat1', path: [{x: 2, y: 1}, {x: 3, y: 1}, {x: 3, y: 2}] },
    { from: 'res1_bot', to: 'am1_right', currentSourceId: 'bat1', path: [{x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3}] },
    { from: 'am1_left', to: 'bat1_bot', currentSourceId: 'bat1', path: [{x: 2, y: 3}, {x: 1, y: 3}, {x: 1, y: 2}] }
  ],
  update: (components) => {
    const battery = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;
    const resistor = components.find(c => c.id === 'res1')!;

    let current = 0;
    
    if (sw.value === 1) {
      current = battery.value / resistor.value;
    }

    return components.map(c => {
      if (c.id === 'bat1') return { ...c, current, voltageDrop: battery.value };
      if (c.id === 'sw1') return { ...c, current, voltageDrop: sw.value === 0 ? battery.value : 0 };
      if (c.id === 'res1') return { ...c, current, voltageDrop: current * resistor.value };
      if (c.id === 'am1') return { ...c, current, voltageDrop: 0 }; // Ideal ammeter has 0V drop
      return c;
    });
  }
};
