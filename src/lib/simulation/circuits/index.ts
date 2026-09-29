// Preserved imports for potential re-animation
import { simpleSeriesCircuit } from './simpleSeries';
import { simpleTransistorCircuit } from './simpleTransistor';
import { simpleParallelCircuit } from './parallelCircuit';
import { seriesParallelComparison } from './seriesParallelComparison';

import { ohmsLawSeriesCircuit } from './ohmsLawSeries';
import { seriesRulesCircuit } from './seriesRules';
import { parallelRulesCircuit } from './parallelRules';
import { parallelResistanceCircuit } from './parallelResistance';
import { mixedResistanceCircuit } from './mixedResistance';
import { question5Circuit } from './question5';
import { CircuitModel } from '../types';

export const predefinedCircuits: Record<string, CircuitModel> = {
  [ohmsLawSeriesCircuit.id]: ohmsLawSeriesCircuit,
  [seriesRulesCircuit.id]: seriesRulesCircuit,
  [parallelRulesCircuit.id]: parallelRulesCircuit,
  [parallelResistanceCircuit.id]: parallelResistanceCircuit,
  [mixedResistanceCircuit.id]: mixedResistanceCircuit,
  [question5Circuit.id]: question5Circuit,
};

export const getCircuitList = () => Object.values(predefinedCircuits);
