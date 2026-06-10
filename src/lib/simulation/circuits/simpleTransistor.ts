import { CircuitModel } from '../types';

export const simpleTransistorCircuit: CircuitModel = {
  id: 'simple-transistor',
  name: 'Simple NPN Transistor Circuit',
  description: 'A circuit showing an NPN transistor acting as a switch. Apply enough voltage to the base to turn on the LED.',
  sqaNotes: 'In SQA National 5 Physics, an NPN transistor acts as an electronic switch. It turns on when the voltage across its base-emitter junction (Vbe) is greater than 0.7V. In this simulation, try adjusting the Base Control voltage or the Base Resistor to see the threshold where the transistor conducts and the LED lights up!',
  components: [
    {
      id: 'bat1',
      type: 'Battery',
      name: 'Main Power (Vcc)',
      value: 9,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 1, y: 3, orientation: 'vertical', adjustable: true, min: 0, max: 24, step: 1, unit: 'V' }
    },
    {
      id: 'bat2',
      type: 'Battery',
      name: 'Base Control (Vbb)',
      value: 0,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 2.5, y: 5.0, orientation: 'vertical', adjustable: true, min: 0, max: 5, step: 0.1, unit: 'V' }
    },
    {
      id: 'res_c',
      type: 'Resistor',
      name: 'Collector Resistor',
      value: 330,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 5, y: 1, orientation: 'vertical', adjustable: true, min: 10, max: 2000, step: 10, unit: 'Ω' }
    },
    {
      id: 'res_b',
      type: 'Resistor',
      name: 'Base Resistor',
      value: 1000,
      current: 0,
      voltageDrop: 0,
      metadata: { x: 3.5, y: 4, orientation: 'horizontal', adjustable: true, min: 100, max: 10000, step: 100, unit: 'Ω' }
    },
    {
      id: 'led1',
      type: 'LED',
      name: 'Output LED',
      value: 2, // forward drop
      current: 0,
      voltageDrop: 0,
      metadata: { x: 5, y: 2.5, orientation: 'vertical', color: 'green' }
    },
    {
      id: 'trans1',
      type: 'TransistorNPN',
      name: 'NPN Transistor',
      value: 0.7, // Base-Emitter voltage drop
      current: 0,
      voltageDrop: 0,
      metadata: { x: 4.9333, y: 4, orientation: 'horizontal' }
    }
  ],
  wirePaths: [
    { from: 'bat1_top', to: 'res_c_top', currentSourceId: 'bat1', path: [{x: 1, y: 3}, {x: 1, y: 0.5}, {x: 5, y: 0.5}, {x: 5, y: 1}] },
    { from: 'res_c_bot', to: 'led1_top', currentSourceId: 'bat1', path: [{x: 5, y: 1}, {x: 5, y: 2.5}] },
    { from: 'led1_bot', to: 'trans1_c', currentSourceId: 'bat1', path: [{x: 5, y: 2.5}, {x: 5, y: 4}] },
    { from: 'trans1_e', to: 'bat1_bot', currentSourceId: 'trans1', path: [{x: 5, y: 4}, {x: 5, y: 5.5}, {x: 1, y: 5.5}, {x: 1, y: 3}] },
    { from: 'bat2_top', to: 'res_b_left', currentSourceId: 'bat2', path: [{x: 2.5, y: 5.0}, {x: 2.5, y: 4}, {x: 3.5, y: 4}] },
    { from: 'res_b_right', to: 'trans1_b', currentSourceId: 'bat2', path: [{x: 3.5, y: 4}, {x: 4.9333, y: 4}] },
    { from: 'bat2_bot', to: 'gnd', currentSourceId: 'bat2', path: [{x: 2.5, y: 5.0}, {x: 2.5, y: 5.5}] }
  ],
  update: (components) => {
    const vcc = components.find(c => c.id === 'bat1')!;
    const vbb = components.find(c => c.id === 'bat2')!;
    const rc = components.find(c => c.id === 'res_c')!;
    const rb = components.find(c => c.id === 'res_b')!;
    const led = components.find(c => c.id === 'led1')!;
    const npn = components.find(c => c.id === 'trans1')!;

    // Simple NPN model:
    // If Vbb > Vbe (0.7V), base current Ib flows.
    // Collector current Ic = Beta * Ib, up to saturation.
    const beta = 100; // Gain
    const Vbe = npn.value;
    
    let Ib = 0;
    if (vbb.value > Vbe) {
      Ib = (vbb.value - Vbe) / rb.value;
    }

    let Ic = 0;
    let Vce = vcc.value; // Voltage drop across Collector-Emitter

    if (Ib > 0) {
      // Calculate max possible Ic (Saturation)
      const maxIc = Math.max(0, (vcc.value - led.value) / rc.value);
      
      // Active region Ic
      const activeIc = beta * Ib;

      // Actual Ic is the minimum of saturation and active
      Ic = Math.min(activeIc, maxIc);
      Vce = Math.max(0.2, vcc.value - led.value - (Ic * rc.value)); // min Vce is saturation voltage ~0.2V
    }

    return components.map(c => {
      if (c.id === 'bat1') return { ...c, current: Ic, voltageDrop: vcc.value };
      if (c.id === 'bat2') return { ...c, current: Ib, voltageDrop: vbb.value };
      if (c.id === 'res_c') return { ...c, current: Ic, voltageDrop: Ic * rc.value };
      if (c.id === 'res_b') return { ...c, current: Ib, voltageDrop: Ib * rb.value };
      if (c.id === 'led1') return { ...c, current: Ic, voltageDrop: Ic > 0 ? led.value : 0 };
      if (c.id === 'trans1') return { ...c, current: Ic, voltageDrop: Vce };
      return c;
    });
  }
};
