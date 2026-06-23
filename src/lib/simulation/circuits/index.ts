import { simpleSeriesCircuit } from './simpleSeries';
import { simpleTransistorCircuit } from './simpleTransistor';
import { simpleParallelCircuit } from './parallelCircuit';
import { ohmsLawSeriesCircuit } from './ohmsLawSeries';
import { seriesParallelComparison } from './seriesParallelComparison';
import { seriesRulesCircuit } from './seriesRules';
import { CircuitModel } from '../types';

export const predefinedCircuits: Record<string, CircuitModel> = {
  [simpleSeriesCircuit.id]: simpleSeriesCircuit,
  [simpleTransistorCircuit.id]: simpleTransistorCircuit,
  [simpleParallelCircuit.id]: simpleParallelCircuit,
  [ohmsLawSeriesCircuit.id]: ohmsLawSeriesCircuit,
  [seriesParallelComparison.id]: seriesParallelComparison,
  [seriesRulesCircuit.id]: seriesRulesCircuit,
};

export const getCircuitList = () => Object.values(predefinedCircuits);
