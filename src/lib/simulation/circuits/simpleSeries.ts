import { CircuitModel } from '../types';

export const simpleSeriesCircuit: CircuitModel = {
  id: 'simple-series',
  name: 'Simple Series Circuit',
  description: 'A basic series circuit to demonstrate Ohm\'s Law. Watch how changing the resistance or voltage affects the current and the brightness of the LED.',
  sqaNotes: 'In SQA National 5 Physics, a series circuit has only one path for the current to flow. The current is the same at all points (I = I1 = I2). The supply voltage is shared between the components (Vs = V1 + V2). Use this simulator to verify Ohm\'s Law (V=IR) by changing the voltage and seeing the current respond.',
  components: [
    {
      id: 'bat1',
      type: 'Battery',
      name: 'Power Source',
      value: 9,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 1, y: 2, orientation: 'vertical', adjustable: true, min: 0, max: 24, step: 1, unit: 'V' }
    },
    {
      id: 'sw1',
      type: 'Switch',
      name: 'Main Switch',
      value: 0, // 0 = open, 1 = closed
      current: 0,
      voltageDrop: 0,
      metadata: { x: 2, y: 1, orientation: 'horizontal' }
    },
    {
      id: 'res1',
      type: 'Resistor',
      name: 'Variable Resistor',
      value: 330, // Ohms
      current: 0,
      voltageDrop: 0,
      metadata: { x: 3, y: 2, orientation: 'vertical', adjustable: true, min: 10, max: 2000, step: 10, unit: 'Ω' }
    },
    {
      id: 'led1',
      type: 'LED',
      name: 'Red LED',
      value: 2, // forward voltage drop approx 2V
      current: 0,
      voltageDrop: 0,
      metadata: { x: 2, y: 3, orientation: 'horizontal', color: 'red' }
    }
  ],
  wirePaths: [
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{x: 1, y: 2}, {x: 1, y: 1}, {x: 2, y: 1}] },
    { from: 'sw1', to: 'res1', currentSourceId: 'bat1', path: [{x: 2, y: 1}, {x: 3, y: 1}, {x: 3, y: 2}] },
    { from: 'res1', to: 'led1', currentSourceId: 'bat1', path: [{x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3}] },
    { from: 'led1', to: 'bat1', currentSourceId: 'bat1', path: [{x: 2, y: 3}, {x: 1, y: 3}, {x: 1, y: 2}] }
  ],
  update: (components) => {
    const battery = components.find(c => c.id === 'bat1')!;
    const sw = components.find(c => c.id === 'sw1')!;
    const resistor = components.find(c => c.id === 'res1')!;
    const led = components.find(c => c.id === 'led1')!;

    let current = 0;
    
    if (sw.value === 1) {
      const netVoltage = Math.max(0, battery.value - led.value);
      // resistor.value has min: 10, so it will never be 0.
      current = netVoltage / resistor.value;
    }

    return components.map(c => {
      if (c.id === 'bat1') return { ...c, current, voltageDrop: battery.value };
      if (c.id === 'sw1') return { ...c, current, voltageDrop: sw.value === 0 ? battery.value : 0 };
      if (c.id === 'res1') return { ...c, current, voltageDrop: current * resistor.value };
      if (c.id === 'led1') return { ...c, current, voltageDrop: current > 0 ? led.value : 0 };
      return c;
    });
  }
};
