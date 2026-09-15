import { CircuitModel } from '../types';

export const mixedResistanceCircuit: CircuitModel = {
  id: 'mixed-resistance-calc',
  name: 'Mixed Series & Parallel Resistance',
  description: 'Work out the total equivalent resistance of a series resistor combined with a parallel pair.',
  sqaNotes: `Finding Total Resistance of a Mixed (Series + Parallel) Network:

Step 1: Calculate the equivalent resistance of the parallel combination (R_parallel):
1 / R_p = 1 / R_2 + 1 / R_3
R_p = (R_2 * R_3) / (R_2 + R_3)

With default values (50 Ω and 50 Ω in parallel):
R_p = (50 * 50) / (50 + 50) = 2500 / 100 = 25 Ω

Step 2: Add the series resistor (R_1):
R_total = R_1 + R_p
R_total = 50 Ω + 25 Ω = 75 Ω

Key SQA National 5 Rule:
Always simplify parallel branches into a single equivalent resistance first, then treat the combination as a standard series circuit!

Adjust any slider to see how changing branch values affects the overall circuit ohms.`,
  metadata: {
    resistanceOnly: true
  },
  components: [
    { 
      id: 'res1', 
      type: 'Resistor', 
      name: 'Series Resistor 1 (50Ω)', 
      value: 50, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 4, y: 3, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res2', 
      type: 'Resistor', 
      name: 'Parallel Resistor 2 (50Ω)', 
      value: 50, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 8, y: 2, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res3', 
      type: 'Resistor', 
      name: 'Parallel Resistor 3 (50Ω)', 
      value: 50, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 8, y: 4, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'bottom', resistanceOnly: true } 
    },
    { 
      id: 'r_total', 
      type: 'Ohmmeter', 
      name: 'Total Resistance (Ohmmeter)', 
      value: 75, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 7, y: 5.5, orientation: 'horizontal', labelPos: 'bottom', resistanceOnly: true } 
    },
  ],
  wirePaths: [
    // Main combination path
    { from: 'r_total', to: 'res1', currentSourceId: 'r_total', path: [{ x: 7, y: 5.5 }, { x: 2, y: 5.5 }, { x: 2, y: 3 }, { x: 4, y: 3 }] },
    { from: 'res1', to: 'res2', currentSourceId: 'r_total', path: [{ x: 4, y: 3 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 8, y: 2 }] },
    { from: 'res1', to: 'res3', currentSourceId: 'r_total', path: [{ x: 6, y: 3 }, { x: 6, y: 4 }, { x: 8, y: 4 }] },
    { from: 'res2', to: 'r_total', currentSourceId: 'r_total', path: [{ x: 8, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 12, y: 3 }, { x: 12, y: 5.5 }, { x: 7, y: 5.5 }] },
    { from: 'res3', to: 'r_total', currentSourceId: 'r_total', path: [{ x: 8, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 3 }] },
  ],
  update: (components) => {
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;
    const r3 = components.find(c => c.id === 'res3')!;

    // Parallel pair: Rp = (R2 * R3) / (R2 + R3)
    const r2Val = r2.value || 1;
    const r3Val = r3.value || 1;
    const rp = (r2Val * r3Val) / (r2Val + r3Val);
    
    // Total series: R_total = R1 + Rp
    const rTotal = (r1.value || 0) + rp;

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
