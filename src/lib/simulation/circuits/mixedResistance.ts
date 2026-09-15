import { CircuitModel, CircuitComponent } from '../types';

export const mixedResistanceCircuit: CircuitModel = {
  id: 'mixed-resistance-calc',
  name: 'Mixed Series & Parallel Resistance',
  description: 'Work out the total equivalent resistance of a series resistor combined with a parallel pair. Click the switch to turn on electricity!',
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

Adjust any slider to see how changing branch values affects the overall circuit ohms, then click the switch to turn on electricity and watch the current flow!`,
  metadata: {
    resistanceOnly: true,
    calculateTotalResistance: (comps: CircuitComponent[]) => {
      const r1 = comps.find(c => c.id === 'res1')?.value || 0;
      const r2 = comps.find(c => c.id === 'res2')?.value || 1;
      const r3 = comps.find(c => c.id === 'res3')?.value || 1;
      return r1 + (r2 * r3) / (r2 + r3);
    }
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
      id: 'bat1', 
      type: 'Battery', 
      name: 'Power Supply', 
      value: 24, 
      current: 0, 
      voltageDrop: 24, 
      metadata: { x: 4, y: 6, orientation: 'horizontal', adjustable: true, min: 0, max: 48, step: 1, unit: 'V', labelPos: 'bottom' } 
    },
    { 
      id: 'sw1', 
      type: 'Switch', 
      name: 'Main Switch', 
      value: 0, 
      current: 0, 
      voltageDrop: 24, 
      metadata: { x: 8, y: 6, orientation: 'horizontal', labelPos: 'bottom' } 
    },
  ],
  wirePaths: [
    // Bottom rail from Battery through left to Resistor 1
    { from: 'bat1', to: 'res1', currentSourceId: 'bat1', path: [{ x: 4, y: 6 }, { x: 2, y: 6 }, { x: 2, y: 3 }, { x: 4, y: 3 }] },
    
    // Split into Parallel Resistor 2 & 3
    { from: 'res1', to: 'res2', currentSourceId: 'res2', path: [{ x: 4, y: 3 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 8, y: 2 }] },
    { from: 'res1', to: 'res3', currentSourceId: 'res3', path: [{ x: 6, y: 3 }, { x: 6, y: 4 }, { x: 8, y: 4 }] },
    
    // Rejoin parallel branches and route down to Switch
    { from: 'res2', to: 'sw1', currentSourceId: 'res2', path: [{ x: 8, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 3 }] },
    { from: 'res3', to: 'sw1', currentSourceId: 'res3', path: [{ x: 8, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 3 }] },
    { from: 'res2', to: 'sw1', currentSourceId: 'bat1', path: [{ x: 10, y: 3 }, { x: 12, y: 3 }, { x: 12, y: 6 }, { x: 8, y: 6 }] },
    
    // Switch back to Battery
    { from: 'sw1', to: 'bat1', currentSourceId: 'bat1', path: [{ x: 8, y: 6 }, { x: 4, y: 6 }] },
  ],
  update: (components) => {
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;
    const r3 = components.find(c => c.id === 'res3')!;
    const bat = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;

    const isClosed = sw.value === 1;

    // Parallel pair: Rp = (R2 * R3) / (R2 + R3)
    const r2Val = r2.value || 1;
    const r3Val = r3.value || 1;
    const rp = (r2Val * r3Val) / (r2Val + r3Val);
    
    // Total series: R_total = R1 + Rp
    const rTotal = (r1.value || 0) + rp;

    const iTotal = isClosed ? bat.value / rTotal : 0;
    const v1 = isClosed ? iTotal * (r1.value || 0) : 0;
    const vp = isClosed ? iTotal * rp : 0;
    
    const i2 = isClosed ? vp / r2Val : 0;
    const i3 = isClosed ? vp / r3Val : 0;

    return components.map(c => {
      switch (c.id) {
        case 'bat1':
          return { ...c, current: iTotal, voltageDrop: bat.value };
        case 'sw1':
          return { ...c, current: iTotal, voltageDrop: isClosed ? 0 : bat.value };
        case 'res1':
          return { ...c, current: iTotal, voltageDrop: v1 };
        case 'res2':
          return { ...c, current: i2, voltageDrop: vp };
        case 'res3':
          return { ...c, current: i3, voltageDrop: vp };
        default:
          return c;
      }
    });
  }
};
