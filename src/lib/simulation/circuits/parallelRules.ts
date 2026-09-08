import { CircuitModel } from '../types';

export const parallelRulesCircuit: CircuitModel = {
  id: 'parallel-rules',
  name: 'Parallel Circuit Rules',
  description: 'A dedicated parallel circuit to clearly observe how current and voltage behave across multiple branches.',
  sqaNotes: 'In a parallel circuit:\n1. The voltage is the SAME across all branches (V_supply = V_1 = V_2). Look at the three voltmeters!\n2. The current SPLITS between the branches (I_total = I_1 + I_2).\nChange the resistors to see the total current change while the voltage remains perfectly constant.',
  components: [
    { id: 'bat1', type: 'Battery', name: 'Power Supply', value: 24, current: 0, voltageDrop: 24, metadata: { x: 3, y: 3, orientation: 'vertical', adjustable: true, min: 0, max: 48, step: 1, unit: 'V' } },
    { id: 'vol_tot', type: 'Voltmeter', name: 'Total Voltmeter', value: 0, current: 0, voltageDrop: 24, metadata: { x: 2, y: 3, orientation: 'vertical', labelPos: 'left' } },
    
    { id: 'sw1', type: 'Switch', name: 'Main Switch', value: 0, current: 0, voltageDrop: 24, metadata: { x: 5, y: 1, orientation: 'horizontal' } },
    { id: 'am_tot', type: 'Ammeter', name: 'Total Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 7, y: 1, orientation: 'horizontal', labelPos: 'top' } },
    
    { id: 'am1', type: 'Ammeter', name: 'Branch 1 Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 10, y: 2, orientation: 'vertical' } },
    { id: 'res1', type: 'Resistor', name: 'Branch 1 Resistor', value: 12, current: 0, voltageDrop: 0, metadata: { x: 10, y: 4, orientation: 'vertical', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω' } },
    { id: 'vol1', type: 'Voltmeter', name: 'Branch 1 Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 9, y: 4, orientation: 'vertical', labelPos: 'left' } },
    
    { id: 'am2', type: 'Ammeter', name: 'Branch 2 Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 13, y: 2, orientation: 'vertical' } },
    { id: 'res2', type: 'Resistor', name: 'Branch 2 Resistor', value: 24, current: 0, voltageDrop: 0, metadata: { x: 13, y: 4, orientation: 'vertical', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω', labelPos: 'left' } },
    { id: 'vol2', type: 'Voltmeter', name: 'Branch 2 Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 14, y: 4, orientation: 'vertical' } },
  ],
  wirePaths: [
    // Main paths
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{x: 3, y: 3}, {x: 3, y: 1}, {x: 5, y: 1}] },
    { from: 'sw1', to: 'am_tot', currentSourceId: 'bat1', path: [{x: 5, y: 1}, {x: 7, y: 1}] },
    { from: 'am_tot', to: 'am1', currentSourceId: 'bat1', path: [{x: 7, y: 1}, {x: 10, y: 1}, {x: 10, y: 2}] },
    { from: 'am1', to: 'res1', currentSourceId: 'bat1', path: [{x: 10, y: 2}, {x: 10, y: 4}] },
    { from: 'res1', to: 'bat1', currentSourceId: 'bat1', path: [{x: 10, y: 4}, {x: 10, y: 5}, {x: 3, y: 5}, {x: 3, y: 3}] },
    
    // Branch 2
    { from: 'am_tot', to: 'am2', currentSourceId: 'bat1', path: [{x: 10, y: 1}, {x: 13, y: 1}, {x: 13, y: 2}] },
    { from: 'am2', to: 'res2', currentSourceId: 'bat1', path: [{x: 13, y: 2}, {x: 13, y: 4}] },
    { from: 'res2', to: 'res1', currentSourceId: 'bat1', path: [{x: 13, y: 4}, {x: 13, y: 5}, {x: 10, y: 5}] },
    
    // Voltmeters
    { from: 'bat1', to: 'vol_tot', currentSourceId: 'vol_tot', path: [{x: 3, y: 1}, {x: 2, y: 1}, {x: 2, y: 3}] },
    { from: 'vol_tot', to: 'bat1', currentSourceId: 'vol_tot', path: [{x: 2, y: 3}, {x: 2, y: 5}, {x: 3, y: 5}] },
    
    { from: 'res1', to: 'vol1', currentSourceId: 'vol1', path: [{x: 10, y: 3}, {x: 9, y: 3}, {x: 9, y: 4}] },
    { from: 'vol1', to: 'res1', currentSourceId: 'vol1', path: [{x: 9, y: 4}, {x: 9, y: 5}, {x: 10, y: 5}] },
    
    { from: 'res2', to: 'vol2', currentSourceId: 'vol2', path: [{x: 13, y: 3}, {x: 14, y: 3}, {x: 14, y: 4}] },
    { from: 'vol2', to: 'res2', currentSourceId: 'vol2', path: [{x: 14, y: 4}, {x: 14, y: 5}, {x: 13, y: 5}] },
  ],
  update: (components) => {
    const bat = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;

    const isClosed = sw.value === 1;

    // Parallel resistance: 1/Rp = 1/R1 + 1/R2
    const rp = (r1.value * r2.value) / (r1.value + r2.value);
    
    const iTotal = isClosed ? bat.value / rp : 0;
    const vp = isClosed ? bat.value : 0;
    const vSw = isClosed ? 0 : bat.value;
    
    const i1 = isClosed ? vp / r1.value : 0;
    const i2 = isClosed ? vp / r2.value : 0;

    return components.map(c => {
      switch(c.id) {
        case 'bat1': return { ...c, current: iTotal, voltageDrop: bat.value };
        case 'vol_tot': return { ...c, current: 0, voltageDrop: bat.value };
        case 'sw1': return { ...c, current: iTotal, voltageDrop: vSw };
        case 'am_tot': return { ...c, current: iTotal, voltageDrop: 0 };
        case 'am1': return { ...c, current: i1, voltageDrop: 0 };
        case 'res1': return { ...c, current: i1, voltageDrop: vp };
        case 'vol1': return { ...c, current: 0, voltageDrop: vp };
        case 'am2': return { ...c, current: i2, voltageDrop: 0 };
        case 'res2': return { ...c, current: i2, voltageDrop: vp };
        case 'vol2': return { ...c, current: 0, voltageDrop: vp };
        default: return c;
      }
    });
  }
};
