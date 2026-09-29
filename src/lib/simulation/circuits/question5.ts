import { CircuitModel } from '../types';

export const question5Circuit: CircuitModel = {
  id: 'question-5',
  name: 'Question 5',
  description: 'SQA National 5 Exam Circuit: Determine which lamps are lit when switch S2 is closed and switch S3 is open.',
  sqaNotes: `SQA National 5 Physics - Question 5:

"In the circuit shown, the battery supplies current to three identical lamps L1, L2, and L3.
Switches S1 and S2 are closed, and switch S3 is open.
Which lamps are lit?"

Solution & Explanation:
• Lamps L1 and L2 are LIT.
• Lamp L3 is UNLIT.

Why?
1. Follow the current from the positive terminal (left) of the battery: Current flows into the left vertical rail.
2. At the rail, switch S3 is OPEN, so no current can pass through the bottom branch containing Lamp L3 (L3 is UNLIT).
3. Switch S2 is CLOSED, so current flows through the middle branch and through Lamp L2, lighting it.
4. Current from Lamp L2 reaches the right vertical rail and travels up to the top branch.
5. All returning current MUST pass through Lamp L1 and closed switch S1 to get back to the negative terminal of the battery. Therefore, Lamp L1 is also LIT!

Interactive Experiment:
• Click switch S3 to close it: Notice that Lamp L3 lights up, and Lamp L1 glows even brighter because the total circuit resistance decreased!
• Click switch S2 to open it: Notice what happens when only S3 is closed.
• Open switch S1: Notice that everything goes out!`,
  components: [
    // Top line
    { 
      id: 'bat1', 
      type: 'Battery', 
      name: 'Power Supply', 
      value: 12, 
      current: 0.6, 
      voltageDrop: 12, 
      metadata: { x: 5, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'sw1', 
      type: 'Switch', 
      name: 'S1 closed', 
      value: 1, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 8, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'lamp1', 
      type: 'Lamp', 
      name: 'L1 lit', 
      value: 10, 
      current: 0.6, 
      voltageDrop: 6, 
      metadata: { x: 11, y: 2, orientation: 'horizontal', labelPos: 'top' } 
    },

    // Middle line
    { 
      id: 'sw2', 
      type: 'Switch', 
      name: 'S2 closed', 
      value: 1, 
      current: 0.6, 
      voltageDrop: 0, 
      metadata: { x: 6, y: 5, orientation: 'horizontal', labelPos: 'top' } 
    },
    { 
      id: 'lamp2', 
      type: 'Lamp', 
      name: 'L2 lit', 
      value: 10, 
      current: 0.6, 
      voltageDrop: 6, 
      metadata: { x: 10, y: 5, orientation: 'horizontal', labelPos: 'top' } 
    },

    // Bottom line
    { 
      id: 'sw3', 
      type: 'Switch', 
      name: 'S3 open', 
      value: 0, 
      current: 0, 
      voltageDrop: 6, 
      metadata: { x: 6, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
    { 
      id: 'lamp3', 
      type: 'Lamp', 
      name: 'L3', 
      value: 10, 
      current: 0, 
      voltageDrop: 0, 
      metadata: { x: 10, y: 8, orientation: 'horizontal', labelPos: 'bottom' } 
    },
  ],
  wirePaths: [
    // Top line wires
    { from: 'bat1', to: 'bat1', currentSourceId: 'bat1', path: [{ x: 3, y: 2 }, { x: 5, y: 2 }] },
    { from: 'bat1', to: 'sw1', currentSourceId: 'bat1', path: [{ x: 5, y: 2 }, { x: 8, y: 2 }] },
    { from: 'sw1', to: 'lamp1', currentSourceId: 'lamp1', path: [{ x: 8, y: 2 }, { x: 11, y: 2 }] },
    { from: 'lamp1', to: 'lamp1', currentSourceId: 'lamp1', path: [{ x: 11, y: 2 }, { x: 13, y: 2 }] },

    // Middle line wires
    { from: 'bat1', to: 'sw2', currentSourceId: 'lamp2', path: [{ x: 3, y: 5 }, { x: 6, y: 5 }] },
    { from: 'sw2', to: 'lamp2', currentSourceId: 'lamp2', path: [{ x: 6, y: 5 }, { x: 10, y: 5 }] },
    { from: 'lamp2', to: 'lamp1', currentSourceId: 'lamp2', path: [{ x: 10, y: 5 }, { x: 13, y: 5 }] },

    // Bottom line wires
    { from: 'bat1', to: 'sw3', currentSourceId: 'lamp3', path: [{ x: 3, y: 8 }, { x: 6, y: 8 }] },
    { from: 'sw3', to: 'lamp3', currentSourceId: 'lamp3', path: [{ x: 6, y: 8 }, { x: 10, y: 8 }] },
    { from: 'lamp3', to: 'lamp1', currentSourceId: 'lamp3', path: [{ x: 10, y: 8 }, { x: 13, y: 8 }] },

    // Left vertical rail
    { from: 'bat1', to: 'sw2', currentSourceId: 'bat1', path: [{ x: 3, y: 2 }, { x: 3, y: 5 }] },
    { from: 'sw2', to: 'sw3', currentSourceId: 'lamp3', path: [{ x: 3, y: 5 }, { x: 3, y: 8 }] },

    // Right vertical rail
    { from: 'lamp2', to: 'lamp1', currentSourceId: 'bat1', path: [{ x: 13, y: 5 }, { x: 13, y: 2 }] },
    { from: 'lamp3', to: 'lamp2', currentSourceId: 'lamp3', path: [{ x: 13, y: 8 }, { x: 13, y: 5 }] },
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
    const vBat = bat.value || 12;

    let iTotal = 0;
    let iLamp1 = 0;
    let iLamp2 = 0;
    let iLamp3 = 0;
    let vLamp1 = 0;
    let vLamp2 = 0;
    let vLamp3 = 0;

    if (s1Closed) {
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
        case 'sw2':
          return { 
            ...c, 
            name: s2Closed ? 'S2 closed' : 'S2 open', 
            current: iLamp2, 
            voltageDrop: s2Closed ? 0 : (s1Closed ? (vBat - vLamp1) : 0) 
          };
        case 'sw3':
          return { 
            ...c, 
            name: s3Closed ? 'S3 closed' : 'S3 open', 
            current: iLamp3, 
            voltageDrop: s3Closed ? 0 : (s1Closed ? (vBat - vLamp1) : 0) 
          };
        case 'lamp1':
          return { 
            ...c, 
            name: iLamp1 > 0 ? 'L1 lit' : 'L1 (unlit)', 
            current: iLamp1, 
            voltageDrop: vLamp1 
          };
        case 'lamp2':
          return { 
            ...c, 
            name: iLamp2 > 0 ? 'L2 lit' : 'L2 (unlit)', 
            current: iLamp2, 
            voltageDrop: vLamp2 
          };
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
