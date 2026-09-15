import { CircuitModel } from '../types';

export const parallelResistanceCircuit: CircuitModel = {
  id: 'parallel-resistance-calc',
  name: 'Parallel Resistance (3 Resistors)',
  description: 'Work out the total equivalent resistance of 3 resistors connected in parallel between terminals X and Y.',
  sqaNotes: `Finding Total Resistance in Parallel (3 Resistors):

Formula:
1 / R_T = 1 / R_1 + 1 / R_2 + 1 / R_3

Using the initial values (20 Ω, 20 Ω, 10 Ω):
1 / R_T = 1/20 + 1/20 + 1/10
1 / R_T = 1/20 + 1/20 + 2/20 = 4/20 = 1/5
R_T = 5 Ω

Key SQA National 5 Rule:
The total resistance of any parallel network is ALWAYS less than the smallest individual resistor (here, 5 Ω is less than 10 Ω)!

Try moving any slider to see how increasing or decreasing individual resistors changes the overall resistance.`,
  metadata: {
    resistanceOnly: true
  },
  components: [
    { 
      id: 'r_total', 
      type: 'Ohmmeter', 
      name: 'Total Resistance (Ohmmeter)', 
      value: 5, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 6, y: 0, orientation: 'horizontal', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res1', 
      type: 'Resistor', 
      name: 'Resistor 1 (20Ω)', 
      value: 20, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 6, y: 2, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res2', 
      type: 'Resistor', 
      name: 'Resistor 2 (20Ω)', 
      value: 20, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 6, y: 4, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res3', 
      type: 'Resistor', 
      name: 'Resistor 3 (10Ω)', 
      value: 10, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 6, y: 6, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'bottom', resistanceOnly: true } 
    },
  ],
  wirePaths: [
    // Ohmmeter connections
    { from: 'r_total', to: 'res1', currentSourceId: 'r_total', path: [{ x: 6, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 6, y: 2 }] },
    { from: 'r_total', to: 'res1', currentSourceId: 'r_total', path: [{ x: 6, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 2 }, { x: 6, y: 2 }] },
    
    // Left vertical rail connecting the 3 parallel branches
    { from: 'res1', to: 'res2', currentSourceId: 'r_total', path: [{ x: 4, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 4 }] },
    { from: 'res2', to: 'res3', currentSourceId: 'r_total', path: [{ x: 4, y: 4 }, { x: 4, y: 6 }, { x: 6, y: 6 }] },
    
    // Right vertical rail connecting the 3 parallel branches
    { from: 'res1', to: 'res2', currentSourceId: 'r_total', path: [{ x: 8, y: 2 }, { x: 8, y: 4 }, { x: 6, y: 4 }] },
    { from: 'res2', to: 'res3', currentSourceId: 'r_total', path: [{ x: 8, y: 4 }, { x: 8, y: 6 }, { x: 6, y: 6 }] },
  ],
  update: (components) => {
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;
    const r3 = components.find(c => c.id === 'res3')!;

    // 1 / R_T = 1 / R1 + 1 / R2 + 1 / R3
    const invTotal = (1 / (r1.value || 1)) + (1 / (r2.value || 1)) + (1 / (r3.value || 1));
    const rTotal = 1 / invTotal;

    return components.map(c => {
      switch (c.id) {
        case 'r_total':
          return { ...c, value: rTotal, current: 0, voltageDrop: 0 };
        case 'res1':
        case 'res2':
        case 'res3':
          return { ...c, current: 0, voltageDrop: 0 };
        default:
          return c;
      }
    });
  }
};
