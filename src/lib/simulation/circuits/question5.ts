import { CircuitModel } from '../types';

export const question5Circuit: CircuitModel = {
  id: 'question-5',
  name: 'Question 5',
  description: 'SQA National 5 Exam Circuit: Demonstrates how current behaves in series and parallel. Use the slider to vary current and click switches to test branches!',
  sqaNotes: `SQA National 5 Physics - Question 5 & Current Rules:

1. THE EXAM QUESTION:
"In the circuit shown, the battery supplies current to three identical lamps L1, L2, and L3.
Switches S1 and S2 are closed, and switch S3 is open.
Which lamps are lit?"

Answer:
• Lamps L1 and L2 are LIT.
• Lamp L3 is UNLIT.

2. HOW CURRENT WORKS IN SERIES:
• Lamp L1 and Ammeter A1 are in the main trunk in SERIES with the battery.
• In the initial state (S2 closed, S3 open), there is only one continuous path through L2 and L1.
• Look at the ammeters: Ammeter A1 and Ammeter A2 read the EXACT same current!
  Formula: I_total = I_1 = I_2 (Current is identical everywhere in series).

3. HOW CURRENT WORKS IN PARALLEL:
• Click switch S3 to CLOSE it!
• Look at the ammeters now:
  Ammeter A1 = Ammeter A2 + Ammeter A3
• The current leaving the battery passes through series Lamp L1, and then SPLITS evenly between parallel branches 2 and 3!
  Formula: I_total = I_branch1 + I_branch2 (Current splits across parallel branches).
• Notice that adding the parallel branch dropped the total resistance (from 20 Ω to 15 Ω), so total current increased and Lamp L1 glows even brighter!

4. CURRENT VARIABLE SLIDER:
• Use the "Power Supply (Current Control)" slider in the left sidebar to increase or decrease the voltage (0 V – 24 V).
• Watch how the current scales across all branches in real time while maintaining the series and parallel rules!`,
  components: [
    // Top line (Main series trunk)
    { 
      id: 'bat1', 
      type: 'Battery', 
      name: 'Power Supply (Current Control)', 
      value: 12, 
      current: 0.6, 
      voltageDrop: 12, 
      metadata: { x: 4.5, y: 2, orientation: 'horizontal', labelPos: 'top', adjustable: true, min: 0, max: 24, step: 1, unit: 'V' } 
    },
    { 
      id: 'sw1', 
      type: 'Switch', 
      name: 'S1 closed', 
      value: 1, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 7.5, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'am1', 
      type: 'Ammeter', 
      name: 'A1 (Series Current)', 
      value: 0, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 10.5, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'lamp1', 
      type: 'Lamp', 
      name: 'L1 lit', 
      value: 10, 
      current: 0.6, 
      voltageDrop: 6, 
      metadata: { x: 13.5, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },

    // Middle line (Parallel branch 2)
    { 
      id: 'sw2', 
      type: 'Switch', 
      name: 'S2 closed', 
      value: 1, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 5.5, y: 5, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'am2', 
      type: 'Ammeter', 
      name: 'A2 (Branch 2 Current)', 
      value: 0, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 8.5, y: 5, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'lamp2', 
      type: 'Lamp', 
      name: 'L2 lit', 
      value: 10, 
      current: 0.6, 
      voltageDrop: 6, 
      metadata: { x: 12, y: 5, orientation: 'horizontal', labelPos: 'top' } 
    },

    // Bottom line (Parallel branch 3)
    { 
      id: 'sw3', 
      type: 'Switch', 
      name: 'S3 open', 
      value: 0, 
      current: 0, 
      voltageDrop: 6, 
      metadata: { x: 5.5, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
    { 
      id: 'am3', 
      type: 'Ammeter', 
      name: 'A3 (Branch 3 Current)', 
      value: 0, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 8.5, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
    { 
      id: 'lamp3', 
      type: 'Lamp', 
      name: 'L3', 
      value: 10, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 12, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
  ],
  wirePaths: [
    // Top line wires
    { from: 'bat1', to: 'bat1', currentSourceId: 'bat1', path: [{ x: 2, y: 2 }, { x: 4.5, y: 2 }] },
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{ x: 4.5, y: 2 }, { x: 7.5, y: 2 }] },
    { from: 'sw1', to: 'am1', currentSourceId: 'bat1', path: [{ x: 7.5, y: 2 }, { x: 10.5, y: 2 }] },
    { from: 'am1', to: 'lamp1', currentSourceId: 'lamp1', path: [{ x: 10.5, y: 2 }, { x: 13.5, y: 2 }] },
    { from: 'lamp1', to: 'lamp1', currentSourceId: 'lamp1', path: [{ x: 13.5, y: 2 }, { x: 15.5, y: 2 }] },

    // Middle line wires
    { from: 'bat1', to: 'sw2', currentSourceId: 'lamp2', path: [{ x: 2, y: 5 }, { x: 5.5, y: 5 }] },
    { from: 'sw2', to: 'am2', currentSourceId: 'lamp2', path: [{ x: 5.5, y: 5 }, { x: 8.5, y: 5 }] },
    { from: 'am2', to: 'lamp2', currentSourceId: 'lamp2', path: [{ x: 8.5, y: 5 }, { x: 12, y: 5 }] },
    { from: 'lamp2', to: 'lamp1', currentSourceId: 'lamp2', path: [{ x: 12, y: 5 }, { x: 15.5, y: 5 }] },

    // Bottom line wires
    { from: 'bat1', to: 'sw3', currentSourceId: 'lamp3', path: [{ x: 2, y: 8 }, { x: 5.5, y: 8 }] },
    { from: 'sw3', to: 'am3', currentSourceId: 'lamp3', path: [{ x: 5.5, y: 8 }, { x: 8.5, y: 8 }] },
    { from: 'am3', to: 'lamp3', currentSourceId: 'lamp3', path: [{ x: 8.5, y: 8 }, { x: 12, y: 8 }] },
    { from: 'lamp3', to: 'lamp1', currentSourceId: 'lamp3', path: [{ x: 12, y: 8 }, { x: 15.5, y: 8 }] },

    // Left vertical rail
    { from: 'bat1', to: 'sw2', currentSourceId: 'bat1', path: [{ x: 2, y: 2 }, { x: 2, y: 5 }] },
    { from: 'sw2', to: 'sw3', currentSourceId: 'lamp3', path: [{ x: 2, y: 5 }, { x: 2, y: 8 }] },

    // Right vertical rail
    { from: 'lamp2', to: 'lamp1', currentSourceId: 'bat1', path: [{ x: 15.5, y: 5 }, { x: 15.5, y: 2 }] },
    { from: 'lamp3', to: 'lamp2', currentSourceId: 'lamp3', path: [{ x: 15.5, y: 8 }, { x: 15.5, y: 5 }] },
  ],
  update: (components) => {
    const bat = components.find(c => c.id === 'bat1')!;
    const sw1 = components.find(c => c.id === 'sw1')!;
    const sw2 = components.find(c => c.id === 'sw2')!;
    const sw3 = components.find(c => c.id === 'sw3')!;

    const s1Closed = sw1.value === 1;
    const s2Closed = sw2.value === 1;
    const s3Closed = sw3.value === 1;

    const rLamp = 10;
    const vBat = typeof bat.value === 'number' ? bat.value : 12;

    let iTotal = 0;
    let iLamp1 = 0;
    let iLamp2 = 0;
    let iLamp3 = 0;
    let vLamp1 = 0;
    let vLamp2 = 0;
    let vLamp3 = 0;

    if (s1Closed && vBat > 0) {
      if (s2Closed && s3Closed) {
        // Both parallel branches active: Rp = 5 Ω, Rtotal = 15 Ω
        const rTotal = rLamp + (rLamp / 2);
        iTotal = vBat / rTotal;
        iLamp1 = iTotal;
        vLamp1 = iLamp1 * rLamp;
        iLamp2 = iTotal / 2;
        vLamp2 = vBat - vLamp1;
        iLamp3 = iTotal / 2;
        vLamp3 = vBat - vLamp1;
      } else if (s2Closed && !s3Closed) {
        // Only middle branch active: L1 & L2 in series, Rtotal = 20 Ω
        const rTotal = rLamp * 2;
        iTotal = vBat / rTotal;
        iLamp1 = iTotal;
        vLamp1 = iLamp1 * rLamp;
        iLamp2 = iTotal;
        vLamp2 = iLamp2 * rLamp;
        iLamp3 = 0;
        vLamp3 = 0;
      } else if (!s2Closed && s3Closed) {
        // Only bottom branch active: L1 & L3 in series, Rtotal = 20 Ω
        const rTotal = rLamp * 2;
        iTotal = vBat / rTotal;
        iLamp1 = iTotal;
        vLamp1 = iLamp1 * rLamp;
        iLamp2 = 0;
        vLamp2 = 0;
        iLamp3 = iTotal;
        vLamp3 = iLamp3 * rLamp;
      } else {
        // Neither parallel branch is closed: circuit is open
        iTotal = 0;
        iLamp1 = 0;
        iLamp2 = 0;
        iLamp3 = 0;
      }
    }

    return components.map(c => {
      switch (c.id) {
        case 'bat1':
          return { ...c, current: iTotal, voltageDrop: vBat };
        case 'sw1':
          return { 
            ...c, 
            name: s1Closed ? 'S1 (closed)' : 'S1 (open)', 
            current: iTotal, 
            voltageDrop: s1Closed ? 0 : vBat 
          };
        case 'am1':
          return { ...c, current: iTotal, voltageDrop: 0 };
        case 'lamp1':
          return { 
            ...c, 
            name: iLamp1 > 0 ? 'L1 lit' : 'L1 (unlit)', 
            current: iLamp1, 
            voltageDrop: vLamp1 
          };
        case 'sw2':
          return { 
            ...c, 
            name: s2Closed ? 'S2 closed' : 'S2 open', 
            current: iLamp2, 
            voltageDrop: s2Closed ? 0 : (s1Closed ? (vBat - vLamp1) : 0) 
          };
        case 'am2':
          return { ...c, current: iLamp2, voltageDrop: 0 };
        case 'lamp2':
          return { 
            ...c, 
            name: iLamp2 > 0 ? 'L2 lit' : 'L2 (unlit)', 
            current: iLamp2, 
            voltageDrop: vLamp2 
          };
        case 'sw3':
          return { 
            ...c, 
            name: s3Closed ? 'S3 closed' : 'S3 open', 
            current: iLamp3, 
            voltageDrop: s3Closed ? 0 : (s1Closed ? (vBat - vLamp1) : 0) 
          };
        case 'am3':
          return { ...c, current: iLamp3, voltageDrop: 0 };
        case 'lamp3':
          return { 
            ...c, 
            name: iLamp3 > 0 ? 'L3 lit' : 'L3 (unlit)', 
            current: iLamp3, 
            voltageDrop: vLamp3 
          };
        default:
          return c;
      }
    });
  }
};
