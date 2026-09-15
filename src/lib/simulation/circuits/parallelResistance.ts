import { CircuitModel, CircuitComponent } from '../types';

export const parallelResistanceCircuit: CircuitModel = {
  id: 'parallel-resistance-calc',
  name: 'Parallel Resistance (3 Resistors)',
  description: 'Work out the total equivalent resistance of 3 resistors in parallel. Click the switch to turn on electricity and watch current split!',
  sqaNotes: `Finding Total Resistance in Parallel (3 Resistors):

Formula:
1 / R_T = 1 / R_1 + 1 / R_2 + 1 / R_3

Using the initial values (20 Ω, 20 Ω, 10 Ω):
1 / R_T = 1/20 + 1/20 + 1/10
1 / R_T = 1/20 + 1/20 + 2/20 = 4/20 = 1/5
R_T = 5 Ω

Key SQA National 5 Rule:
The total resistance of any parallel network is ALWAYS less than the smallest individual resistor (here, 5 Ω is less than 10 Ω)!

Adjust any resistor slider to see the overall ohms update in the top-right card, then click the switch to turn on electricity!`,
  metadata: {
    resistanceOnly: true,
    calculateTotalResistance: (comps: CircuitComponent[]) => {
      const r1 = comps.find(c => c.id === 'res1')?.value || 1;
      const r2 = comps.find(c => c.id === 'res2')?.value || 1;
      const r3 = comps.find(c => c.id === 'res3')?.value || 1;
      const invTotal = (1 / r1) + (1 / r2) + (1 / r3);
      return 1 / (invTotal || 1);
    }
  },
  components: [
    { 
      id: 'res1', 
      type: 'Resistor', 
      name: 'Resistor 1 (20Ω)', 
      value: 20, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 7, y: 2, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res2', 
      type: 'Resistor', 
      name: 'Resistor 2 (20Ω)', 
      value: 20, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 7, y: 4, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'top', resistanceOnly: true } 
    },
    { 
      id: 'res3', 
      type: 'Resistor', 
      name: 'Resistor 3 (10Ω)', 
      value: 10, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 7, y: 6, orientation: 'horizontal', adjustable: true, min: 1, max: 100, step: 1, unit: 'Ω', labelPos: 'bottom', resistanceOnly: true } 
    },
    { 
      id: 'bat1', 
      type: 'Battery', 
      name: 'Power Supply', 
      value: 24, 
      current: 0, 
      voltageDrop: 24, 
      metadata: { x: 5, y: 8, orientation: 'horizontal', adjustable: true, min: 0, max: 48, step: 1, unit: 'V', labelPos: 'bottom' } 
    },
    { 
      id: 'sw1', 
      type: 'Switch', 
      name: 'Main Switch', 
      value: 0, 
      current: 0, 
      voltageDrop: 24, 
      metadata: { x: 9, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
  ],
  wirePaths: [
    // Branch 1 (top)
    { from: 'bat1', to: 'res1', currentSourceId: 'res1', path: [{ x: 4, y: 8 }, { x: 4, y: 2 }, { x: 7, y: 2 }] },
    { from: 'res1', to: 'sw1', currentSourceId: 'res1', path: [{ x: 7, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 8 }] },
    
    // Branch 2 (middle)
    { from: 'bat1', to: 'res2', currentSourceId: 'res2', path: [{ x: 4, y: 4 }, { x: 7, y: 4 }] },
    { from: 'res2', to: 'sw1', currentSourceId: 'res2', path: [{ x: 7, y: 4 }, { x: 10, y: 4 }] },
    
    // Branch 3 (bottom resistor)
    { from: 'bat1', to: 'res3', currentSourceId: 'res3', path: [{ x: 4, y: 6 }, { x: 7, y: 6 }] },
    { from: 'res3', to: 'sw1', currentSourceId: 'res3', path: [{ x: 7, y: 6 }, { x: 10, y: 6 }] },
    
    // Bottom power rail with Battery and Switch
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{ x: 5, y: 8 }, { x: 9, y: 8 }] },
    { from: 'sw1', to: 'bat1', currentSourceId: 'bat1', path: [{ x: 9, y: 8 }, { x: 10, y: 8 }, { x: 10, y: 8 }] },
    { from: 'bat1', to: 'bat1', currentSourceId: 'bat1', path: [{ x: 4, y: 8 }, { x: 5, y: 8 }] },
  ],
  update: (components) => {
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;
    const r3 = components.find(c => c.id === 'res3')!;
    const bat = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;

    const isClosed = sw.value === 1;

    // 1 / R_T = 1 / R1 + 1 / R2 + 1 / R3
    const r1Val = r1.value || 1;
    const r2Val = r2.value || 1;
    const r3Val = r3.value || 1;
    const invTotal = (1 / r1Val) + (1 / r2Val) + (1 / r3Val);
    const rTotal = 1 / (invTotal || 1);

    const iTotal = isClosed ? bat.value / rTotal : 0;
    const vBranch = isClosed ? bat.value : 0;
    
    const i1 = isClosed ? vBranch / r1Val : 0;
    const i2 = isClosed ? vBranch / r2Val : 0;
    const i3 = isClosed ? vBranch / r3Val : 0;

    return components.map(c => {
      switch (c.id) {
        case 'bat1':
          return { ...c, current: iTotal, voltageDrop: bat.value };
        case 'sw1':
          return { ...c, current: iTotal, voltageDrop: isClosed ? 0 : bat.value };
        case 'res1':
          return { ...c, current: i1, voltageDrop: vBranch };
        case 'res2':
          return { ...c, current: i2, voltageDrop: vBranch };
        case 'res3':
          return { ...c, current: i3, voltageDrop: vBranch };
        default:
          return c;
      }
    });
  }
};
