import { CircuitModel, CircuitComponent } from '../types';

export const waterAnalogyCircuit: CircuitModel = {
  id: 'water-analogy',
  name: 'Water Circuit Analogy',
  description: 'Water pressure and pipe flow analogy for Ohm\'s Law: explore how pressure difference (voltage), pipe restriction (resistance), and water flow rate (current) interact.',
  metadata: {
    isWater: true,
  },
  sqaNotes: `The Hydraulic (Water) Analogy for Electrical Circuits:

"Water pressure is such a useful analogy for potential difference (voltage) in electrical circuits. Current, rather than charge, is how fast the water is flowing."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ANALOGY MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Electrical Circuit            Water System
----------------------------------------------------
Charge (Q)                   Quantity of water (litres)
Current (I)                  Flow rate of water (litres per second)
Potential difference (V)     Pressure difference driving the water
Resistance (R)               Restriction in the pipe, such as a narrow section
Power Source (Battery)       Water Pump (creates pressure difference)
Switch                       Control Valve / Tap (opens or shuts flow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY VOLTAGE IS LIKE PRESSURE:
Imagine two pipes carrying water at the same flow rate, but under different pressure differences:
• In the first pipe, water flows at a relatively low pressure difference.
• In the second, water flows at the same rate but under a much higher pressure difference.
The second system can transfer more energy each second, despite the same amount of water flowing.

This is analogous to electricity:
• 2 A at 3 V transfers 6 joules per second (6 Watts).
• 2 A at 12 V transfers 24 joules per second (24 Watts).
The higher voltage means more energy is transferred per coulomb (V = E / Q).

HOW OHM'S LAW CONNECTS THE THREE:
Just as increasing water pressure generally increases the flow rate through a given pipe, increasing voltage generally increases the current through a fixed resistance:

        I = V / R
        I = 12.0 V / 6.0 Ω = 2.00 A
        (Flow Rate = Pressure / Restriction = 12.0 bar / 6.0 = 2.00 L/s)

WHY THE ANALOGY IS SO POWERFUL:
The analogy isn't perfect: voltage is specifically a difference in electric potential, just as water flow is driven by a pressure difference, rather than pressure alone.

KEY TEACHING SUMMARY:
"Charge is the water, current is how much water flows past a point each second, and potential difference is the pressure difference that drives the flow and determines the energy transferred per unit of charge."

TRY IT OUT:
1. Increase the Water Pump Pressure slider: watch the water flow rate (current) speed up!
2. Increase the Pipe Restriction slider: watch the narrowed pipe reduce the flow rate!
3. Click the Control Valve to shut off the water completely!`,
  components: [
    // Water Pump (Battery)
    {
      id: 'pump1',
      type: 'Battery',
      name: 'Water Pump (Vs)',
      value: 12.0,
      current: 2.0,
      voltageDrop: 12.0,
      metadata: {
        x: 3,
        y: 3.5,
        orientation: 'vertical',
        adjustable: true,
        min: 0,
        max: 24,
        step: 0.5,
        unit: 'V',
        labelPos: 'left',
        waterRole: 'pump',
      },
    },
    // Control Valve (Switch)
    {
      id: 'valve1',
      type: 'Switch',
      name: 'Control Valve (Switch)',
      value: 1, // Open / Flowing by default
      current: 2.0,
      voltageDrop: 0,
      metadata: {
        x: 5.5,
        y: 1.5,
        orientation: 'horizontal',
        labelPos: 'top',
        waterRole: 'valve',
      },
    },
    // Flow Meter (Ammeter)
    {
      id: 'flowmeter1',
      type: 'Ammeter',
      name: 'Flow Meter (Current I)',
      value: 0,
      current: 2.0,
      voltageDrop: 0,
      metadata: {
        x: 8.5,
        y: 1.5,
        orientation: 'horizontal',
        labelPos: 'top',
        waterRole: 'flowmeter',
      },
    },
    // Pipe Constriction (Resistor)
    {
      id: 'constriction1',
      type: 'Resistor',
      name: 'Pipe Constriction (R)',
      value: 6.0,
      current: 2.0,
      voltageDrop: 12.0,
      metadata: {
        x: 11,
        y: 3.5,
        orientation: 'vertical',
        adjustable: true,
        min: 1,
        max: 20,
        step: 0.5,
        unit: 'Ω',
        labelPos: 'right',
        waterRole: 'constriction',
      },
    },
    // Pressure Gauge across Constriction (Voltmeter)
    {
      id: 'manometer1',
      type: 'Voltmeter',
      name: 'Pressure Gauge (ΔP)',
      value: 0,
      current: 0,
      voltageDrop: 12.0,
      metadata: {
        x: 13,
        y: 3.5,
        orientation: 'vertical',
        labelPos: 'right',
        waterRole: 'manometer',
      },
    },
  ],
  wirePaths: [
    // Pipe: Pump output up and across to Valve
    {
      from: 'pump1',
      to: 'valve1',
      currentSourceId: 'pump1',
      path: [{ x: 3, y: 3.5 }, { x: 3, y: 1.5 }, { x: 5.5, y: 1.5 }],
    },
    // Pipe: Valve across to Flow Meter
    {
      from: 'valve1',
      to: 'flowmeter1',
      currentSourceId: 'pump1',
      path: [{ x: 5.5, y: 1.5 }, { x: 8.5, y: 1.5 }],
    },
    // Pipe: Flow Meter across and down into Pipe Constriction
    {
      from: 'flowmeter1',
      to: 'constriction1',
      currentSourceId: 'pump1',
      path: [{ x: 8.5, y: 1.5 }, { x: 11, y: 1.5 }, { x: 11, y: 3.5 }],
    },
    // Pipe: Constriction output down and return across bottom to Pump intake
    {
      from: 'constriction1',
      to: 'pump1',
      currentSourceId: 'pump1',
      path: [{ x: 11, y: 3.5 }, { x: 11, y: 5.5 }, { x: 3, y: 5.5 }, { x: 3, y: 3.5 }],
    },

    // Manometer tap: High pressure side before constriction
    {
      from: 'constriction1',
      to: 'manometer1',
      currentSourceId: 'manometer1',
      path: [{ x: 11, y: 2.5 }, { x: 13, y: 2.5 }, { x: 13, y: 3.5 }],
    },
    // Manometer tap: Low pressure side after constriction
    {
      from: 'manometer1',
      to: 'constriction1',
      currentSourceId: 'manometer1',
      path: [{ x: 13, y: 3.5 }, { x: 13, y: 4.5 }, { x: 11, y: 4.5 }],
    },
  ],
  update: (components: CircuitComponent[]) => {
    const pump = components.find(c => c.id === 'pump1')!;
    const valve = components.find(c => c.id === 'valve1')!;
    const constriction = components.find(c => c.id === 'constriction1')!;

    const isOpen = valve.value === 1;
    const pressureDiff = pump.value || 0;
    const restriction = constriction.value || 1;

    // I = V / R (Flow Rate = Pressure / Restriction)
    const flowRate = isOpen && restriction > 0 ? pressureDiff / restriction : 0;
    const deltaP = isOpen ? pressureDiff : 0;
    const valveDeltaP = isOpen ? 0 : pressureDiff;

    return components.map(c => {
      switch (c.id) {
        case 'pump1':
          return { ...c, current: flowRate, voltageDrop: pressureDiff };
        case 'valve1':
          return {
            ...c,
            name: isOpen ? 'Control Valve (Open)' : 'Control Valve (Closed)',
            current: flowRate,
            voltageDrop: valveDeltaP,
          };
        case 'flowmeter1':
          return { ...c, current: flowRate, voltageDrop: 0 };
        case 'constriction1':
          return { ...c, current: flowRate, voltageDrop: deltaP };
        case 'manometer1':
          return { ...c, current: 0, voltageDrop: deltaP };
        default:
          return c;
      }
    });
  },
};
