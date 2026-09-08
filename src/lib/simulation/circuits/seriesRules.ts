import { CircuitModel } from '../types';

export const seriesRulesCircuit: CircuitModel = {
  id: 'series-rules',
  name: 'Series Circuit Rules',
  description: 'A dedicated series circuit to observe how current and voltage behave when there is only one continuous loop.',
  sqaNotes: 'In a series circuit:\n1. The current is the SAME everywhere! Look at the three ammeters.\n2. The supply voltage is SHARED among components (V_total = V_1 + V_2).\nUse the sliders to change resistance and watch how the voltage distributes proportionally.',
  components: [
    { id: 'bat1', type: 'Battery', name: 'Power Supply', value: 24, current: 0, voltageDrop: 24, metadata: { x: 3, y: 3, orientation: 'vertical', adjustable: true, min: 0, max: 48, step: 1, unit: 'V' } },
    { id: 'vol_tot', type: 'Voltmeter', name: 'Total Supply Voltmeter', value: 0, current: 0, voltageDrop: 0, metadata: { x: 2, y: 3, orientation: 'vertical', labelPos: 'left' } },
    
    { id: 'sw1', type: 'Switch', name: 'Main Switch', value: 1, current: 0, voltageDrop: 0, metadata: { x: 4, y: 1, orientation: 'horizontal' } },
    
    { id: 'am1', type: 'Ammeter', name: 'Ammeter 1', value: 0, current: 0, voltageDrop: 0, metadata: { x: 6, y: 1, orientation: 'horizontal', labelPos: 'top' } },
    { id: 'res1', type: 'Resistor', name: 'Resistor 1', value: 8, current: 0, voltageDrop: 0, metadata: { x: 8, y: 1, orientation: 'horizontal', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω', labelPos: 'bottom' } },
    { id: 'vol1', type: 'Voltmeter', name: 'Voltmeter 1', value: 0, current: 0, voltageDrop: 0, metadata: { x: 8, y: 0, orientation: 'horizontal', labelPos: 'top' } },
    
    { id: 'am2', type: 'Ammeter', name: 'Ammeter 2', value: 0, current: 0, voltageDrop: 0, metadata: { x: 10, y: 2, orientation: 'vertical' } },
    { id: 'res2', type: 'Resistor', name: 'Resistor 2', value: 16, current: 0, voltageDrop: 0, metadata: { x: 10, y: 4, orientation: 'vertical', adjustable: true, min: 1, max: 50, step: 1, unit: 'Ω', labelPos: 'left' } },
    { id: 'vol2', type: 'Voltmeter', name: 'Voltmeter 2', value: 0, current: 0, voltageDrop: 0, metadata: { x: 11, y: 4, orientation: 'vertical' } },
    
    { id: 'am3', type: 'Ammeter', name: 'Ammeter 3', value: 0, current: 0, voltageDrop: 0, metadata: { x: 7, y: 5, orientation: 'horizontal', labelPos: 'bottom' } },
  ],
  wirePaths: [
    // Main Series Loop
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{x: 3, y: 3}, {x: 3, y: 1}, {x: 4, y: 1}] },
    { from: 'sw1', to: 'am1', currentSourceId: 'bat1', path: [{x: 4, y: 1}, {x: 6, y: 1}] },
    { from: 'am1', to: 'res1', currentSourceId: 'bat1', path: [{x: 6, y: 1}, {x: 8, y: 1}] },
    { from: 'res1', to: 'am2', currentSourceId: 'bat1', path: [{x: 8, y: 1}, {x: 10, y: 1}, {x: 10, y: 2}] },
    { from: 'am2', to: 'res2', currentSourceId: 'bat1', path: [{x: 10, y: 2}, {x: 10, y: 4}] },
    { from: 'res2', to: 'am3', currentSourceId: 'bat1', path: [{x: 10, y: 4}, {x: 10, y: 5}, {x: 7, y: 5}] },
    { from: 'am3', to: 'bat1', currentSourceId: 'bat1', path: [{x: 7, y: 5}, {x: 3, y: 5}, {x: 3, y: 3}] },
    
    // Voltmeters
    // Total Voltmeter across battery
    { from: 'bat1', to: 'vol_tot', currentSourceId: 'vol_tot', path: [{x: 3, y: 1}, {x: 2, y: 1}, {x: 2, y: 3}] },
    { from: 'vol_tot', to: 'bat1', currentSourceId: 'vol_tot', path: [{x: 2, y: 3}, {x: 2, y: 5}, {x: 3, y: 5}] },
    
    // Voltmeter 1 across Resistor 1
    { from: 'res1', to: 'vol1', currentSourceId: 'vol1', path: [{x: 7, y: 1}, {x: 7, y: 0}, {x: 8, y: 0}] },
    { from: 'vol1', to: 'res1', currentSourceId: 'vol1', path: [{x: 8, y: 0}, {x: 9, y: 0}, {x: 9, y: 1}] },
    
    // Voltmeter 2 across Resistor 2
    { from: 'res2', to: 'vol2', currentSourceId: 'vol2', path: [{x: 10, y: 3}, {x: 11, y: 3}, {x: 11, y: 4}] },
    { from: 'vol2', to: 'res2', currentSourceId: 'vol2', path: [{x: 11, y: 4}, {x: 11, y: 5}, {x: 10, y: 5}] },
  ],
  update: (components) => {
    const bat = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;
    const r1 = components.find(c => c.id === 'res1')!;
    const r2 = components.find(c => c.id === 'res2')!;

    const isClosed = sw.value === 1;
    const rTotal = r1.value + r2.value;
    const current = isClosed ? bat.value / rTotal : 0;
    
    const v1 = isClosed ? current * r1.value : 0;
    const v2 = isClosed ? current * r2.value : 0;
    const vSw = isClosed ? 0 : bat.value;

    return components.map(c => {
      switch(c.id) {
        case 'bat1': return { ...c, current: current, voltageDrop: bat.value };
        case 'vol_tot': return { ...c, current: 0, voltageDrop: bat.value };
        case 'sw1': return { ...c, current: current, voltageDrop: vSw };
        case 'am1': 
        case 'am2': 
        case 'am3': return { ...c, current: current, voltageDrop: 0 };
        case 'res1': return { ...c, current: current, voltageDrop: v1 };
        case 'vol1': return { ...c, current: 0, voltageDrop: v1 };
        case 'res2': return { ...c, current: current, voltageDrop: v2 };
        case 'vol2': return { ...c, current: 0, voltageDrop: v2 };
        default: return c;
      }
    });
  }
};
