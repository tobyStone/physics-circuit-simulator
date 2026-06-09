import { CircuitModel } from '../types';

export const simpleParallelCircuit: CircuitModel = {
  id: 'simple-parallel',
  name: 'Parallel Circuit (Exam Example)',
  description: 'A parallel circuit with a resistor and a motor on separate branches, complete with ammeters and voltmeters.',
  components: [
    {
      id: 'bat1',
      type: 'Battery',
      name: 'Power Source',
      value: 12.0,
      current: 0,
      voltageDrop: 0,
      metadata: { adjustable: true, min: 0, max: 24, step: 0.1, x: 1, y: 2.5, orientation: 'vertical' }
    },
    {
      id: 'res1',
      type: 'Resistor',
      name: 'Resistor (8Ω)',
      value: 8,
      current: 0,
      voltageDrop: 0,
      metadata: { adjustable: false, x: 3, y: 2, orientation: 'vertical' }
    },
    {
      id: 'am1',
      type: 'Ammeter',
      name: 'Ammeter 1',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 3, y: 3.25, orientation: 'vertical' }
    },
    {
      id: 'vol1',
      type: 'Voltmeter',
      name: 'Voltmeter 1',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 4, y: 2, orientation: 'vertical' }
    },
    {
      id: 'mot1',
      type: 'Motor',
      name: 'Motor (24Ω)',
      value: 24,
      current: 0,
      voltageDrop: 0,
      metadata: { adjustable: false, x: 6, y: 2, orientation: 'vertical' }
    },
    {
      id: 'am2',
      type: 'Ammeter',
      name: 'Ammeter 2',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 6, y: 3.25, orientation: 'vertical' }
    },
    {
      id: 'vol2',
      type: 'Voltmeter',
      name: 'Voltmeter 2',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 7, y: 2, orientation: 'vertical' }
    }
  ],
  wirePaths: [
    // Battery left rail
    { path: [{ x: 1, y: 1 }, { x: 1, y: 4 }], currentSourceId: 'bat1' },
    // Top rail (before split)
    { path: [{ x: 1, y: 1 }, { x: 3, y: 1 }], currentSourceId: 'bat1' },
    // Top rail (after split to branch 2)
    { path: [{ x: 3, y: 1 }, { x: 6, y: 1 }], currentSourceId: 'mot1' },
    // Bottom rail (after branch 2 joins back to main)
    { path: [{ x: 6, y: 4 }, { x: 3, y: 4 }], currentSourceId: 'mot1' },
    // Bottom rail (returning to battery)
    { path: [{ x: 3, y: 4 }, { x: 1, y: 4 }], currentSourceId: 'bat1' },
    
    // Branch 1 (Resistor + Ammeter)
    { path: [{ x: 3, y: 1 }, { x: 3, y: 4 }], currentSourceId: 'res1' },
    
    // Voltmeter 1 parallel wiring
    { path: [{ x: 3, y: 1.5 }, { x: 4, y: 1.5 }], currentSourceId: 'vol1' },
    { path: [{ x: 4, y: 1.5 }, { x: 4, y: 2.5 }], currentSourceId: 'vol1' },
    { path: [{ x: 4, y: 2.5 }, { x: 3, y: 2.5 }], currentSourceId: 'vol1' },

    // Branch 2 (Motor + Ammeter)
    { path: [{ x: 6, y: 1 }, { x: 6, y: 4 }], currentSourceId: 'mot1' },

    // Voltmeter 2 parallel wiring
    { path: [{ x: 6, y: 1.5 }, { x: 7, y: 1.5 }], currentSourceId: 'vol2' },
    { path: [{ x: 7, y: 1.5 }, { x: 7, y: 2.5 }], currentSourceId: 'vol2' },
    { path: [{ x: 7, y: 2.5 }, { x: 6, y: 2.5 }], currentSourceId: 'vol2' }
  ],
  
  tick: (components) => {
    const battery = components.find(c => c.id === 'bat1');
    const res1 = components.find(c => c.id === 'res1');
    const mot1 = components.find(c => c.id === 'mot1');
    const am1 = components.find(c => c.id === 'am1');
    const am2 = components.find(c => c.id === 'am2');
    const vol1 = components.find(c => c.id === 'vol1');
    const vol2 = components.find(c => c.id === 'vol2');

    if (!battery || !res1 || !mot1) return components;

    const netVoltage = battery.value; // ideal battery, no internal resistance for simplicity

    // Ohm's law for parallel branches
    const current1 = netVoltage / res1.value;
    const current2 = netVoltage / mot1.value;
    const totalCurrent = current1 + current2;

    return components.map(c => {
      switch (c.id) {
        case 'bat1':
          return { ...c, current: totalCurrent, voltageDrop: netVoltage }; // battery supplies total current
        case 'res1':
          return { ...c, current: current1, voltageDrop: netVoltage }; // full voltage drops across the resistor
        case 'mot1':
          return { ...c, current: current2, voltageDrop: netVoltage }; // full voltage drops across the motor
        case 'am1':
          return { ...c, current: current1, voltageDrop: 0 }; // ideal ammeter has 0 voltage drop
        case 'am2':
          return { ...c, current: current2, voltageDrop: 0 }; 
        case 'vol1':
          return { ...c, current: 0, voltageDrop: netVoltage }; // ideal voltmeter draws 0 current
        case 'vol2':
          return { ...c, current: 0, voltageDrop: netVoltage };
        default:
          return c;
      }
    });
  }
};
