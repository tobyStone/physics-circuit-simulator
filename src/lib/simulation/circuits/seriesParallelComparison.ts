import { CircuitModel } from '../types';

export const seriesParallelComparison: CircuitModel = {
  id: 'series-parallel-comparison',
  name: 'Series & Parallel Rules',
  description: 'A circuit designed to demonstrate the fundamental rules of voltage and current in series and parallel. Notice how current splits in parallel, but voltage drops are equal!',
  sqaNotes: 'In a series circuit: I_total = I_1 = I_2, and V_supply = V_1 + V_2.\nIn a parallel circuit: I_total = I_1 + I_2, and V_supply = V_1 = V_2.\nUse the voltmeters and ammeters to observe these rules in action by tweaking the variable resistors.',
  components: [
    { id: 'bat1', type: 'Battery', name: 'Power Supply', value: 24, current: 0, voltageDrop: 24, metadata: { x: 1, y: 3, orientation: 'vertical', adjustable: true, min: 0, max: 48, step: 1, unit: 'V' } },
    { id: 'am_tot', type: 'Ammeter', name: 'Total Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 3, y: 1, orientation: 'horizontal' } },
    { id: 'res_s', type: 'Resistor', name: 'Series Resistor', value: 4, current: 0, voltageDrop: 0, metadata: { x: 5, y: 1, orientation: 'horizontal', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω' } },
    { id: 'vol_s', type: 'Voltmeter', name: 'Series Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 5, y: 0, orientation: 'horizontal' } },
    
    { id: 'am_p1', type: 'Ammeter', name: 'Branch 1 Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 7, y: 2, orientation: 'vertical' } },
    { id: 'res_p1', type: 'Resistor', name: 'Parallel Resistor 1', value: 10, current: 0, voltageDrop: 0, metadata: { x: 7, y: 4, orientation: 'vertical', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω' } },
    { id: 'vol_p1', type: 'Voltmeter', name: 'Branch 1 Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 6, y: 4, orientation: 'vertical', labelPos: 'left' } },
    
    { id: 'am_p2', type: 'Ammeter', name: 'Branch 2 Ammeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 9, y: 2, orientation: 'vertical' } },
    { id: 'res_p2', type: 'Resistor', name: 'Parallel Resistor 2', value: 10, current: 0, voltageDrop: 0, metadata: { x: 9, y: 4, orientation: 'vertical', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω', labelPos: 'left' } },
    { id: 'vol_p2', type: 'Voltmeter', name: 'Branch 2 Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 10, y: 4, orientation: 'vertical' } },
  ],
  wirePaths: [
    // Main Series Loop
    { from: 'bat1', to: 'am_tot', currentSourceId: 'bat1', path: [{x: 1, y: 3}, {x: 1, y: 1}, {x: 3, y: 1}] },
    { from: 'am_tot', to: 'res_s', currentSourceId: 'bat1', path: [{x: 3, y: 1}, {x: 5, y: 1}] },
    { from: 'res_s', to: 'am_p1', currentSourceId: 'bat1', path: [{x: 5, y: 1}, {x: 7, y: 1}, {x: 7, y: 2}] },
    
    // Parallel Branch 1
    { from: 'am_p1', to: 'res_p1', currentSourceId: 'bat1', path: [{x: 7, y: 2}, {x: 7, y: 4}] },
    { from: 'res_p1', to: 'bat1', currentSourceId: 'bat1', path: [{x: 7, y: 4}, {x: 7, y: 6}, {x: 1, y: 6}, {x: 1, y: 3}] },
    
    // Parallel Branch 2
    { from: 'res_s', to: 'am_p2', currentSourceId: 'bat1', path: [{x: 7, y: 1}, {x: 9, y: 1}, {x: 9, y: 2}] },
    { from: 'am_p2', to: 'res_p2', currentSourceId: 'bat1', path: [{x: 9, y: 2}, {x: 9, y: 4}] },
    { from: 'res_p2', to: 'res_p1', currentSourceId: 'bat1', path: [{x: 9, y: 4}, {x: 9, y: 6}, {x: 7, y: 6}] },
    
    // Voltmeters
    // Series Voltmeter
    { from: 'res_s', to: 'vol_s', currentSourceId: 'vol_s', path: [{x: 4, y: 1}, {x: 4, y: 0}, {x: 5, y: 0}] },
    { from: 'vol_s', to: 'res_s', currentSourceId: 'vol_s', path: [{x: 5, y: 0}, {x: 6, y: 0}, {x: 6, y: 1}] },
    
    // Parallel Voltmeter 1
    { from: 'res_p1', to: 'vol_p1', currentSourceId: 'vol_p1', path: [{x: 7, y: 3}, {x: 6, y: 3}, {x: 6, y: 4}] },
    { from: 'vol_p1', to: 'res_p1', currentSourceId: 'vol_p1', path: [{x: 6, y: 4}, {x: 6, y: 5}, {x: 7, y: 5}] },
    
    // Parallel Voltmeter 2
    { from: 'res_p2', to: 'vol_p2', currentSourceId: 'vol_p2', path: [{x: 9, y: 3}, {x: 10, y: 3}, {x: 10, y: 4}] },
    { from: 'vol_p2', to: 'res_p2', currentSourceId: 'vol_p2', path: [{x: 10, y: 4}, {x: 10, y: 5}, {x: 9, y: 5}] },
  ],
  update: (components) => {
    const bat = components.find(c => c.id === 'bat1')!;
    const rs = components.find(c => c.id === 'res_s')!;
    const rp1 = components.find(c => c.id === 'res_p1')!;
    const rp2 = components.find(c => c.id === 'res_p2')!;

    // Parallel resistance: 1/Rp = 1/R1 + 1/R2
    const rp = (rp1.value * rp2.value) / (rp1.value + rp2.value);
    const rTotal = rs.value + rp;
    
    const iTotal = bat.value / rTotal;
    
    const vs = iTotal * rs.value;
    const vp = iTotal * rp; // Voltage across parallel branch
    
    const ip1 = vp / rp1.value;
    const ip2 = vp / rp2.value;

    return components.map(c => {
      switch(c.id) {
        case 'bat1': return { ...c, current: iTotal, voltageDrop: bat.value };
        case 'am_tot': return { ...c, current: iTotal, voltageDrop: 0 };
        case 'res_s': return { ...c, current: iTotal, voltageDrop: vs };
        case 'vol_s': return { ...c, current: 0, voltageDrop: vs };
        case 'am_p1': return { ...c, current: ip1, voltageDrop: 0 };
        case 'res_p1': return { ...c, current: ip1, voltageDrop: vp };
        case 'vol_p1': return { ...c, current: 0, voltageDrop: vp };
        case 'am_p2': return { ...c, current: ip2, voltageDrop: 0 };
        case 'res_p2': return { ...c, current: ip2, voltageDrop: vp };
        case 'vol_p2': return { ...c, current: 0, voltageDrop: vp };
        default: return c;
      }
    });
  }
};
